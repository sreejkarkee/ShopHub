import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';
import './ProductDetail.css';

export default function ProductDetail({ onAddToCart }) {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) return undefined;

    axios.get('/products').then(({ data }) => {
      setProduct(data.find((item) => String(item._id) === productId) || null);
    }).catch(() => setProduct(null)).finally(() => setLoading(false));
    return undefined;
  }, [product, productId]);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  if (loading) return <main className="page-shell detail-state">Loading product...</main>;
  if (!product) {
    return <main className="page-shell detail-state"><h1>Product not found</h1><button className="detail-back" onClick={() => navigate('/products')}>Back to collection</button></main>;
  }

  return (
    <main className="page-shell product-detail-page">
      <button className="detail-back" onClick={() => navigate('/products')}>← Back to collection</button>
      <section className="product-detail">
        <div className="detail-image">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>{product.category?.slice(0, 1) || 'S'}</span>}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{product.category || 'Essentials'}</p>
          <h1>{product.name}</h1>
          <div className="detail-rating">★ ★ ★ ★ ★ <small>{product.rating || '4.7'} · {product.reviews || 0} reviews</small></div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-purchase"><strong>${Number(product.price).toFixed(2)}</strong><button onClick={handleAdd}>{added ? 'Added to bag ✓' : 'Add to bag →'}</button></div>
          <div className="detail-notes"><span>In stock</span><span>Free delivery over $75</span><span>30-day returns</span></div>
        </div>
      </section>
    </main>
  );
}