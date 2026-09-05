import { useState } from 'react';
import './ProductCard.css';

export default function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="product-card">
      <div className="product-card-image">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">{product.category?.slice(0, 1) || 'S'}</div>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-meta"><span>{product.category || 'Essentials'}</span><span className="stock-label">In stock</span></div>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-rating"><span aria-label={`${product.rating || 4.7} out of 5 stars`}>★ ★ ★ ★ ★</span> <small>{product.rating || '4.7'} · {product.reviews || 0} reviews</small></div>
        <p className="product-card-description">{product.description}</p>
        <div className="product-card-footer"><p className="product-card-price">${Number(product.price).toFixed(2)}</p><button className={added ? 'product-card-btn added' : 'product-card-btn'} onClick={handleAdd} aria-label={`Add ${product.name} to bag`}><span>{added ? 'Added to bag' : 'Add to bag'}</span><span aria-hidden="true">{added ? '✓' : '+'}</span></button></div>
      </div>
    </div>
  );
}