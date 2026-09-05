import { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axios';
import ProductCard from '../../components/ProductCard';

const starterProducts = [
  { _id: 'starter-1', name: 'Everyday Canvas Tote', price: 34, category: 'Accessories', description: 'A durable carry-all made for days in motion.' },
  { _id: 'starter-2', name: 'Studio Ceramic Set', price: 48, category: 'Home', description: 'Quiet, tactile pieces for your morning ritual.' },
  { _id: 'starter-3', name: 'Field Notes Journal', price: 18, category: 'Stationery', description: 'A considered place for ideas, lists, and plans.' },
  { _id: 'starter-4', name: 'Soft Knit Throw', price: 72, category: 'Home', description: 'Textured warmth with a clean, modern finish.' },
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
      <section className="catalog-toolbar">
        <label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the collection" /></label>
        <div className="filter-list">{categories.map((item) => <button key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => setCategory(item)}>{item}</button>)}</div>
      </section>
      <div className="product-grid">
        {visibleProducts.map((product) => <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} />)}
      </div>
      {!visibleProducts.length && <div className="empty-state"><h2>No pieces found</h2><p>Try a different search or category.</p></div>}
    </main>
  );
}