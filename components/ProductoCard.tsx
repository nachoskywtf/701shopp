import { useState } from "react";
import styles from "./ProductoCard.module.css";

const FALLBACK = "/img/fallback-perfume.png";

const formatPrecio = (p) =>
  new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",minimumFractionDigits:0}).format(p);

export default function ProductoCard({ producto, onAgregarAlCarrito }) {
  const { nombre, marca, precio, categoria, descripcion,
          imagen_principal, imagenes=[], stock=0 } = producto;
  const [img, setImg]         = useState(imagen_principal || FALLBACK);
  const [error, setError]     = useState(false);
  const [agregado, setAgregado] = useState(false);

  const src = error ? FALLBACK : img;

  const handleAgregar = () => {
    if (!stock) return;
    onAgregarAlCarrito?.(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  return (
    <article className={styles.card}>
      <span className={styles.badge}>{categoria}</span>
      <div className={styles.imageWrapper}>
        <img src={src} alt={`${marca} ${nombre}`}
          className={styles.productImage}
          onError={() => setError(true)} loading="lazy" />
        {imagenes.length > 1 && (
          <div className={styles.thumbnails}>
            {imagenes.slice(0,3).map((s,i) => (
              <button key={i} className={`${styles.thumb} ${img===s?styles.thumbActive:""}`}
                onMouseEnter={() => { setError(false); setImg(s); }}
                onClick={() => { setError(false); setImg(s); }}>
                <img src={s} alt="" onError={e => e.currentTarget.src=FALLBACK} />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.marca}>{marca}</p>
        <h2 className={styles.nombre}>{nombre}</h2>
        <p className={styles.descripcion}>{descripcion}</p>
        <div className={styles.footer}>
          <span className={styles.precio}>{formatPrecio(precio)}</span>
          {stock === 0
            ? <span className={styles.sinStock}>Agotado</span>
            : <button className={`${styles.btn} ${agregado?styles.btnConfirmado:""}`}
                onClick={handleAgregar} disabled={agregado}>
                {agregado ? "✓ Añadido" : "Agregar"}
              </button>}
        </div>
      </div>
    </article>
  );
}
