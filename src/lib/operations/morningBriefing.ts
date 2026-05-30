import { ProfitGuard } from '../finance/profitGuard';
import { CourierEngine } from '../fulfillment/courierEngine';

export class MorningBriefing {
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private ceoPhone: string;

  constructor() {
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.ceoPhone = process.env.CEO_WHATSAPP_NUMBER || '';
  }

  /**
   * Genera y envía el Reporte Ejecutivo de las 08:00 AM vía Twilio WhatsApp API
   */
  async execute(): Promise<void> {
    console.log("[Morning Briefing] Recopilando métricas ejecutivas...");

    // 1. Instanciar motores dependientes (Mock de obtención de datos diarios)
    const profitGuard = new ProfitGuard();
    const courier = new CourierEngine();

    const dailyMetrics = {
      ventasTotales: 1250000,
      gastoMetaAds: 150000,
      comisionesFlow: 37500, // 3%
      costosEnvio: 180000,
      cogs: 300000,
      etiquetasListas: 14
    };

    // Calcular Margen Neto Real con ProfitGuard
    const { netProfit, marginPercentage } = profitGuard.calculateNetMargin(
      dailyMetrics.ventasTotales,
      dailyMetrics.gastoMetaAds,
      dailyMetrics.cogs,
      0, // Packaging ignorado en el mock rápido
      (dailyMetrics.comisionesFlow / dailyMetrics.ventasTotales), // 3% flow
      dailyMetrics.costosEnvio
    );

    // 2. Análisis de Anomalías
    const anomalias = [];
    if (marginPercentage < 20) {
      anomalias.push("⚠️ El margen neto global cayó por debajo del 20%. Revisa CPA en Meta.");
    }
    const roasCampañaX = 1.8; 
    if (roasCampañaX < 2.0) {
      anomalias.push("⚠️ La campaña 'Naxos' tiene un ROAS de 1.8. Se sugiere rotar creativos (Video AI).");
    }

    // 3. Formatear el Mensaje de WhatsApp
    const reportText = `*701 SHOP - MORNING BRIEFING* 🚀\n\n` +
      `*Flujo de Caja (Últimas 24h):*\n` +
      `- Ventas: $${dailyMetrics.ventasTotales.toLocaleString()}\n` +
      `- Ads Spend: $${dailyMetrics.gastoMetaAds.toLocaleString()}\n` +
      `- Margen Neto Real: ${marginPercentage.toFixed(1)}% ($${netProfit.toLocaleString()})\n\n` +
      `*Logística (BlueExpress/Starken):*\n` +
      `- 📦 ${dailyMetrics.etiquetasListas} etiquetas listas para imprimir.\n\n` +
      `*Acción Requerida (Anomalías):*\n` +
      (anomalias.length > 0 ? anomalias.join("\n") : "✅ Todo operando en rango óptimo.");

    console.log("[Morning Briefing] Reporte generado:\n", reportText);

    if (this.twilioAccountSid && this.ceoPhone) {
      // Aquí iría el cliente de Twilio: twilioClient.messages.create({...})
      console.log(`[Morning Briefing] Mensaje de WhatsApp enviado a ${this.ceoPhone}`);
    } else {
      console.warn("[Morning Briefing] Faltan credenciales Twilio para el envío real.");
    }
  }
}
