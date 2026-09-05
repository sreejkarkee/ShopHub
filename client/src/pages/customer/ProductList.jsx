import { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axios';
import ProductCard from '../../components/ProductCard';

const starterProducts = [
  { _id: 'starter-1', name: 'Everyday Canvas Tote', price: 34, category: 'Accessories', description: 'A durable carry-all made for days in motion.', badge: 'Bestseller', rating: 4.8, reviews: 124, imageUrl: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=700&q=80' },
  { _id: 'starter-2', name: 'Studio Ceramic Set', price: 48, category: 'Home', description: 'Quiet, tactile pieces for your morning ritual.', badge: 'Popular', rating: 4.9, reviews: 86, imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=700&q=80' },
  { _id: 'starter-3', name: 'Field Notes Journal', price: 18, category: 'Stationery', description: 'A considered place for ideas, lists, and plans.', rating: 4.7, reviews: 52, imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80' },
  { _id: 'starter-4', name: 'Soft Knit Throw', price: 72, category: 'Home', description: 'Textured warmth with a clean, modern finish.', badge: 'New', rating: 4.6, reviews: 31, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80' },
  { _id: 'starter-5', name: 'Sunday Glass Carafe', price: 39, category: 'Home', description: 'A simple silhouette for slow pours and long lunches.', rating: 4.8, reviews: 67, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80' },
  { _id: 'starter-6', name: 'Linen Market Shirt', price: 86, category: 'Apparel', description: 'Lightweight, easy, and made to be worn often.', badge: 'New', rating: 4.9, reviews: 44, imageUrl: 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=700&q=80' },
  { _id: 'starter-7', name: 'Daily Ritual Candle', price: 28, category: 'Wellness', description: 'A warm cedar and citrus blend for evening reset.', rating: 4.7, reviews: 109, imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80' },
  { _id: 'starter-8', name: 'Leather Key Organiser', price: 24, category: 'Accessories', description: 'A neat home for the things you carry every day.', rating: 4.5, reviews: 28, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=80' },
  { _id: 'starter-9', name: 'Ridge Pour-Over Kit', price: 64, category: 'Kitchen', description: 'A calm, precise start to better coffee at home.', badge: 'Bestseller', rating: 4.9, reviews: 204, imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=700&q=80' },
  { _id: 'starter-10', name: 'Pocket Tool Set', price: 42, category: 'Essentials', description: 'Small tools for useful fixes around the house.', rating: 4.6, reviews: 73, imageUrl: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=700&q=80' },
  { _id: 'starter-11', name: 'Woven Storage Basket', price: 56, category: 'Home', description: 'Hand-finished texture for keeping everyday things close.', rating: 4.8, reviews: 91, imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=700&q=80' },
  { _id: 'starter-12', name: 'Milled Wool Scarf', price: 58, category: 'Apparel', description: 'Soft structure and a little warmth for cooler days.', rating: 4.7, reviews: 38, imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=700&q=80' },
];

export default function ProductList({ onAddToCart }) {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    return saved ? [...starterProducts, ...JSON.parse(saved)] : starterProducts;
  });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    axios.get('/products').then((res) => {
      if (Array.isArray(res.data) && res.data.length) setProducts(res.data);
    }).catch(() => {});
  }, []);

  const categories = ['All', ...new Set(products.map((product) => product.category || 'Essentials'))];
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === 'All' || (product.category || 'Essentials') === category);
  }), [products, query, category]);

  return (
    <main className="page-shell catalog-page">
      <section className="catalog-intro">
        <div><p className="eyebrow">The ShopHub edit</p><h1>Objects with a point of view.</h1><p className="intro-copy">A small collection of useful, beautiful things from independent retailers.</p></div>
        <div className="catalog-note"><strong>{products.length}</strong><span>curated pieces<br />available today</span></div>
      </section>
      <section className="shop-benefits"><span>Free delivery over $75</span><span>Independent makers</span><span>Easy 30-day returns</span><span>Secure checkout</span></section>
      <section className="catalog-toolbar">
        <label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the collection" /></label>
        <div className="filter-list">{categories.map((item) => <button key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => setCategory(item)}>{item}</button>)}</div>
      </section>
      <div className="results-row"><strong>{visibleProducts.length} results</strong><span>Curated for everyday living</span></div>
      <div className="product-grid">
        {visibleProducts.map((product) => <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} />)}
      </div>
      {!visibleProducts.length && <div className="empty-state"><h2>No pieces found</h2><p>Try a different search or category.</p></div>}
    </main>
  );
}