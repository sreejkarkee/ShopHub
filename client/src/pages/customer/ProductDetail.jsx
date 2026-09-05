import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import './ProductDetail.css';

export default function ProductDetail({ onAddToCart, isInCart }) {
  const { user } = useAuth();
  const canShop = user?.role === 'customer';
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [added, setAdded] = useState(() => isInCart(product?._id));
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const soldOut = product?.soldOut === true;

  useEffect(() => {
    if (product) return undefined;

    axios.get('/products').then(({ data }) => {
      setProduct(data.find((item) => String(item._id) === productId) || null);
    }).catch(() => setProduct(null)).finally(() => setLoading(false));
    return undefined;
  }, [product, productId]);

  const handleAdd = () => {
    if (added || isInCart(product._id)) return;
    onAddToCart(product);
    setAdded(true);
  };

  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
  const submitReview = async (event) => {
    event.preventDefault();
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const { data } = await axios.post(`/products/${productId}/reviews`, {
        rating: Number(reviewRating),
        comment: reviewComment,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setProduct(data.product);
      setReviewComment('');
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Review could not be added.');
    } finally {
      setReviewSubmitting(false);
    }
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
          <div className="detail-rating">{product.rating ? `${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}` : '☆☆☆☆☆'} <small>{product.rating ? Number(product.rating).toFixed(1) : 'No rating'} · {product.reviewCount || reviews.length} reviews</small></div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-purchase"><strong>${Number(product.price).toFixed(2)}</strong>{canShop && <button onClick={handleAdd} disabled={soldOut || added || isInCart(product._id)}>{soldOut ? 'Sold out' : added || isInCart(product._id) ? 'Added to bag ✓' : 'Add to bag →'}</button>}</div>
          <div className="detail-notes"><span>{product.condition || 'New'} · {product.quality || 'New'}</span><span>{soldOut ? 'Sold out' : 'In stock'}</span><span>Free delivery over $75</span><span>30-day returns</span></div>
        </div>
      </section>
      <section className="reviews-section">
        <div className="reviews-heading"><div><p className="eyebrow">Customer notes</p><h2>Reviews</h2></div><span>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span></div>
        {canShop && <form className="review-form" onSubmit={submitReview}>
          <label>Rating<select value={reviewRating} onChange={(event) => setReviewRating(event.target.value)}><option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Fine</option><option value="2">2 - Needs work</option><option value="1">1 - Poor</option></select></label>
          <label>Your review<textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="What did you think?" maxLength="1000" required /></label>
          <button type="submit" disabled={reviewSubmitting}>{reviewSubmitting ? 'Publishing...' : 'Publish review'} <span aria-hidden="true">→</span></button>
          {reviewError && <p className="form-error">{reviewError}</p>}
        </form>}
        <div className="review-list">{reviews.map((review) => <article className="review-item" key={review._id}><div className="review-meta"><strong>{review.user?.name || review.user?.email || 'Customer'}</strong><span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></div><p>{review.comment}</p></article>)}{!reviews.length && <p className="review-empty">No reviews yet. Be the first to share your experience.</p>}</div>
      </section>
    </main>
  );
}