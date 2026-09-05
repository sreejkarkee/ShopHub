import './ProductCard.css';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="product-card-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">{product.category?.slice(0, 1) || 'S'}</div>
        )}
      </div>
      <div className="product-card-meta"><span>{product.category || 'Essentials'}</span><span>In stock</span></div>
      <h3 className="product-card-name">{product.name}</h3>
      <p className="product-card-price">${Number(product.price).toFixed(2)}</p>
      <p className="product-card-description">{product.description}</p>
      <button className="product-card-btn" onClick={() => onAddToCart(product)}>
        Add to bag <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}