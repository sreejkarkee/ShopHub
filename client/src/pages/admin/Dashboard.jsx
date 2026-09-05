import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { productCategories } from '../../constants/productCategories';
import { productConditions, productQualities } from '../../constants/productConditions';
import './Dashboard.css';

const emptyForm = { name: '', price: '', description: '', category: productCategories[0], imageUrl: '', condition: productConditions[0], quality: productQualities[0] };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  useEffect(() => {
    axios
      .get('/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));
    loadProducts();
    loadUsers();
    loadPurchases();
  }, []);

  const loadProducts = () => axios.get('/products').then((res) => setProducts(res.data)).catch(() => setProducts([]));
  const loadUsers = () => axios.get('/admin/users', { headers }).then((res) => setUsers(res.data)).catch(() => setUsers([]));
  const loadPurchases = () => axios.get('/orders/admin-orders', { headers }).then((res) => setPurchases(res.data)).catch(() => setPurchases([]));
  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const request = editingId
        ? axios.put(`/products/${editingId}`, form, { headers })
        : axios.post('/products', form, { headers });
      const { data } = await request;
      setProducts((items) => editingId ? items.map((item) => item._id === editingId ? data : item) : [data, ...items]);
      setForm(emptyForm);
      setEditingId(null);
      setMessage(editingId ? 'Product updated.' : 'Product created.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Product could not be saved.');
    }
  };
  const editProduct = (product) => { setEditingId(product._id); setForm({ name: product.name, price: product.price, description: product.description, category: product.category || 'Essentials', imageUrl: product.imageUrl || '', condition: product.condition || 'New', quality: product.quality || 'New' }); setMessage(''); };
  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await axios.delete(`/products/${id}`, { headers }); setProducts((items) => items.filter((item) => item._id !== id)); setMessage('Product deleted.'); } catch (error) { setMessage(error.response?.data?.message || 'Product could not be deleted.'); }
  };
  const deleteUser = async (user) => {
    if (!window.confirm(`Remove ${user.name || user.email}?`)) return;
    try {
      await axios.delete(`/admin/users/${user._id}`, { headers });
      setUsers((items) => items.filter((item) => item._id !== user._id));
      setMessage('User removed.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'User could not be removed.');
    }
  };

  return (
    <main className="page-shell dashboard-page">
      <p className="eyebrow">ShopHub operations</p><h1>Keep the marketplace moving.</h1>
      <section className="metric-strip"><div><span>Total sales</span><strong>${stats?.totalSales || '—'}</strong></div><div><span>Access</span><strong>Admin</strong></div><div><span>System</span><strong className="status-dot">Online</strong></div></section>
      {!stats && <p className="form-hint">Live metrics will appear when the admin service is connected.</p>}
      <section className="admin-products">
        <div className="dashboard-heading"><div><p className="eyebrow">Catalog control</p><h2>Products</h2></div><span className="admin-product-count">{products.length} listed</span></div>
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
          <input name="price" type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />
          <select name="category" value={form.category} onChange={handleChange}>{productCategories.map((category) => <option key={category}>{category}</option>)}</select>
          <select name="condition" value={form.condition} onChange={handleChange}>{productConditions.map((condition) => <option key={condition}>{condition}</option>)}</select>
          <select name="quality" value={form.quality} onChange={handleChange}>{productQualities.map((quality) => <option key={quality}>{quality}</option>)}</select>
          <input name="imageUrl" type="url" placeholder="Image URL" value={form.imageUrl} onChange={handleChange} />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
          <div className="admin-form-actions"><button type="submit">{editingId ? 'Save changes' : 'Create product'} <span>→</span></button>{editingId && <button type="button" className="admin-cancel" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}</div>
        </form>
        {message && <p className="form-success">{message}</p>}
        <div className="admin-product-list">{products.map((product) => <article className="admin-product-row" key={product._id}><div>{product.imageUrl && <img src={product.imageUrl} alt="" />}<div><strong>{product.name}</strong><small>{product.category} · {product.condition || 'New'} · {product.quality || 'New'} · ${Number(product.price).toFixed(2)}</small><small className="admin-product-creator">Added by: {product.retailer?.name || product.retailer?.email || 'Admin'}{product.retailer?.role && ` (${product.retailer.role})`}</small></div></div><div className="admin-product-actions"><button onClick={() => editProduct(product)}>Edit</button><button onClick={() => deleteProduct(product._id)}>Delete</button></div></article>)}{!products.length && <p className="sales-empty">No server products available.</p>}</div>
      </section>
      <section className="admin-users">
        <div className="dashboard-heading"><div><p className="eyebrow">Account control</p><h2>Users</h2></div><span className="admin-product-count">{users.length} accounts</span></div>
        <div className="admin-user-list">{users.map((user) => <article className="admin-user-row" key={user._id}><div><strong>{user.name || 'Unnamed user'}</strong><small>{user.email} · {user.role}</small></div><button onClick={() => deleteUser(user)}>Remove</button></article>)}{!users.length && <p className="sales-empty">No customer or retailer accounts available.</p>}</div>
      </section>
      <section className="admin-purchases">
        <div className="dashboard-heading"><div><p className="eyebrow">Order history</p><h2>Customer purchases</h2></div><span className="admin-product-count">{purchases.length} items sold</span></div>
        <div className="admin-purchase-list">
          {purchases.map((purchase) => (
            <article className="admin-purchase-row" key={purchase._id}>
              <div><strong>{purchase.productName}</strong><small>{purchase.customer?.name || 'Unnamed customer'} · {purchase.customer?.email || 'No email'}</small></div>
              <div><small>{new Date(purchase.createdAt).toLocaleDateString()}</small><strong className={`admin-purchase-status ${purchase.status}`}>{purchase.status}</strong></div>
              <strong>${Number(purchase.amount).toFixed(2)}</strong>
            </article>
          ))}
          {!purchases.length && <p className="sales-empty">No customer purchases yet.</p>}
        </div>
      </section>
    </main>
  );
}