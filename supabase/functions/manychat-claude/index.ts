import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Prompt Maestro para Claude
const SYSTEM_PROMPT = `
Eres el agente de soporte autónomo de 701Shop, una tienda exclusiva de perfumes en Chile.
Tu misión es asistir a los clientes por WhatsApp/Instagram de forma concisa, educada y persuasiva.
Reglas:
- Los envíos se hacen por Starken a todo Chile.
- El tiempo de preparación es de 24 a 48 horas hábiles.
- Puedes ofrecer el código de descuento "701FLASH" si el cliente duda en su compra.
- Si preguntan por P&L o finanzas, responde que no tienes acceso a esa información (a menos que detectes una clave secreta del administrador).
Responde siempre en menos de 3 párrafos cortos.
`;

serve(async (req) => {
  console.log("[ManyChat-Claude] Webhook invocado.");

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    
    // Extracción básica del payload de ManyChat (asume que ManyChat envía un External Request con user_message)
    const userMessage = payload.message || payload.user_message || "";
    const subscriberId = payload.subscriber_id || payload.id;

    if (!userMessage) {
      return new Response(JSON.stringify({ message: "Payload inválido, falta el mensaje." }), { status: 400 });
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY") || "";
    const manychatApiKey = Deno.env.get("MANYCHAT_API_TOKEN") || "";

    if (!anthropicApiKey) {
      throw new Error("Falta ANTHROPIC_API_KEY");
    }

    // 1. Consultar a Claude 3 (API de Anthropic)
    console.log(`[ManyChat-Claude] Consultando a Claude para el mensaje: "${userMessage}"`);
    
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: userMessage }
        ]
      })
    });

    if (!claudeRes.ok) {
      const errorText = await claudeRes.text();
      throw new Error(`Error en API de Anthropic: ${claudeRes.status} ${errorText}`);
    }

    const claudeData = await claudeRes.json();
    const aiResponse = claudeData.content?.[0]?.text || "Lo siento, tuve un problema procesando tu mensaje.";

    console.log(`[ManyChat-Claude] Claude respondió: "${aiResponse}"`);

    // 2. Opcional: Si el Webhook de ManyChat requiere respuesta directa, la devolvemos.
    // Si requiere un callback, usamos la API de ManyChat.
    // En este caso, construiremos la respuesta para que ManyChat la capture en una variable (Custom Field) 
    // o enviaremos el POST directamente.
    
    if (manychatApiKey && subscriberId) {
      // Enviar de vuelta a ManyChat directamente al subscriber
      await fetch("https://api.manychat.com/fb/sending/sendContent", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${manychatApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subscriber_id: subscriberId,
          data: {
            version: "v2",
            content: {
              messages: [{ type: "text", text: aiResponse }]
            }
          }
        })
      });
      console.log("[ManyChat-Claude] Respuesta inyectada directamente a ManyChat.");
    }

    // Retornamos el payload para que el flow de ManyChat pueda mapearlo si se usa "Response Mapping"
    return new Response(JSON.stringify({ 
      version: "v2", 
      content: { messages: [{ type: "text", text: aiResponse }] },
      ai_response: aiResponse // En caso de que se guarde en un Custom Field
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error("[ManyChat-Claude] Error procesando el webhook:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
