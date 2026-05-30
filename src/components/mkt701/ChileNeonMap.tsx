import React, { useState, useEffect, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { animate } from 'framer-motion';

// ─── Coordenadas de las principales ciudades de Chile ──────────────
const CHILE_CITIES: Record<string, [number, number]> = {
  'Arica': [-70.3125, -18.4783],
  'Iquique': [-70.1357, -20.2133],
  'Antofagasta': [-70.3997, -23.6509],
  'Copiapó': [-70.3314, -27.3668],
  'La Serena': [-71.2543, -29.9027],
  'Valparaíso': [-71.6127, -33.0472],
  'Viña del Mar': [-71.5518, -33.0153],
  'Santiago': [-70.6483, -33.4489],
  'Providencia': [-70.6109, -33.4269],
  'Las Condes': [-70.5879, -33.4076],
  'Rancagua': [-70.7399, -34.1701],
  'Talca': [-71.6554, -35.4264],
  'Chillán': [-72.1034, -36.6066],
  'Concepción': [-73.0498, -36.8270],
  'Temuco': [-72.5984, -38.7359],
  'Valdivia': [-73.2459, -39.8196],
  'Puerto Montt': [-72.9411, -41.4693],
  'Coyhaique': [-72.0688, -45.5752],
  'Punta Arenas': [-70.9171, -53.1548],
};

const LIVE_ORDERS = [
  { id: 1, city: 'Santiago', product: 'Naxos (Xerjoff)', amount: 89990 },
  { id: 2, city: 'Providencia', product: 'Erba Pura', amount: 119990 },
  { id: 3, city: 'Concepción', product: 'Baccarat Rouge 540', amount: 159990 },
  { id: 4, city: 'Valparaíso', product: 'Bleu de Chanel', amount: 74990 },
  { id: 5, city: 'Temuco', product: 'Sauvage Dior', amount: 84990 },
  { id: 6, city: 'Antofagasta', product: 'Acqua di Giò', amount: 69990 },
  { id: 7, city: 'La Serena', product: 'Light Blue', amount: 64990 },
  { id: 8, city: 'Las Condes', product: 'Aventus Creed', amount: 249990 },
  { id: 9, city: 'Puerto Montt', product: 'Ombré Leather', amount: 94990 },
  { id: 10, city: 'Iquique', product: '1 Million', amount: 79990 },
  { id: 11, city: 'Rancagua', product: 'Invictus', amount: 59990 },
  { id: 12, city: 'Punta Arenas', product: 'Libre YSL', amount: 109990 },
];

const GEO_URL = '/geo/chile-regiones.json';

// ─── Pulse Pin Component ──────────────────────────────────────────
function PulsePin({ coordinates, order, onHover, onLeave, onClick }: {
  coordinates: [number, number];
  order: typeof LIVE_ORDERS[0];
  onHover: (e: React.MouseEvent, order: typeof LIVE_ORDERS[0]) => void;
  onLeave: () => void;
  onClick: (coords: [number, number]) => void;
}) {
  return (
    <Marker coordinates={coordinates}>
      <g
        onMouseEnter={(e) => onHover(e, order)}
        onMouseLeave={onLeave}
        onClick={(e) => {
          e.stopPropagation();
          onClick(coordinates);
        }}
        style={{ cursor: 'pointer' }}
      >
        <circle r={8} fill="none" stroke="#111827" strokeWidth={1.5} opacity={0.3}>
          <animate attributeName="r" from="4" to="18" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle r={8} fill="none" stroke="#111827" strokeWidth={1} opacity={0.2}>
          <animate attributeName="r" from="4" to="22" dur="2s" begin="0.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.3" to="0" dur="2s" begin="0.6s" repeatCount="indefinite" />
        </circle>
        <circle r={3} fill="#111827" stroke="#fff" strokeWidth={0.8}>
          <animate attributeName="r" values="2.5;3.5;2.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
    </Marker>
  );
}

// ─── Chile Neon Map Component ─────────────────────────────────────
export const ChileNeonMap = memo(function ChileNeonMap() {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; order: typeof LIVE_ORDERS[0] } | null>(null);
  const [visibleOrders, setVisibleOrders] = useState(LIVE_ORDERS.slice(0, 5));
  
  // Camera State
  const [camera, setCamera] = useState({ center: [-71, -37] as [number, number], zoom: 1 });

  // Simulate new orders arriving
  useEffect(() => {
    if (visibleOrders.length >= LIVE_ORDERS.length) return;
    const timer = setTimeout(() => {
      setVisibleOrders(prev => [...prev, LIVE_ORDERS[prev.length]]);
    }, 3000);
    return () => clearTimeout(timer);
  }, [visibleOrders]);

  const handleHover = (e: React.MouseEvent, order: typeof LIVE_ORDERS[0]) => {
    const rect = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 50,
      order,
    });
  };

  const handleLeave = () => setTooltip(null);

  const handlePinClick = (coords: [number, number]) => {
    // Smooth camera fly-to using Framer Motion animate function
    animate(camera.center[0], coords[0], {
      type: "spring",
      stiffness: 80,
      damping: 15,
      onUpdate: (latest) => setCamera(prev => ({ ...prev, center: [latest, prev.center[1]] }))
    });
    animate(camera.center[1], coords[1], {
      type: "spring",
      stiffness: 80,
      damping: 15,
      onUpdate: (latest) => setCamera(prev => ({ ...prev, center: [prev.center[0], latest] }))
    });
    animate(camera.zoom, 6, {
      type: "spring",
      stiffness: 80,
      damping: 20,
      onUpdate: (latest) => setCamera(prev => ({ ...prev, zoom: latest }))
    });
  };

  const resetCamera = () => {
    animate(camera.center[0], -71, { type: "spring", stiffness: 60, damping: 15, onUpdate: (v) => setCamera(p => ({ ...p, center: [v, p.center[1]] })) });
    animate(camera.center[1], -37, { type: "spring", stiffness: 60, damping: 15, onUpdate: (v) => setCamera(p => ({ ...p, center: [p.center[0], v] })) });
    animate(camera.zoom, 1, { type: "spring", stiffness: 60, damping: 15, onUpdate: (v) => setCamera(p => ({ ...p, zoom: v })) });
  };

  return (
    <div className="chile-map-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [-71, -37],
          scale: 900,
        }}
        width={400}
        height={700}
        style={{ width: '100%', height: '100%', background: '#F9FAFB' }}
        onClick={resetCamera} // Click en fondo resetea
      >
        <defs>
          <filter id="lightGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <pattern id="chileFlag" patternUnits="userSpaceOnUse" width="400" height="700">
            <rect x="0" y="0" width="140" height="350" fill="#0039a6" />
            <polygon
              points="70,80 82,120 125,120 90,145 102,185 70,160 38,185 50,145 15,120 58,120"
              fill="#ffffff"
            />
            <rect x="140" y="0" width="260" height="350" fill="#ffffff" />
            <rect x="0" y="350" width="400" height="350" fill="#d52b1e" />
          </pattern>

          <pattern id="chileFlagLight" patternUnits="userSpaceOnUse" width="400" height="700">
            <rect width="400" height="700" fill="#E5E7EB" />
          </pattern>
        </defs>

        <ZoomableGroup 
          center={camera.center} 
          zoom={camera.zoom}
          onMoveEnd={(pos) => setCamera({ center: pos.coordinates, zoom: pos.zoom })}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="url(#chileFlagLight)"
                  stroke="#D1D5DB"
                  strokeWidth={0.8 / camera.zoom} // Mantiene grosor al hacer zoom
                  style={{
                    default: {
                      outline: 'none',
                    },
                    hover: {
                      fill: 'url(#chileFlag)',
                      stroke: '#9CA3AF',
                      strokeWidth: 1.2 / camera.zoom,
                      outline: 'none',
                      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                      cursor: 'pointer',
                    },
                    pressed: { outline: 'none' },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
              ))
            }
          </Geographies>

          {/* Live order markers */}
          {visibleOrders.map((order) => {
            const coords = CHILE_CITIES[order.city];
            if (!coords) return null;
            return (
              <PulsePin
                key={order.id}
                coordinates={coords}
                order={order}
                onHover={handleHover}
                onLeave={handleLeave}
                onClick={handlePinClick}
              />
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

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
