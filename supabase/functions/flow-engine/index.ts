import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  console.log("[Flow Engine] Iniciando escaneo de la cola de Webhooks...");

  try {
    // 1. Inicializar Supabase Client con Service Role para Bypass de RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Variables de entorno de Supabase no encontradas.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Extraer eventos pendientes de la cola
    const { data: events, error: fetchError } = await supabase
      .from("webhook_events")
      .select("*")
      .eq("status", "pending")
      .limit(50); // Procesar en lotes para evitar timeouts

    if (fetchError) {
      throw new Error(`Error leyendo webhook_events: ${fetchError.message}`);
    }

    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ message: "No hay eventos pendientes" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`[Flow Engine] Procesando ${events.length} eventos de pago...`);

    // 3. Iterar y liquidar cada evento
    for (const event of events) {
      try {
        const payload = event.payload || {};
        
        // Se asume que el payload de Flow trae un 'order_id' o 'commerceOrder'
        const orderId = payload.order_id || payload.commerceOrder;

        if (!orderId) {
          throw new Error("Payload no contiene un order_id válido.");
        }

        // A. Actualizar la orden a 'PAID' (o 'Pagado' según tu convención)
        const { error: updateOrderError } = await supabase
          .from("orders")
          .update({ status: "PAID" })
          .eq("id", orderId);

        if (updateOrderError) {
          throw new Error(`Error actualizando orden ${orderId}: ${updateOrderError.message}`);
        }

        // B. Marcar el evento como procesado
        await supabase
          .from("webhook_events")
          .update({ status: "processed" })
          .eq("id", event.id);
          
        console.log(`[Flow Engine] ✅ Orden ${orderId} liquidada exitosamente.`);

      } catch (err: any) {
        console.error(`[Flow Engine] ❌ Error procesando evento ${event.id}:`, err.message);
        
        // Marcar como error para no bloquear la cola (Dead Letter Queue)
        await supabase
          .from("webhook_events")
          .update({ status: "failed" })
          .eq("id", event.id);
      }
    }

    return new Response(JSON.stringify({ message: "Cola procesada correctamente", processed: events.length }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error("[Flow Engine] Colapso fatal del Engine:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
