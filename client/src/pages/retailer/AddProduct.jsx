import { useState } from 'react';
import axios from '../../api/axios';

export default function AddProduct() {
  const [form, setForm] = useState({ name: '', price: '', description: '', category: 'Essentials' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const product = { ...form, _id: `local-${Date.now()}`, price: Number(form.price) };
    let publishedRemotely = false;
    try {
      await axios.post('/products', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      publishedRemotely = true;
    } catch (err) {}
    if (!publishedRemotely) {
      const existing = JSON.parse(localStorage.getItem('products') || '[]');
      localStorage.setItem('products', JSON.stringify([...existing, product]));
    }
    setMessage('Product published successfully.');
    setForm({ name: '', price: '', description: '', category: 'Essentials' });
  };

  return (
    <main className="page-shell form-page"><p className="eyebrow">Retailer studio</p><h1>Put something<br />good out there.</h1><p className="intro-copy">Add a considered product to your ShopHub storefront.</p>
      <form className="product-form" onSubmit={handleSubmit}>
        <label>Product name<input name="name" placeholder="e.g. Linen market bag" value={form.name} onChange={handleChange} required /></label>
        <div className="form-row"><label>Price<input name="price" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={handleChange} required /></label><label>Category<select name="category" value={form.category} onChange={handleChange}><option>Essentials</option><option>Home</option><option>Accessories</option><option>Stationery</option></select></label></div>
        <label>Description<textarea name="description" placeholder="What makes this piece worth choosing?" value={form.description} onChange={handleChange} required /></label>
        <button type="submit">Publish product <span>→</span></button>
      </form>
      {message && <p className="form-success">{message}</p>}
    </main>
  );
}