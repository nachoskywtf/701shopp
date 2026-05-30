import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Image as ImageIcon, Zap, UploadCloud, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

// Interface basada en el esquema de BD requerido
interface Product {
  id: string;
  name: string;
  brand: string;
  stock: number;
  price: number;
  compare_at_price: number; // o retail
  image: string;
}

export function ProductsManager() {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      setCatalog(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    setCatalog(prev => prev.filter(p => p.id !== id));
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting product:', err);
      fetchProducts(); // rollback
    }
  };

  const handleAddProduct = async () => {
    const newProduct = {
      name: 'Nuevo Perfume',
      brand: 'Marca Genérica',
      stock: 10,
      price: 49990,
      compare_at_price: 59990,
      image: '',
    };

    try {
      const { data, error } = await supabase.from('products').insert([newProduct]).select();
      if (error) throw error;
      if (data) {
        setCatalog(prev => [data[0], ...prev]);
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const updateStock = async (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    // Optimistic
    setCatalog(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    try {
      await supabase.from('products').update({ stock: newStock }).eq('id', id);
    } catch (err) {
      console.error('Error updating stock:', err);
      fetchProducts();
    }
  };

  const toggleFlashSale = async (product: Product) => {
    // Determinar si está en oferta (price < compare_at_price)
    const isFlash = product.price < product.compare_at_price;
    let newPrice = product.price;
    let newCompareAt = product.compare_at_price;

    if (isFlash) {
      // Quitar oferta (igualar price a compare_at_price)
      newPrice = product.compare_at_price;
    } else {
      // Poner oferta (ej. 20% descuento)
      newCompareAt = product.price;
      newPrice = Math.floor(product.price * 0.8);
    }

    setCatalog(prev => prev.map(p => p.id === product.id ? { ...p, price: newPrice, compare_at_price: newCompareAt } : p));
    
    try {
      await supabase.from('products').update({ price: newPrice, compare_at_price: newCompareAt }).eq('id', product.id);
    } catch (err) {
      console.error('Error toggling flash sale:', err);
      fetchProducts();
    }
  };

  const updatePriceValue = async (id: string, field: 'price' | 'compare_at_price', value: number) => {
    setCatalog(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    try {
      await supabase.from('products').update({ [field]: value }).eq('id', id);
    } catch (err) {
      console.error('Error updating price:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(id);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('perfumes').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('perfumes').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      await supabase.from('products').update({ image: publicUrl }).eq('id', id);
      setCatalog(prev => prev.map(p => p.id === id ? { ...p, image: publicUrl } : p));

    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Error al subir la imagen. Verifica que el bucket "perfumes" exista y sea público.');
    } finally {
      setUploadingId(null);
    }
  };

  const filtered = catalog.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400, margin: '0 auto' }}
    >
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Gestor de Inventario Total (Real-time)
          </h2>
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>
            {loading ? 'Sincronizando con base de datos...' : `Control en vivo conectado a Supabase. ${catalog.length} productos sincronizados.`}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 12, top: 10, width: 16, height: 16, color: '#9CA3AF' }} />
            <input 
              type="text" 
              placeholder="Buscar perfume o marca..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                padding: '8px 16px 8px 36px',
                color: '#111827',
                fontSize: 13,
                outline: 'none',
                width: 260,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddProduct}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#111827',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            Agregar Nuevo Perfume
          </motion.button>
        </div>
      </motion.div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
          <Loader2 style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          Cargando catálogo desde Supabase...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
          <AnimatePresence>
            {filtered.map((product) => {
              const isFlashSale = product.price < product.compare_at_price;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #F3F4F6', background: '#F9FAFB', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: product.stock > 0 ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {product.stock > 0 ? <CheckCircle2 style={{ width: 12, height: 12 }} /> : <AlertCircle style={{ width: 12, height: 12 }} />}
                      {product.stock > 0 ? 'EN STOCK' : 'OUT OF STOCK'}
                    </span>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Eliminar de la Base de Datos"
                    >
                      <Trash2 style={{ width: 16, height: 16 }} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', padding: 16, gap: 16 }}>
                    <div style={{ width: 80, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ width: 80, height: 80, borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB', overflow: 'hidden', position: 'relative' }}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon style={{ width: 24, height: 24, color: '#D1D5DB' }} />
                          </div>
                        )}
                      </div>
                      <label style={{ 
                        background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 10, padding: '4px', 
                        color: '#4B5563', cursor: uploadingId === product.id ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', gap: 4, fontWeight: 600, opacity: uploadingId === product.id ? 0.5 : 1
                      }}>
                        <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, product.id)} disabled={uploadingId === product.id} />
                        {uploadingId === product.id ? <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} /> : <UploadCloud style={{ width: 12, height: 12 }} />}
                        {uploadingId === product.id ? 'Subiendo' : 'Subir'}
                      </label>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>{product.brand}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', lineHeight: 1.2, marginTop: 2, marginBottom: 12 }}>{product.name}</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <span style={{ fontSize: 12, color: '#4B5563', fontWeight: 600 }}>Stock Actual:</span>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: 6, overflow: 'hidden' }}>
                          <button onClick={() => updateStock(product.id, product.stock, -1)} style={{ padding: '4px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#111827', fontWeight: 700 }}>-</button>
                          <div style={{ padding: '4px 12px', fontSize: 13, fontWeight: 700, borderLeft: '1px solid #D1D5DB', borderRight: '1px solid #D1D5DB', minWidth: 40, textAlign: 'center' }}>{product.stock}</div>
                          <button onClick={() => updateStock(product.id, product.stock, 1)} style={{ padding: '4px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#111827', fontWeight: 700 }}>+</button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#4B5563', fontWeight: 600 }}>Precio {isFlashSale ? 'Normal' : ''} (CLP)</span>
                          <input 
                            type="number" 
                            value={isFlashSale ? product.compare_at_price : product.price}
                            onChange={(e) => updatePriceValue(product.id, isFlashSale ? 'compare_at_price' : 'price', Number(e.target.value))}
                            style={{ width: 90, padding: '4px 8px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 12, fontWeight: 700, color: '#111827', textAlign: 'right' }}
                          />
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 10, borderTop: '1px dashed #D1D5DB' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Zap style={{ width: 14, height: 14, color: isFlashSale ? '#D97706' : '#9CA3AF' }} />
                            <span style={{ fontSize: 12, color: isFlashSale ? '#D97706' : '#6B7280', fontWeight: 700 }}>Oferta Flash</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {isFlashSale && (
                              <input 
                                type="number" 
                                value={product.price}
                                onChange={(e) => updatePriceValue(product.id, 'price', Number(e.target.value))}
                                style={{ width: 90, padding: '4px 8px', borderRadius: 6, border: '1px solid #F59E0B', background: '#FEF3C7', fontSize: 12, fontWeight: 700, color: '#B45309', textAlign: 'right' }}
                              />
                            )}
                            <div 
                              onClick={() => toggleFlashSale(product)}
                              style={{ 
                                width: 36, height: 20, borderRadius: 20, background: isFlashSale ? '#D97706' : '#D1D5DB', 
                                position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                              }}
                            >
                              <motion.div 
                                layout
                                animate={{ x: isFlashSale ? 18 : 2 }}
                                style={{ width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} 
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
