import './ProductCard.css';

export default function ProductCard({ product, onAddToCart }) {
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
      <div className="product-card-meta"><span>{product.category || 'Essentials'}</span><span>In stock</span></div>
      <h3 className="product-card-name">{product.name}</h3>
      <div className="product-card-rating"><span aria-label={`${product.rating || 4.7} out of 5 stars`}>★ ★ ★ ★ ★</span> <small>({product.reviews || 0})</small></div>
      <p className="product-card-price">${Number(product.price).toFixed(2)}</p>
      <p className="product-card-description">{product.description}</p>
      <button className="product-card-btn" onClick={() => onAddToCart(product)}>
        Add to bag <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}