import { useState, useEffect } from "react";
import ProductoCard from "./ProductoCard";
import styles from "./ProductoGrid.module.css";

export default function ProductoGrid({ productosIniciales=[] }) {
  const [productos, setProductos] = useState(productosIniciales);
  const [carrito, setCarrito]     = useState([]);
  const [filtro, setFiltro]       = useState("Todos");
  const [loading, setLoading]     = useState(productosIniciales.length===0);

  useEffect(() => {
    if (productosIniciales.length > 0) return;
    fetch("/productos.json").then(r=>r.json()).then(d=>{setProductos(d);setLoading(false);}).catch(()=>setLoading(false));
  }, []);

  const categorias = ["Todos",...new Set(productos.map(p=>p.categoria))];
  const filtrados  = filtro==="Todos" ? productos : productos.filter(p=>p.categoria===filtro);

  const agregar = (p) => setCarrito(prev => {
    const e = prev.find(x=>x.id===p.id);
    return e ? prev.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x) : [...prev,{...p,qty:1}];
  });

  if (loading) return <div className={styles.loading}>Cargando catálogo…</div>;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Colección</h1>
        <p className={styles.subtitulo}>{filtrados.length} fragancias disponibles</p>
      </div>
      <div className={styles.filtros}>
        {categorias.map(c=>(
          <button key={c} className={`${styles.filtroBtn} ${filtro===c?styles.filtroActivo:""}`}
            onClick={()=>setFiltro(c)}>{c}</button>
        ))}
      </div>
      <div className={styles.grid}>
        {filtrados.map(p=><ProductoCard key={p.id} producto={p} onAgregarAlCarrito={agregar}/>)}
      </div>
      {carrito.length>0 && (
        <div className={styles.carritoIndicador}>
          🛒 {carrito.reduce((a,p)=>a+p.qty,0)} productos
        </div>
      )}
    </section>
  );
}
