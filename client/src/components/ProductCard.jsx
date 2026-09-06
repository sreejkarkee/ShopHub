import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

export default function ProductCard({
  product,
  onAddToCart,
  isInCart = false,
  canShop = true,
}) {
  const [added, setAdded] = useState(isInCart);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const rating = Number(product.rating || 0);
  const reviewCount = Array.isArray(product.reviews)
    ? product.reviews.length
    : Number(product.reviewCount || product.reviews || 0);
  const stars = rating
    ? `${"★".repeat(Math.round(rating))}${"☆".repeat(5 - Math.round(rating))}`
    : "☆☆☆☆☆";
  const soldOut = product.soldOut === true;

  const handleAdd = () => {
    if (soldOut || added || isInCart) return;
    onAddToCart(product, quantity);
    setAdded(true);
  };

  return (
    <article
      className="product-card"
      onClick={() =>
        navigate(`/products/${product._id}`, { state: { product } })
      }
    >
      <div className="product-card-image">
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
        {soldOut && (
          <span className="product-badge sold-out-badge">Sold out</span>
        )}
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">
            {product.category?.slice(0, 1) || "S"}
          </div>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-meta">
          <span>{product.category || "Essentials"}</span>
          <span className="product-card-condition">
            <span className="stock-label">{product.condition || "New"}</span>
            <span className="product-card-quality">
              {product.quality || "New"}
            </span>
          </span>
        </div>
        <h3 className="product-card-name">{product.name}</h3>
        {product.retailer && (
          <small className="product-card-retailer">
            By {product.retailer.name || product.retailer.email}
          </small>
        )}
        <div className="product-card-rating">
          <span
            aria-label={rating ? `${rating} out of 5 stars` : "No ratings yet"}
          >
            {stars}
          </span>{" "}
          <small>
            {rating ? rating.toFixed(1) : "No rating"} · {reviewCount} reviews
          </small>
        </div>
        <p className="product-card-description">{product.description}</p>
        <div className="product-card-footer">
          <p className="product-card-price">
            Rs.{Number(product.price).toFixed(2)}
          </p>
          {canShop && (
            <div className="product-card-actions" onClick={(event) => event.stopPropagation()}>
              <label className="quantity-picker">
                <span>Qty</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                />
              </label>
              <button
                className={
                  soldOut
                    ? "product-card-btn sold-out"
                    : added || isInCart
                      ? "product-card-btn added"
                      : "product-card-btn"
                }
                onClick={(event) => {
                  event.stopPropagation();
                  handleAdd();
                }}
                aria-label={
                  soldOut
                    ? `${product.name} is sold out`
                    : added || isInCart
                      ? `${product.name} added to cart`
                      : `Add ${product.name} to cart`
                }
                disabled={soldOut || added || isInCart}
              >
                <span>
                  {soldOut
                    ? "Sold out"
                    : added || isInCart
                      ? "Added to cart"
                      : "Add to cart"}
                </span>
                <span aria-hidden="true">
                  {soldOut ? "—" : added || isInCart ? "✓" : "+"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}