import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, Download, Printer, Zap, Search, Filter, Loader2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';

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

export function OrdersManager() {
  const [isPrinting, setIsPrinting] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // JOIN orders con customers
      // Asumiendo la estructura: orders(id, created_at, status, method, product, comuna, customer_id, total) 
      // y customers(id, name)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedOrders = data.map((o: any) => ({
          id: o.id.toString().padStart(4, '0'), // ej #1001 si id es int
          rawId: o.id,
          date: o.created_at ? format(parseISO(o.created_at), 'dd MMM yyyy') : 'N/A',
          customer: o.customers?.name || 'Cliente Desconocido',
          product: o.product || 'Varios Productos',
          comuna: o.comuna || 'Sin Comuna',
          status: o.status || 'PENDING',
          method: o.method || 'FLOW',
          total: o.total || 0,
          labelUrl: null
        }));
        setOrders(formattedOrders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async (id: string) => {
    setIsPrinting(id);
    await new Promise((r) => setTimeout(r, 1200));
    setOrders((prev) =>
      prev.map((o) =>
        o.rawId === id || o.id === id
          ? { ...o, labelUrl: `https://starken.cl/etiquetas/STK-${Date.now()}-CL.pdf` }
          : o
      )
    );
    setIsPrinting(null);
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'ALL' || o.status === filter;
    const matchesSearch = 
      o.customer.toLowerCase().includes(search.toLowerCase()) || 
      o.id.toString().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Top Bar with Filters */}
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#111827', letterSpacing: '-0.02em' }}>
            Gestión de Pedidos
          </h2>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>Sincronizado con Base de Datos (Supabase)</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: 4 }}>
            {['ALL', 'PAID', 'PENDING'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  background: filter === status ? '#FFFFFF' : 'transparent',
                  color: filter === status ? '#111827' : '#6B7280',
                  boxShadow: filter === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: filter === status ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {status === 'ALL' ? 'Todos' : status === 'PAID' ? 'Pagados' : 'Pendientes'}
              </button>
            ))}
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 10, top: 8, width: 14, height: 14, color: '#9CA3AF' }} />
            <input 
              type="text" 
              placeholder="Buscar por cliente o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '6px 12px 6px 32px',
                color: '#111827',
                fontSize: 12,
                outline: 'none',
                width: 200,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        variants={itemVariants}
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#F9FAFB'
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#111827',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Truck style={{ width: 16, height: 16, color: '#4B5563' }} />
            Registro Nacional (OMS)
          </h3>
          <span
            style={{
              fontSize: 11,
              color: '#374151',
              fontFamily: 'monospace',
              fontWeight: 600,
              background: '#E5E7EB',
              padding: '4px 12px',
              borderRadius: 20,
            }}
          >
            {filteredOrders.length} resultados
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#6B7280' }}>
            <Loader2 style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            Sincronizando órdenes...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid #E5E7EB',
                    color: '#6B7280',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: '#F9FAFB'
                  }}
                >
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600 }}>N° Orden</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600 }}>Fecha</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600 }}>Cliente</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600 }}>Producto</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600 }}>Estado de Pago</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600 }}>Total</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600 }}>Estado de Envío / Logística</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <motion.tr
                    key={o.rawId}
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                    style={{
                      borderBottom: '1px solid #E5E7EB',
                    }}
                  >
                    <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: 700, color: '#111827' }}>#{o.id}</td>
                    <td style={{ padding: '16px 20px', color: '#6B7280' }}>{o.date}</td>
                    <td style={{ padding: '16px 20px', color: '#111827', fontWeight: 500 }}>{o.customer}</td>
                    <td style={{ padding: '16px 20px', color: '#4B5563' }}>{o.product}</td>
                    <td style={{ padding: '16px 20px' }}>
                      {o.status === 'PAID' || o.status === 'Pagado' ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: '#059669',
                            background: '#D1FAE5',
                            padding: '4px 10px',
                            borderRadius: 6,
                          }}
                        >
                          <CheckCircle style={{ width: 12, height: 12 }} /> Pagado ({o.method})
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: '#D97706',
                            background: '#FEF3C7',
                            padding: '4px 10px',
                            borderRadius: 6,
                          }}
                        >
                          <Filter style={{ width: 12, height: 12 }} /> PENDIENTE
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#111827', fontWeight: 600 }}>${o.total?.toLocaleString('es-CL')}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {o.status === 'PENDING' ? (
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>No Preparado</span>
                      ) : o.labelUrl ? (
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          href={o.labelUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            color: '#111827',
                            background: '#F3F4F6',
                            padding: '6px 14px',
                            borderRadius: 6,
                            textDecoration: 'none',
                            border: '1px solid #E5E7EB',
                          }}
                        >
                          <Download style={{ width: 12, height: 12 }} /> IMPRIMIR PDF
                        </motion.a>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              color: '#D97706',
                              background: '#FEF3C7',
                              padding: '4px 10px',
                              borderRadius: 6,
                            }}
                          >
                            No Preparado
                          </span>
                          <motion.button
                            whileHover={{ scale: isPrinting === o.rawId ? 1 : 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePrint(o.rawId)}
                            disabled={isPrinting === o.rawId}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              color: '#FFFFFF',
                              background: '#111827',
                              padding: '6px 14px',
                              borderRadius: 6,
                              border: 'none',
                              cursor: isPrinting === o.rawId ? 'wait' : 'pointer',
                              opacity: isPrinting === o.rawId ? 0.7 : 1,
                            }}
                          >
                            <Printer style={{ width: 12, height: 12 }} />
                            {isPrinting === o.rawId ? 'GENERANDO...' : 'ETIQUETA STARKEN'}
                          </motion.button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          style={{
            padding: '12px 20px',
            background: '#F9FAFB',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            color: '#6B7280',
            fontFamily: 'monospace',
          }}
        >
          <Zap style={{ width: 14, height: 14, color: '#9CA3AF' }} />
          Formato Térmico: 10×15 cm · Generación Automática de ZPL
        </div>
      </motion.div>
    </motion.div>
  );
}
