import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  console.log("[Cart Recovery] Iniciando escaneo de carritos abandonados...");

  try {
    // 1. Inicializar Supabase Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Variables de entorno de Supabase no encontradas.");
    }
    
    if (!resendApiKey) {
      throw new Error("Variable RESEND_API_KEY no encontrada. Configúrala en los secrets.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Definir el umbral: 30 minutos atrás
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    // 3. Extraer órdenes PENDING más antiguas que 30 mins
    const { data: abandonedCarts, error: fetchError } = await supabase
      .from("orders")
      .select("id, customer_email, product") // Asumiendo que guardas un email (customer_email) o se extrae vía JOIN
      .eq("status", "PENDING")
      .lte("created_at", thirtyMinsAgo);

    if (fetchError) {
      throw new Error(`Error leyendo carritos: ${fetchError.message}`);
    }

    if (!abandonedCarts || abandonedCarts.length === 0) {
      return new Response(JSON.stringify({ message: "No hay carritos abandonados para rescatar." }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`[Cart Recovery] Encontrados ${abandonedCarts.length} carritos. Procediendo al rescate...`);

    let recoveredCount = 0;

    // 4. Iterar y enviar correos persuasivos
    for (const cart of abandonedCarts) {
      try {
        const email = cart.customer_email || "cliente@ejemplo.com"; // Si hay JOIN, extrae el correo real
        const productName = cart.product || "tu pedido";

        // A. Enviar el correo usando Resend nativo en Deno
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "701Shop <ventas@tu-dominio.com>",
            to: [email],
            subject: `Olvido en el carrito: Tu ${productName} te está esperando 🔥`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hola, notamos que dejaste algo atrás...</h2>
                <p>Tu <strong>${productName}</strong> sigue en tu carrito, pero nuestro stock vuela rápido.</p>
                <p>Termina tu compra ahora y usa el código <strong>701FLASH</strong> para un descuento sorpresa válido por las próximas 2 horas.</p>
                <a href="https://tudominio.com/checkout?recover=${cart.id}" style="display:inline-block; padding:10px 20px; background-color:#111827; color:#fff; text-decoration:none; border-radius:5px;">Recuperar mi carrito</a>
              </div>
            `
          })
        });

        if (!resendRes.ok) {
          const errorText = await resendRes.text();
          throw new Error(`Fallo en Resend: ${resendRes.status} - ${errorText}`);
        }

        // B. Actualizar el estado de la orden a 'NOTIFIED' para no volver a enviar correos
        await supabase
          .from("orders")
          .update({ status: "NOTIFIED" })
          .eq("id", cart.id);

        console.log(`[Cart Recovery] 📩 Correo enviado a ${email} para el carrito ${cart.id}.`);
        recoveredCount++;

      } catch (err: any) {
        console.error(`[Cart Recovery] ❌ Error procesando carrito ${cart.id}:`, err.message);
      }
    }

    return new Response(JSON.stringify({ 
      message: "Ciclo de recuperación completado", 
      scanned: abandonedCarts.length,
      notified: recoveredCount 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error("[Cart Recovery] Colapso fatal del Rescatista:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
