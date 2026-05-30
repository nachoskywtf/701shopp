import { AdsEngine } from '../meta/adsEngine';

export class ProfitGuard {
  private adsEngine: AdsEngine;

  constructor() {
    this.adsEngine = new AdsEngine();
  }

  /**
   * Calcula el Margen Neto Real
   */
  calculateNetMargin(
    revenue: number,
    adSpend: number,
    cogs: number,
    packaging: number,
    gatewayPercentage: number = 0.03, // Transbank/MercadoPago ~3%
    shippingCost: number
  ): { netProfit: number, marginPercentage: number } {
    
    const gatewayFee = revenue * gatewayPercentage;
    const totalCosts = cogs + packaging + gatewayFee + shippingCost + adSpend;
    
    const netProfit = revenue - totalCosts;
    const marginPercentage = (netProfit / revenue) * 100;

    return {
      netProfit,
      marginPercentage
    };
  }

  /**
   * Botón de Pánico Financiero (Automático)
   * Analiza zonas geográficas y ejecuta Exclusión Dinámica en Meta si el margen está roto.
   */
  async auditCampaignProfitability(adSetId: string, regionData: any[]): Promise<void> {
    console.log(`[Profit Guard] Auditando rentabilidad para el Ad Set ${adSetId}...`);

    for (const region of regionData) {
      // Simulación: Si el costo de envío supera un umbral crítico en relación al ticket promedio, 
      // o el margen neto cae por debajo del 5% en esa región.
      const isLossMaking = region.marginPercentage < 5.0 || region.shippingCost > 15000;

      if (isLossMaking) {
        console.warn(`[Profit Guard] ALERTA ROJA en ${region.name}. Margen: ${region.marginPercentage}%. Ejecutando Exclusión Dinámica.`);
        
        // Código de región estándar para Meta (Ej: Magallanes -> 3822)
        const regionCode = region.metaRegionCode; 
        
        if (regionCode) {
          const success = await this.adsEngine.excludeRegionFromAdSet(adSetId, regionCode);
          if (success) {
            console.log(`[Profit Guard] ${region.name} neutralizada exitosamente.`);
          }
        }
      } else {
        console.log(`[Profit Guard] Región ${region.name} operando en márgenes saludables (${region.marginPercentage}%).`);
      }
    }
  }
}
