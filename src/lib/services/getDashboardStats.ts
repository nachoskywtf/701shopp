import { supabase } from '../supabase';
import { format, parseISO } from 'date-fns';

export async function getDashboardStats() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('total, created_at, method')
    .eq('status', 'PAID') // O 'Pagado' según el esquema en DB
    .eq('method', 'FLOW');

  if (error) {
    console.error('Error fetching dashboard stats:', error);
    return [];
  }

  // Agrupar por fecha
  const groupedData: Record<string, number> = {};

  orders?.forEach((order) => {
    if (!order.created_at) return;
    
    // Formatear la fecha, e.g., '28 May'
    const dateStr = format(parseISO(order.created_at), 'dd MMM');
    
    if (!groupedData[dateStr]) {
      groupedData[dateStr] = 0;
    }
    groupedData[dateStr] += Number(order.total) || 0;
  });

  // Convertir a array para Recharts, ordenado cronológicamente asumiendo que `orders` venía ordenado 
  // O podemos dejar que Recharts lo dibuje como viene, pero mejor asegurar un array
  const result = Object.entries(groupedData).map(([day, total]) => ({
    day,
    total,
  }));

  return result;
}
