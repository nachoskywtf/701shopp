import { Resend } from 'resend';

export class SupplyChainPredictor {
  private resend: Resend;
  private ceoEmail: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || '');
    this.ceoEmail = process.env.CEO_EMAIL || '';
  }

  /**
   * Evalúa todos los productos activos y genera borradores de compra si hay riesgo de quiebre.
   */
  async runInventoryAnalysis(inventoryData: any[]): Promise<void> {
    console.log("[Supply Chain Predictor] Corriendo análisis predictivo de inventario...");

    for (const product of inventoryData) {
      // Días restantes = Stock / Ventas Diarias
      const daysOfStockLeft = product.currentStock / product.velocityRate;
      
      // Si el tiempo de vida del stock es menor o igual al Lead Time + un buffer de 3 días de seguridad
      const safetyBufferDays = 3;
      if (daysOfStockLeft <= (product.supplierLeadTime + safetyBufferDays)) {
        console.warn(`[Supply Chain Predictor] PELIGRO DE QUIEBRE: ${product.name}. Stock para ${daysOfStockLeft.toFixed(1)} días. Lead Time: ${product.supplierLeadTime} días.`);
        
        await this.draftPurchaseOrder(product);
      }
    }
  }

  /**
   * Crea el borrador en la bandeja de correo vía Resend
   */
  private async draftPurchaseOrder(product: any): Promise<void> {
    // Calculamos cuánto pedir: Cubrir el Lead Time + 30 días de ventas proyectadas
    const restockAmount = Math.ceil(product.velocityRate * (product.supplierLeadTime + 30));

    const emailHtml = `
      <h2>Orden de Compra Sugerida - ${product.supplierName}</h2>
      <p>Estimado equipo de ${product.supplierName},</p>
      <p>Por medio del presente solicitamos la reposición de stock del siguiente SKU:</p>
      <ul>
        <li><strong>Producto:</strong> ${product.name}</li>
        <li><strong>Cantidad Requerida:</strong> ${restockAmount} unidades</li>
        <li><strong>Condición Comercial:</strong> Precio mayorista pactado</li>
      </ul>
      <p>Quedo a la espera de la factura proforma para proceder con la transferencia.</p>
      <br/>
      <p><em>*Correo generado autónomamente por Antigravity Core 701-Shop*</em></p>
    `;

    try {
      if (!process.env.RESEND_API_KEY) {
        console.log(`[Supply Chain Predictor] [MOCK] Borrador de correo generado para: ${product.name}. Cantidad sugerida: ${restockAmount}`);
        return;
      }

      await this.resend.emails.send({
        from: 'system@701-shop.com',
        to: [this.ceoEmail],
        subject: `[ACCIÓN REQUERIDA] Orden de Compra Sugerida - ${product.supplierName}`,
        html: emailHtml,
        // Nota: Resend no soporta nativamente "Drafts", pero lo enviamos a la bandeja del CEO para que él le dé 'Forward' al proveedor.
      });

      console.log(`[Supply Chain Predictor] Borrador para ${product.name} enviado con éxito a la bandeja del CEO.`);
    } catch (error) {
      console.error("[Supply Chain Predictor] Error enviando el draft vía Resend:", error);
    }
  }
}
