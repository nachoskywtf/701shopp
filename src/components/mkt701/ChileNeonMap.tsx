import React, { useState, useEffect, memo } from 'react';
import { animate } from 'framer-motion';

// ─── Coordenadas de las principales ciudades de Chile (como % del SVG) ──────
// Posiciones ajustadas manualmente sobre un SVG de Chile 400x700
const CHILE_CITIES: Record<string, [number, number]> = {
  'Arica':        [200, 48],
  'Iquique':      [195, 82],
  'Antofagasta':  [205, 148],
  'Copiapó':      [210, 215],
  'La Serena':    [200, 262],
  'Valparaíso':   [185, 312],
  'Viña del Mar': [183, 308],
  'Santiago':     [195, 322],
  'Providencia':  [198, 320],
  'Las Condes':   [200, 318],
  'Rancagua':     [200, 340],
  'Talca':        [195, 368],
  'Chillán':      [190, 395],
  'Concepción':   [183, 418],
  'Temuco':       [178, 448],
  'Valdivia':     [172, 472],
  'Puerto Montt': [168, 502],
  'Coyhaique':    [178, 572],
  'Punta Arenas': [200, 650],
};

const LIVE_ORDERS = [
  { id: 1,  city: 'Santiago',     product: 'Naxos (Xerjoff)',    amount: 89990  },
  { id: 2,  city: 'Providencia',  product: 'Erba Pura',          amount: 119990 },
  { id: 3,  city: 'Concepción',   product: 'Baccarat Rouge 540', amount: 159990 },
  { id: 4,  city: 'Valparaíso',   product: 'Bleu de Chanel',     amount: 74990  },
  { id: 5,  city: 'Temuco',       product: 'Sauvage Dior',       amount: 84990  },
  { id: 6,  city: 'Antofagasta',  product: 'Acqua di Giò',       amount: 69990  },
  { id: 7,  city: 'La Serena',    product: 'Light Blue',         amount: 64990  },
  { id: 8,  city: 'Las Condes',   product: 'Aventus Creed',      amount: 249990 },
  { id: 9,  city: 'Puerto Montt', product: 'Ombré Leather',      amount: 94990  },
  { id: 10, city: 'Iquique',      product: '1 Million',          amount: 79990  },
  { id: 11, city: 'Rancagua',     product: 'Invictus',           amount: 59990  },
  { id: 12, city: 'Punta Arenas', product: 'Libre YSL',          amount: 109990 },
];

// SVG path de la silueta de Chile (simplificada)
const CHILE_PATH = `
  M 210,30 L 215,45 L 212,60 L 218,80 L 214,100
  L 220,120 L 216,140 L 222,160 L 218,180
  L 215,200 L 212,220 L 208,240 L 205,260
  L 200,275 L 195,285 L 188,295 L 182,305
  L 178,315 L 180,325 L 185,332 L 192,338
  L 198,345 L 196,360 L 192,375 L 188,390
  L 183,408 L 178,425 L 172,445 L 168,465
  L 164,485 L 162,505 L 158,525 L 155,545
  L 152,560 L 155,575 L 162,588 L 170,598
  L 178,610 L 185,622 L 192,635 L 198,648
  L 205,660 L 210,668 L 215,660 L 212,645
  L 208,632 L 205,618 L 202,605 L 198,592
  L 195,578 L 198,565 L 202,552 L 205,538
  L 208,522 L 210,505 L 208,488 L 205,472
  L 202,455 L 198,438 L 195,420 L 192,402
  L 192,385 L 195,370 L 198,355 L 200,340
  L 202,328 L 205,318 L 210,310 L 216,302
  L 220,292 L 220,278 L 218,264 L 215,248
  L 212,230 L 215,212 L 218,194 L 220,175
  L 218,155 L 222,135 L 218,115 L 220,95
  L 215,75 L 218,55 L 215,40 L 210,30
`;

// ─── PulsePin ────────────────────────────────────────────────────────────────
function PulsePin({ x, y, order, onHover, onLeave }: {
  x: number;
  y: number;
  order: typeof LIVE_ORDERS[0];
  onHover: (e: React.MouseEvent, order: typeof LIVE_ORDERS[0]) => void;
  onLeave: () => void;
}) {
  return (
    <g
      transform={`translate(${x},${y})`}
      onMouseEnter={(e) => onHover(e, order)}
      onMouseLeave={onLeave}
      style={{ cursor: 'pointer' }}
    >
      <circle r={10} fill="none" stroke="#111827" strokeWidth={1.5} opacity={0.25}>
        <animate attributeName="r" from="4" to="18" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle r={10} fill="none" stroke="#111827" strokeWidth={1} opacity={0.15}>
        <animate attributeName="r" from="4" to="24" dur="2s" begin="0.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.3" to="0" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle r={3.5} fill="#111827" stroke="#fff" strokeWidth={1}>
        <animate attributeName="r" values="2.5;4;2.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

// ─── ChileNeonMap ────────────────────────────────────────────────────────────
export const ChileNeonMap = memo(function ChileNeonMap() {
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; order: typeof LIVE_ORDERS[0]
  } | null>(null);
  const [visibleOrders, setVisibleOrders] = useState(LIVE_ORDERS.slice(0, 5));
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, scale: 1 });
  const svgRef = React.useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (visibleOrders.length >= LIVE_ORDERS.length) return;
    const timer = setTimeout(() => {
      setVisibleOrders(prev => [...prev, LIVE_ORDERS[prev.length]]);
    }, 3000);
    return () => clearTimeout(timer);
  }, [visibleOrders]);

  const handleHover = (e: React.MouseEvent, order: typeof LIVE_ORDERS[0]) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 60,
      order,
    });
  };

  const handleLeave = () => setTooltip(null);

  const resetView = () => {
    animate(viewBox.scale, 1, {
      type: 'spring', stiffness: 80, damping: 15,
      onUpdate: (v) => setViewBox(p => ({ ...p, scale: v, x: 0, y: 0 }))
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        viewBox="120 20 200 660"
        width="100%"
        height="100%"
        style={{ background: '#F9FAFB', cursor: 'default' }}
        onClick={resetView}
      >
        <defs>
          <filter id="lightGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="chileGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E5E7EB" />
            <stop offset="100%" stopColor="#D1D5DB" />
          </linearGradient>
        </defs>

        {/* Silueta de Chile */}
        <path
          d={CHILE_PATH}
          fill="url(#chileGrad)"
          stroke="#9CA3AF"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />

        {/* Marcadores de órdenes en vivo */}
        {visibleOrders.map((order) => {
          const coords = CHILE_CITIES[order.city];
          if (!coords) return null;
          return (
            <PulsePin
              key={order.id}
              x={coords[0]}
              y={coords[1]}
              order={order}
              onHover={handleHover}
              onLeave={handleLeave}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        >
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            padding: '8px 14px',
            color: '#111827',
            fontSize: 11,
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}>
            <span>📍 {tooltip.order.city}</span>
            <span style={{ color: '#D1D5DB', margin: '0 6px' }}>—</span>
            <span>{tooltip.order.product}</span>
            <span style={{ color: '#D1D5DB', margin: '0 6px' }}>—</span>
            <span style={{ color: '#059669', fontWeight: 'bold' }}>
              ${tooltip.order.amount.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
