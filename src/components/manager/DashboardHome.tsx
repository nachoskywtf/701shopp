import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  Eye,
  Percent,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { ChileNeonMap } from '../mkt701/ChileNeonMap';
import { useManagerContext } from './ManagerLayout';
import { motion, Variants } from 'framer-motion';

/* ─── Mock Sales Data ────────────────────────────────────────────── */
const SALES_7D = [
  { day: 'Lun', revenue: 389000, orders: 5 },
  { day: 'Mar', revenue: 520000, orders: 7 },
  { day: 'Mié', revenue: 310000, orders: 4 },
  { day: 'Jue', revenue: 780000, orders: 10 },
  { day: 'Vie', revenue: 920000, orders: 12 },
  { day: 'Sáb', revenue: 1150000, orders: 15 },
  { day: 'Dom', revenue: 670000, orders: 8 },
];

const SALES_30D = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  revenue: Math.floor(Math.random() * 900000) + 200000,
  orders: Math.floor(Math.random() * 12) + 2,
}));

/* ─── Motion Variants for Staggering ─────────────────────────────── */
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

/* ─── KPI Card ───────────────────────────────────────────────────── */
function KPICard({
  label,
  value,
  growth,
  icon: Icon,
  prefix = '',
}: {
  label: string;
  value: string;
  growth: number;
  icon: React.ElementType;
  prefix?: string;
}) {
  const isUp = growth >= 0;
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
      style={{
        background: '#F9FAFB', // Light Gray
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: '18px 20px',
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: '#6B7280',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon style={{ width: 16, height: 16, color: '#374151' }} />
        </div>
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#111827',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {prefix}
        {value}
      </div>
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          fontWeight: 600,
          color: isUp ? '#059669' : '#DC2626',
        }}
      >
        {isUp ? (
          <TrendingUp style={{ width: 13, height: 13 }} />
        ) : (
          <TrendingDown style={{ width: 13, height: 13 }} />
        )}
        {isUp ? '+' : ''}
        {growth}%
        <span style={{ color: '#9CA3AF', fontWeight: 500, marginLeft: 4 }}>
          vs periodo anterior
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Custom Recharts Tooltip ─────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
        ${payload[0].value.toLocaleString()} CLP
      </div>
      {payload[0]?.payload?.orders && (
        <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>
          {payload[0].payload.orders} pedidos
        </div>
      )}
    </div>
  );
}

/* ─── Dashboard Home (Main Export) ────────────────────────────────── */
export function DashboardHome() {
  const { dateRange } = useManagerContext();

  const chartData = dateRange === '30d' || dateRange === 'month' ? SALES_30D : SALES_7D;

  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = chartData.reduce((s, d) => s + d.orders, 0);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 16 }}>
        <KPICard
          label="Ventas Totales"
          value={`$${totalRevenue.toLocaleString()}`}
          growth={12.4}
          icon={DollarSign}
        />
        <KPICard
          label="Sesiones Tienda"
          value="3,842"
          growth={8.1}
          icon={Eye}
        />
        <KPICard
          label="Tasa de Conversión"
          value="4.2%"
          growth={-1.3}
          icon={Percent}
        />
        <KPICard
          label="Ticket Promedio"
          value={`$${Math.round(totalRevenue / (totalOrders || 1)).toLocaleString()}`}
          growth={5.7}
          icon={ShoppingCart}
        />
      </div>

      {/* Main Map + Chart Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Sales Chart */}
        <motion.div
          variants={itemVariants}
          style={{
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            padding: '20px 20px 12px',
          }}
        >
          <h3
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#111827',
              margin: '0 0 16px',
            }}
          >
            Ingresos por período
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111827" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tick={{ fill: '#6B7280', fontSize: 10 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#111827"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  stroke: '#111827',
                  strokeWidth: 2,
                  fill: '#fff',
                }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Map Panel */}
        <motion.div
          variants={itemVariants}
          style={{
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
            height: 480,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 16,
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#059669',
                boxShadow: '0 0 8px #059669',
                animation: 'blink 1.5s infinite',
              }}
            />
            <span
              style={{
                fontSize: 9,
                fontFamily: 'monospace',
                color: '#4B5563',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontWeight: 600,
              }}
            >
              Ventas en vivo · Chile
            </span>
          </div>
          <ChileNeonMap />
        </motion.div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </motion.div>
  );
}
