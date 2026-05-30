import { AdsEngine } from './adsEngine';
import { products } from '../products';

export class DayOneLaunch {
  private engine: AdsEngine;

  constructor() {
    this.engine = new AdsEngine();
  }

  /**
   * Ejecuta el Protocolo de Liquidez Día 1 (Módulo 7)
   */
  async executeProtocol(): Promise<{ success: boolean; campaignId?: string; message: string }> {
    console.log("[Protocolo Día 1] Iniciando secuencia de lanzamiento nuclear...");

    try {
      // 1. Validar Píxel y CAPI
      const { pixelActive, capiReceivingPurchase } = await this.engine.validatePixelAndCAPI();
      
      if (!pixelActive) {
        console.warn("[Protocolo Día 1] Advertencia: Píxel de Meta inactivo o no detectado.");
        // Podríamos frenar el protocolo aquí, pero lo dejaremos continuar con un warning para el demo.
      }

      if (!capiReceivingPurchase) {
        console.warn("[Protocolo Día 1] Advertencia: CAPI no ha registrado eventos 'Purchase' recientes.");
      }

      // 2. Extraer Top 20 del catálogo (simulado ordenando por precio/margen o simplemente los primeros 20)
      const top20Products = products.slice(0, 20);
      console.log(`[Protocolo Día 1] Seleccionados ${top20Products.length} productos Top para arbitraje.`);

      // 3. Crear Campaña
      const dailyBudget = 50000; // 50.000 CLP diarios
      const campaignName = `[LÍQUIDEZ DÍA 1] Arbitraje Nacional - ${new Date().toISOString().split('T')[0]}`;
      const campaignId = await this.engine.createCampaign(campaignName, dailyBudget);

      // 4. Crear Ad Set Nacional (Chile)
      const adSetName = `[DÍA 1] Broad Nacional - CBO 50k`;
      const adSetId = await this.engine.createAdSet(campaignId, adSetName);

      // 5. Inyectar Creativos (simulados) y Direct Response Copy
      const pageId = process.env.META_PAGE_ID || '1234567890'; // Placeholder
      
      const copy = `🚨 ÚLTIMAS UNIDADES EN BODEGA NACIONAL 🚨\n\nNo pagues de más. Los mejores perfumes árabes y de diseñador al precio que mereces.\n\n✅ Envío Exprés a todo Chile\n✅ Garantía de Autenticidad\n✅ Pago Seguro\n\n👉 Haz clic en Comprar y asegura tu fragancia antes que se agote.`;

      // Simular iteración rápida para los top 3 para no saturar la API
      for (const product of top20Products.slice(0, 3)) {
        const adName = `[AD] ${product.brand} ${product.name} - Urgencia`;
        // Generar un ID de video falso para la API (Normalmente vendría de Veo o Swipe File)
        const dummyVideoId = `v_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        await this.engine.createAd(adSetId, pageId, adName, dummyVideoId, copy);
      }

      console.log("[Protocolo Día 1] Lanzamiento nuclear completado. Campaña en revisión.");
      
      return { 
        success: true, 
        campaignId,
        message: "Campaña de liquidez inyectada con éxito en Meta." 
      };

    } catch (error: any) {
      console.error("[Protocolo Día 1] Falla Crítica en lanzamiento:", error);
      return {
        success: false,
        message: `Error inyectando pauta: ${error.message}`
      };
    }
  }
}
