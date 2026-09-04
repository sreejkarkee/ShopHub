import './ProductCard.css';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="product-card-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">No Image</div>
        )}
      </div>
      <h3 className="product-card-name">{product.name}</h3>
      <p className="product-card-price">${product.price}</p>
      <p className="product-card-description">{product.description}</p>
      <button className="product-card-btn" onClick={() => onAddToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
}