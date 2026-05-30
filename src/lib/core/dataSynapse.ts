import { supabase } from '../supabase';

export interface RegionalPerformance {
  comuna: string;
  totalSalesCount: number;
  totalRevenue: number;
  estimatedCPA: number;
  yieldStatus: 'HIGH' | 'COLD' | 'NEUTRAL';
}

export interface SynapseReport {
  highYieldAreas: string[];
  coldAreas: string[];
  performanceData: RegionalPerformance[];
}

/**
 * Servicio de Interconexión (Data Pipeline)
 * Analiza las ventas reales (1PD) de Supabase para calcular la Densidad de Demanda
 * y detectar patrones ocultos de rentabilidad por Comuna.
 */
export async function analyzeFirstPartyData(): Promise<SynapseReport> {
  console.log('[Data Synapse] Iniciando extracción de First-Party Data (Supabase)...');

  // 1. Extraer órdenes con estado "Pagado"
  // Soportamos 'PAID' o 'Pagado' dependiendo de cómo esté guardado en BD
  const { data: orders, error } = await supabase
    .from('orders')
    .select('total, comuna, status')
    .in('status', ['PAID', 'Pagado']);

  if (error) {
    console.error('[Data Synapse] Error conectando con Supabase:', error);
    throw new Error('No se pudo extraer la First-Party Data');
  }

  if (!orders || orders.length === 0) {
    console.warn('[Data Synapse] No hay órdenes pagadas para analizar.');
    return { highYieldAreas: [], coldAreas: [], performanceData: [] };
  }

  // 2. Clustering Geográfico
  const clustering: Record<string, { count: number; revenue: number }> = {};

  orders.forEach((order) => {
    // Normalizar nombre de la comuna (evitar minúsculas/mayúsculas duplicadas)
    const rawComuna = order.comuna || 'DESCONOCIDA';
    const comuna = rawComuna.trim().toUpperCase();

    if (!clustering[comuna]) {
      clustering[comuna] = { count: 0, revenue: 0 };
    }
    
    clustering[comuna].count += 1;
    clustering[comuna].revenue += Number(order.total) || 0;
  });

  // 3. Análisis Económico y Matemático (Cálculo de Densidad de Demanda)
  // Como no tenemos el gasto exacto geográfico de Meta API en este momento,
  // utilizaremos una estimación uniforme temporal (ej. $20,000 CLP de gasto asignado por zona
  // donde se ha impreso anuncio) para calcular el CPA real basado en ventas.
  const ESTIMATED_SPEND_PER_REGION = 20000; 
  const TARGET_CPA_MAX = 5000; // Si cuesta más de 5k adquirir un cliente, es zona fría
  const TARGET_CPA_HIGH_YIELD = 2500; // Si cuesta menos de 2.5k, es zona MUY rentable

  const performanceData: RegionalPerformance[] = [];
  const highYieldAreas: string[] = [];
  const coldAreas: string[] = [];

  for (const [comuna, metrics] of Object.entries(clustering)) {
    if (comuna === 'DESCONOCIDA') continue;

    // Calcular CPA real = Gasto / Conversiones reales 
    const estimatedCPA = ESTIMATED_SPEND_PER_REGION / metrics.count;
    
    let yieldStatus: 'HIGH' | 'COLD' | 'NEUTRAL' = 'NEUTRAL';

    // Identificación de Patrones Ocultos
    if (estimatedCPA <= TARGET_CPA_HIGH_YIELD) {
      yieldStatus = 'HIGH';
      highYieldAreas.push(comuna);
    } else if (estimatedCPA >= TARGET_CPA_MAX) {
      yieldStatus = 'COLD';
      coldAreas.push(comuna);
    }

    performanceData.push({
      comuna,
      totalSalesCount: metrics.count,
      totalRevenue: metrics.revenue,
      estimatedCPA,
      yieldStatus
    });
  }

  console.log(`[Data Synapse] Análisis completado. ${highYieldAreas.length} High-Yield, ${coldAreas.length} Cold Areas encontradas.`);
  
  return {
    highYieldAreas,
    coldAreas,
    performanceData
  };
}
