import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Función auxiliar para obtener fecha de hace N días en formato YYYY-MM-DD
function getPastDateString(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

serve(async (req) => {
  console.log("[Auto-P&L] Iniciando auditoría financiera de la semana...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const metaAccessToken = Deno.env.get("META_ACCESS_TOKEN") || "";
    const metaAdAccountId = Deno.env.get("META_AD_ACCOUNT_ID") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@701shop.com";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Variables Supabase no encontradas.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Calcular Ingresos de la semana (Últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("total")
      .eq("status", "PAID")
      .gte("created_at", sevenDaysAgo.toISOString());

    if (ordersError) throw new Error(`Error Supabase: ${ordersError.message}`);

    const totalRevenue = orders ? orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0) : 0;
    const totalOrders = orders ? orders.length : 0;
    
    // Costo promedio de envío Starken estimado (ej. 3500 CLP por orden)
    const averageShippingCost = 3500;
    const totalShippingCost = totalOrders * averageShippingCost;

    // 2. Extraer Gasto en Meta Ads (Últimos 7 días)
    let totalAdSpend = 0;
    if (metaAccessToken && metaAdAccountId) {
      try {
        const since = getPastDateString(7);
        const until = getPastDateString(0);
        
        const metaUrl = `https://graph.facebook.com/v19.0/act_${metaAdAccountId}/insights?time_range={'since':'${since}','until':'${until}'}&access_token=${metaAccessToken}`;
        const metaRes = await fetch(metaUrl);
        const metaData = await metaRes.json();
        
        if (metaData.data && metaData.data.length > 0) {
          totalAdSpend = parseFloat(metaData.data[0].spend || "0");
        }
      } catch (err) {
        console.warn("[Auto-P&L] No se pudo obtener gasto de Meta, asumiendo 0.", err);
      }
    }

    // 3. Consolidar el P&L
    const netProfit = totalRevenue - totalAdSpend - totalShippingCost;
    const roas = totalAdSpend > 0 ? (totalRevenue / totalAdSpend).toFixed(2) : "N/A";
    
    const profitStatus = netProfit > 0 ? "🟢 RENTABLE" : "🔴 PÉRDIDA";

    const reportContent = `
      <h1>Reporte P&L Semanal - 701Shop</h1>
      <h3>Estado: ${profitStatus}</h3>
      <ul>
        <li><strong>Órdenes Pagadas:</strong> ${totalOrders}</li>
        <li><strong>Ingresos Brutos:</strong> $${totalRevenue.toLocaleString("es-CL")} CLP</li>
        <li><strong>Gasto Meta Ads:</strong> $${totalAdSpend.toLocaleString("es-CL")} CLP</li>
        <li><strong>Costo Starken (Est.):</strong> $${totalShippingCost.toLocaleString("es-CL")} CLP</li>
        <li><strong>ROAS:</strong> ${roas}x</li>
        <li><strong>GANANCIA NETA:</strong> $${netProfit.toLocaleString("es-CL")} CLP</li>
      </ul>
    `;

    console.log(`[Auto-P&L] P&L Calculado. Net Profit: $${netProfit}. Enviando reporte...`);

    // 4. Enviar reporte vía Resend
    if (resendApiKey) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "701Shop CFO <cfo@tu-dominio.com>",
          to: [adminEmail],
          subject: `[Auto-P&L] Reporte Semanal: ${profitStatus}`,
          html: reportContent
        })
      });

      if (!resendRes.ok) {
        console.error("[Auto-P&L] Error enviando correo Resend.");
      }
    } else {
      console.log("[Auto-P&L] Resend no configurado. Reporte solo visible en logs.");
    }

    return new Response(JSON.stringify({ 
      message: "Conciliación financiera completada",
      netProfit,
      roas
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error("[Auto-P&L] Error fatal en la conciliación:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
