import { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axios';
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../../contexts/AuthContext';
import './ProductList.css';

export default function ProductList({ onAddToCart }) {
  const { user } = useAuth();
  const canShop = user?.role === 'customer';
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : [];
  });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    axios.get('/products').then((res) => {
      if (Array.isArray(res.data)) setProducts(res.data);
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
        {visibleProducts.map((product) => <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} canShop={canShop} />)}
      </div>
      {!visibleProducts.length && <div className="empty-state"><h2>No pieces found</h2><p>Try a different search or category.</p></div>}
    </main>
  );
}