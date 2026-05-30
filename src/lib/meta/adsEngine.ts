import axios from 'axios';
import { analyzeFirstPartyData } from '../core/dataSynapse';

export class AdsEngine {
  private accessToken: string;
  private adAccountId: string;
  private pixelId: string;
  private apiVersion = 'v19.0';
  private baseUrl: string;

  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN || '';
    this.adAccountId = process.env.META_AD_ACCOUNT_ID || '';
    this.pixelId = process.env.META_PIXEL_ID || '';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

    if (!this.accessToken || !this.adAccountId) {
      console.warn("[Meta Ads] Faltan variables de entorno META_ACCESS_TOKEN o META_AD_ACCOUNT_ID.");
    }
  }

  /**
   * Crea una nueva Campaña de Conversión
   */
  async createCampaign(name: string, dailyBudget: number): Promise<string> {
    console.log(`[Meta Ads] Creando campaña: ${name}`);
    
    try {
      const response = await axios.post(`${this.baseUrl}/act_${this.adAccountId}/campaigns`, {
        name,
        objective: 'OUTCOME_SALES',
        status: 'PAUSED', // Se crea pausada por seguridad
        special_ad_categories: [],
        daily_budget: dailyBudget * 100, // En centavos
        access_token: this.accessToken
      });

      console.log(`[Meta Ads] Campaña creada con ID: ${response.data.id}`);
      return response.data.id;
    } catch (error: any) {
      console.error("[Meta Ads] Error creando campaña:", error.response?.data || error.message);
      throw new Error("Fallo al crear la campaña en Meta.");
    }
  }

  /**
   * Crea un Ad Set segmentado a todo Chile
   */
  async createAdSet(campaignId: string, name: string): Promise<string> {
    console.log(`[Meta Ads] Creando Ad Set (Segmentación Nacional Chile): ${name}`);
    
    try {
      const response = await axios.post(`${this.baseUrl}/act_${this.adAccountId}/adsets`, {
        name,
        campaign_id: campaignId,
        status: 'PAUSED',
        targeting: {
          geo_locations: {
            countries: ['CL'] // Chile
          },
          age_min: 18,
          age_max: 65
        },
        optimization_goal: 'OFFSITE_CONVERSIONS',
        billing_event: 'IMPRESSIONS',
        promoted_object: {
          pixel_id: this.pixelId,
          custom_event_type: 'PURCHASE'
        },
        access_token: this.accessToken
      });

      console.log(`[Meta Ads] Ad Set creado con ID: ${response.data.id}`);
      return response.data.id;
    } catch (error: any) {
      console.error("[Meta Ads] Error creando Ad Set:", error.response?.data || error.message);
      throw new Error("Fallo al crear el Ad Set en Meta.");
    }
  }

  /**
   * Crea un Ad creativo usando RAG/Veo Output
   */
  async createAd(adSetId: string, pageId: string, name: string, videoId: string, copy: string): Promise<string> {
    console.log(`[Meta Ads] Creando Ad para el Set ${adSetId}`);
    
    try {
      // 1. Crear el Ad Creative
      const creativeRes = await axios.post(`${this.baseUrl}/act_${this.adAccountId}/adcreatives`, {
        name: `${name} - Creative`,
        object_story_spec: {
          page_id: pageId,
          video_data: {
            video_id: videoId,
            message: copy,
            call_to_action: {
              type: 'SHOP_NOW'
            }
          }
        },
        access_token: this.accessToken
      });

      const creativeId = creativeRes.data.id;

      // 2. Crear el Ad final
      const adRes = await axios.post(`${this.baseUrl}/act_${this.adAccountId}/ads`, {
        name,
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status: 'PAUSED',
        access_token: this.accessToken
      });

      console.log(`[Meta Ads] Ad creado con ID: ${adRes.data.id}`);
      return adRes.data.id;
    } catch (error: any) {
      console.error("[Meta Ads] Error creando Ad:", error.response?.data || error.message);
      throw new Error("Fallo al crear el Ad en Meta.");
    }
  }

  /**
   * Validación de Píxel y CAPI
   */
  async validatePixelAndCAPI(): Promise<{ pixelActive: boolean, capiReceivingPurchase: boolean }> {
    console.log(`[Meta Ads] Validando salud del Píxel (${this.pixelId}) y CAPI...`);
    
    try {
      // Validar si el pixel existe y está recibiendo eventos recientes a través de la API
      const response = await axios.get(`${this.baseUrl}/${this.pixelId}/stats`, {
        params: {
          aggregation: 'custom_data_field',
          access_token: this.accessToken
        }
      });

      const data = response.data.data || [];
      const hasPurchaseEvent = data.some((stat: any) => stat.value === 'Purchase' || stat.event === 'Purchase');

      return {
        pixelActive: data.length > 0,
        capiReceivingPurchase: hasPurchaseEvent
      };
    } catch (error: any) {
      console.warn("[Meta Ads] Error validando Píxel/CAPI:", error.response?.data?.error?.message || error.message);
      // Retornar falso por defecto si hay error en la validación
      return { pixelActive: false, capiReceivingPurchase: false };
    }
  }

  /**
   * Módulo 13 (Profit Guard): Excluye dinámicamente una región geográfica de un Ad Set
   * Mantiene viva la campaña pero bloquea zonas no rentables.
   */
  async excludeRegionFromAdSet(adSetId: string, regionCode: string): Promise<boolean> {
    console.log(`[Meta Ads] Profit Guard: Excluyendo región ${regionCode} del Ad Set ${adSetId}...`);
    
    try {
      // 1. Obtener la configuración actual de targeting
      const adSetRes = await axios.get(`${this.baseUrl}/${adSetId}`, {
        params: {
          fields: 'targeting',
          access_token: this.accessToken
        }
      });

      const currentTargeting = adSetRes.data.targeting || {};
      const currentExcludedRegions = currentTargeting.geo_locations?.excluded_regions || [];
      
      // 2. Agregar la nueva región (Evitando duplicados si ya está excluida)
      const isAlreadyExcluded = currentExcludedRegions.some((r: any) => r.key === regionCode);
      
      if (!isAlreadyExcluded) {
        currentExcludedRegions.push({ key: regionCode });
        
        const newTargeting = {
          ...currentTargeting,
          geo_locations: {
            ...currentTargeting.geo_locations,
            excluded_regions: currentExcludedRegions
          }
        };

        // 3. Actualizar el Ad Set con el nuevo targeting
        await axios.post(`${this.baseUrl}/${adSetId}`, {
          targeting: newTargeting,
          access_token: this.accessToken
        });

        console.log(`[Meta Ads] Región ${regionCode} excluida exitosamente del Ad Set ${adSetId}.`);
      } else {
        console.log(`[Meta Ads] La región ${regionCode} ya estaba excluida. No se requiere acción.`);
      }

      return true;
    } catch (error: any) {
      console.error("[Meta Ads] Error excluyendo región dinámica:", error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Módulo Data Synapse (1PD): Cirugía de Presupuesto basada en ventas reales.
   * Duplica presupuesto en zonas High-Yield, reduce a la mitad en zonas Cold.
   */
  async optimizeBudgetBy1PD(campaignId: string): Promise<boolean> {
    console.log(`[Meta Ads - 1PD] Iniciando optimización autónoma para la campaña ${campaignId}...`);
    
    try {
      // 1. Obtener la inteligencia desde Supabase
      const synapseReport = await analyzeFirstPartyData();
      
      if (synapseReport.highYieldAreas.length === 0 && synapseReport.coldAreas.length === 0) {
        console.log('[Meta Ads - 1PD] No hay áreas extremas (High/Cold) para optimizar en este ciclo.');
        return true;
      }

      // 2. Obtener los Ad Sets de la campaña
      const adSetsRes = await axios.get(`${this.baseUrl}/${campaignId}/adsets`, {
        params: {
          fields: 'name,daily_budget,status',
          access_token: this.accessToken
        }
      });

      const adSets = adSetsRes.data.data || [];
      console.log(`[Meta Ads - 1PD] Encontrados ${adSets.length} Ad Sets.`);

      // 3. Ejecutar Cirugía de Presupuesto
      for (const adSet of adSets) {
        // Asumimos que el Ad Set contiene el nombre de la comuna (ej. "AdSet - Providencia")
        const adSetName = adSet.name.toUpperCase();
        
        const isHighYield = synapseReport.highYieldAreas.some(area => adSetName.includes(area));
        const isCold = synapseReport.coldAreas.some(area => adSetName.includes(area));

        const currentBudget = parseInt(adSet.daily_budget, 10);
        if (isNaN(currentBudget)) continue;

        let newBudget = currentBudget;

        if (isHighYield) {
          console.log(`[Meta Ads - 1PD] 🎯 HOT ZONE Detectada (${adSetName}). Duplicando presupuesto.`);
          newBudget = currentBudget * 2;
        } else if (isCold) {
          console.log(`[Meta Ads - 1PD] ❄️ COLD ZONE Detectada (${adSetName}). Reduciendo presupuesto al 50%.`);
          newBudget = Math.floor(currentBudget * 0.5);
        }

        // Si hay cambio de presupuesto, inyectar a la Graph API
        if (newBudget !== currentBudget) {
          await axios.post(`${this.baseUrl}/${adSet.id}`, {
            daily_budget: newBudget,
            access_token: this.accessToken
          });
          console.log(`[Meta Ads - 1PD] Ad Set ${adSet.id} actualizado: de $${currentBudget/100} a $${newBudget/100} diario.`);
        }
      }

      console.log('[Meta Ads - 1PD] Optimización quirúrgica completada.');
      return true;

    } catch (error: any) {
      console.error("[Meta Ads - 1PD] Error en cirugía de presupuesto:", error.response?.data || error.message);
      return false;
    }
  }
}

