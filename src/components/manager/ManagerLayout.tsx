import React, { useState, createContext, useContext } from 'react';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  PackageSearch,
  ShoppingBag,
  BarChart3,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Date Range Context (Global State) ─────────────────────────── */
export type DateRange = 'today' | '7d' | '30d' | 'month' | 'custom';

interface ManagerContextType {
  dateRange: DateRange;
  setDateRange: (r: DateRange) => void;
  dateLabel: string;
}

const ManagerContext = createContext<ManagerContextType>({
  dateRange: '7d',
  setDateRange: () => {},
  dateLabel: 'Últimos 7 días',
});

export const useManagerContext = () => useContext(ManagerContext);

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: 'month', label: 'Mes actual' },
  { value: 'custom', label: 'Rango personalizado' },
];

/* ─── Sidebar Navigation ────────────────────────────────────────── */
// PODA DEL ENRUTADOR: Solo Inicio, Pedidos, Productos y Analíticas
const NAV_ITEMS = [
  { id: 'home', to: '/701manager', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { id: 'orders', to: '/701manager/orders', label: 'Pedidos', icon: PackageSearch, exact: false },
  { id: 'products', to: '/701manager/products', label: 'Productos', icon: ShoppingBag, exact: false },
  { id: 'analytics', to: '/701manager/analytics', label: 'Analíticas', icon: BarChart3, exact: false },
];

function Sidebar() {
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -220, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      style={{
        width: 220,
        minHeight: '100vh',
        background: '#F9FAFB', // Light Gray
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 20,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 40,
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: '0 20px 24px',
          borderBottom: '1px solid #E5E7EB',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: '#111827', // Clean Dark Text
            letterSpacing: '-0.03em',
          }}
        >
          701<span style={{ color: '#6B7280' }}>MANAGER</span>
        </span>
        <div
          style={{
            fontSize: 10,
            color: '#6B7280',
            fontFamily: 'monospace',
            marginTop: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          Admin Panel
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '0 10px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.to}
              style={{ textDecoration: 'none' }}
            >
              <motion.div
                whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  marginBottom: 2,
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#111827' : '#6B7280',
                  background: isActive ? '#E5E7EB' : 'transparent',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  borderLeft: isActive ? '3px solid #111827' : '3px solid transparent',
                  transition: 'background 0.2s',
                }}
              >
                <Icon
                  style={{
                    width: 18,
                    height: 18,
                    color: isActive ? '#111827' : '#6B7280',
                  }}
                />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #E5E7EB',
          fontSize: 10,
          color: '#9CA3AF',
          fontFamily: 'monospace',
        }}
      >
        Antigravity Core v3000
      </div>
    </motion.aside>
  );
}

/* ─── Top Header with Date Picker ────────────────────────────────── */
function TopHeader() {
  const { dateRange, setDateRange, dateLabel } = useManagerContext();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
      style={{
        height: 56,
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        background: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <h2
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#111827',
          margin: 0,
        }}
      >
        Dashboard
      </h2>

      {/* Date Picker */}
      <div style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ y: -1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderRadius: 8,
            border: '1px solid #E5E7EB',
            background: '#F9FAFB',
            color: '#374151',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <Calendar style={{ width: 14, height: 14, color: '#6B7280' }} />
          {dateLabel}
          <ChevronDown
            style={{
              width: 14,
              height: 14,
              color: '#6B7280',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 10,
                padding: 4,
                minWidth: 200,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                zIndex: 50,
              }}
            >
              {DATE_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.value}
                  onClick={() => {
                    setDateRange(opt.value);
                    setOpen(false);
                  }}
                  whileHover={{ backgroundColor: '#F3F4F6' }}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    border: 'none',
                    borderRadius: 6,
                    background:
                      dateRange === opt.value
                        ? '#E5E7EB'
                        : 'transparent',
                    color:
                      dateRange === opt.value ? '#111827' : '#4B5563',
                    fontSize: 12,
                    fontWeight: dateRange === opt.value ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  {opt.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

/* ─── Manager Layout (Exports) ───────────────────────────────────── */
export function ManagerLayout() {
  const [dateRange, setDateRange] = useState<DateRange>('7d');

  const dateLabel =
    DATE_OPTIONS.find((o) => o.value === dateRange)?.label ?? '';

  return (
    <ManagerContext.Provider value={{ dateRange, setDateRange, dateLabel }}>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: '#FFFFFF', // Pure White
          color: '#111827',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <Sidebar />

        {/* Main content area offset by sidebar width */}
        <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TopHeader />
          <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </main>
        </div>
      </div>
    </ManagerContext.Provider>
  );
}
