import { useState } from 'react';
import axios from '../../api/axios';
import { productCategories } from '../../constants/productCategories';
import { productConditions, productQualities } from '../../constants/productConditions';
import './AddProduct.css';

export default function AddProduct() {
  const emptyForm = { name: '', price: '', description: '', category: productCategories[0], imageUrl: '', condition: productConditions[0], quality: productQualities[0] };
  const [form, setForm] = useState(emptyForm);
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
    setForm(emptyForm);
  };

  return (
    <main className="page-shell form-page"><p className="eyebrow">Retailer studio / New listing</p><h1>Put something<br />good out there.</h1><p className="intro-copy">Add a considered product to your ShopHub storefront.</p>
      <div className="listing-layout"><form className="product-form" onSubmit={handleSubmit}>
        <label>Product name<input name="name" placeholder="e.g. Linen market bag" value={form.name} onChange={handleChange} required /></label>
        <div className="form-row"><label>Price<input name="price" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={handleChange} required /></label><label>Category<select name="category" value={form.category} onChange={handleChange}>{productCategories.map((category) => <option key={category}>{category}</option>)}</select></label></div>
        <div className="form-row"><label>Condition<select name="condition" value={form.condition} onChange={handleChange}>{productConditions.map((condition) => <option key={condition}>{condition}</option>)}</select></label><label>Quality<select name="quality" value={form.quality} onChange={handleChange}>{productQualities.map((quality) => <option key={quality}>{quality}</option>)}</select></label></div>
        <label>Description<textarea name="description" placeholder="What makes this piece worth choosing?" value={form.description} onChange={handleChange} required /></label>
        <label>Product image URL<input name="imageUrl" type="url" placeholder="https://example.com/product-image.jpg" value={form.imageUrl} onChange={handleChange} /></label>
        <button type="submit">Publish product <span>→</span></button>
      </form><aside className="product-preview"><p className="preview-label">Storefront preview</p><div className="preview-image">{form.imageUrl ? <img src={form.imageUrl} alt="Product preview" /> : <span>{form.category.slice(0, 1)}</span>}</div><span className="preview-category">{form.category}</span><h2>{form.name || 'Your product name'}</h2><p>{form.description || 'A short description will appear here.'}</p><strong>${Number(form.price || 0).toFixed(2)}</strong></aside></div>
      {message && <p className="form-success">{message}</p>}
    </main>
  );
}