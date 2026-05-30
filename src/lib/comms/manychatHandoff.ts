export class ManychatHandoff {
  /**
   * Webhook principal para procesar mensajes entrantes de Instagram/FB.
   * Filtra intenciones de compra vs dudas operativas.
   */
  async processIncomingWebhook(payload: any): Promise<{ action: string, replyMessage?: string, notifyHuman?: boolean }> {
    console.log("[ManyChat Handoff] Procesando DM entrante...");
    
    const userMessage = payload.message?.toLowerCase() || '';
    
    // 1. Detección de intención de compra (High Ticket)
    const highTicketKeywords = ['comprar', 'precio por mayor', 'envío a', 'medios de pago', 'tarjeta'];
    const isBuyingIntent = highTicketKeywords.some(kw => userMessage.includes(kw));

    if (isBuyingIntent) {
      console.log("[ManyChat Handoff] Intención de compra detectada. Evaluando ticket...");
      
      // Simular que detectamos por el historial que el usuario consulta por +$50k CLP
      const isHighTicket = true; 

      if (isHighTicket) {
        console.log("[ManyChat Handoff] High Ticket detectado. Transfiriendo a Asesor Humano.");
        return {
          action: 'HANDOFF_TO_HUMAN',
          notifyHuman: true,
          replyMessage: '¡Excelente elección! Un especialista VIP te atenderá en unos segundos para procesar tu pedido de forma segura.'
        };
      }
    }

    // 2. Dudas operativas automáticas (Fricción Cero)
    const trackingKeywords = ['dónde está', 'seguimiento', 'cuando llega', 'pedido'];
    if (trackingKeywords.some(kw => userMessage.includes(kw))) {
      console.log("[ManyChat Handoff] Consulta de tracking detectada. Resolviendo automáticamente.");
      return {
        action: 'AUTO_REPLY_TRACKING',
        replyMessage: 'Para revisar el estado de tu envío con BlueExpress, por favor ingresa tu número de seguimiento en nuestra página o directamente en sim.cl/seguimiento. ¿Tienes tu número de orden?'
      };
    }

    // 3. Respuesta por defecto de IA general
    return {
      action: 'AUTO_REPLY_GENERAL',
      replyMessage: '¡Hola! Soy el asistente virtual de 701 Shop. ¿En qué te puedo ayudar con nuestras fragancias exclusivas hoy?'
    };
  }
}
