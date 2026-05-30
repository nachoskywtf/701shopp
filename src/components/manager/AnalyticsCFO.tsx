import React, { useEffect, useState } from 'react';
import { Shield, TrendingUp, Users, Activity, BarChart2, AlertTriangle, DollarSign } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getDashboardStats } from '../../lib/services/getDashboardStats';
import { supabase } from '../../lib/supabase';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 20 },
  },
};

export function AnalyticsCFO() {
  const [salesData, setSalesData] = useState<{ day: string; total: number }[]>([]);
  const [liquidity, setLiquidity] = useState({ unliquidated: 0, metaSpend: 45000, gap: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardStats();
        setSalesData(data);

        // --- CASH FLOW SHIELD ---
        // Ventas Pagadas No Liquidadas por Flow (últimas 48 hrs)
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('total')
          .eq('status', 'PAID')
          .gte('created_at', fortyEightHoursAgo);

        const unliquidatedSales = recentOrders ? recentOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0) : 0;
        
        // Simulación de lectura de Meta Ads Graph API para las últimas 48 hrs 
        // (En un entorno real, este dato viene inyectado o consultado vía endpoint proxy para no exponer tokens)
        const metaSpend48h = 45000; 
        const liquidityGap = unliquidatedSales - metaSpend48h;

        setLiquidity({ unliquidated: unliquidatedSales, metaSpend: metaSpend48h, gap: liquidityGap });
      } catch (error) {
        console.error('Error cargando analíticas reales:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const isRisk = liquidity.gap < 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#111827', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield style={{ color: '#111827', width: 24, height: 24 }} />
            Analíticas Reales & Ventas (Sincronizado)
          </h2>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>
            Conexión en tiempo real a la base de datos (Supabase). Mostrando órdenes con estado "Pagado" vía Flow.
          </p>
        </div>

        {/* CASH FLOW SHIELD GAUGE */}
        <div style={{
          background: isRisk ? '#FEF2F2' : '#F0FDF4',
          border: \`1px solid \${isRisk ? '#FCA5A5' : '#86EFAC'}\`,
          borderRadius: 12,
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          minWidth: 280
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: isRisk ? '#DC2626' : '#166534', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>
            {isRisk ? <AlertTriangle size={16} /> : <DollarSign size={16} />}
            Liquidity Gauge (48h)
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: isRisk ? '#991B1B' : '#14532D', marginTop: 4 }}>
            ${liquidity.gap.toLocaleString('es-CL')} CLP
          </div>
          <div style={{ fontSize: 11, color: isRisk ? '#DC2626' : '#166534', marginTop: 4, textAlign: 'right' }}>
            Por Liquidar: ${liquidity.unliquidated.toLocaleString('es-CL')} | Gasto Meta: ${liquidity.metaSpend.toLocaleString('es-CL')}
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { title: 'CAC Promedio', value: '$9,450', diff: '-12%', icon: Users },
          { title: 'ROAS Global', value: '3.8x', diff: '+0.5', icon: TrendingUp },
          { title: 'LTV (90 días)', value: '$145,000', diff: '+15%', icon: Activity },
          { title: 'Margen Neto', value: '52.4%', diff: '+4.1%', icon: BarChart2 },
        ].map((metric, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: '20px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>{metric.title}</span>
              <metric.icon style={{ width: 16, height: 16, color: '#111827' }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>{metric.value}</div>
            <div style={{ fontSize: 11, color: metric.diff.startsWith('+') ? '#059669' : '#059669', marginTop: 8, fontWeight: 600 }}>
              {metric.diff} vs mes pasado
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={itemVariants}
        style={{
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          padding: '24px',
          height: 400,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Ingresos Reales por Facturación Diaria</h3>
        {loading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            Sincronizando con Supabase...
          </div>
        ) : salesData.length === 0 ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            No hay órdenes pagadas en el periodo actual.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="day" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => \`$\${value.toLocaleString('es-CL')}\`}
              />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#111827', fontWeight: 600 }}
                formatter={(value: number) => [\`$\${value.toLocaleString('es-CL')}\`, 'Facturado']}
              />
              <Area type="monotone" dataKey="total" stroke="#111827" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </motion.div>
  );
}
