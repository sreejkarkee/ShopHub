import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import ProductCard from '../../components/ProductCard';
import { productCategories } from '../../constants/productCategories';
import { productConditions, productQualities } from '../../constants/productConditions';
import './Dashboard.css';

const emptyForm = { name: '', price: '', description: '', category: productCategories[0], imageUrl: '', condition: productConditions[0], quality: productQualities[0] };

const NEXT_ACTION = {
  placed: { label: 'Mark shipped', next: 'shipped' },
  shipped: { label: 'Mark out for delivery', next: 'out_for_delivery' },
  out_for_delivery: { label: 'Mark delivered', next: 'delivered' },
};

const STATUS_LABEL = {
  placed: 'Placed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function Dashboard() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [updating, setUpdating] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get('/orders/my-sales', { headers: authHeaders() })
      .then((res) => setSales(res.data))
      .catch(() => setSales([]));
    axios
      .get('/products/mine', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  const total = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const toShip = sales.filter((s) => (s.shipmentStatus || 'placed') === 'placed').length;
  const inTransit = sales.filter((s) => ['shipped', 'out_for_delivery'].includes(s.shipmentStatus)).length;

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const startEditing = (product) => {
    setEditingId(product._id);
    setForm({ name: product.name, price: product.price, description: product.description, category: product.category || 'Essentials', imageUrl: product.imageUrl || '', condition: product.condition || 'New', quality: product.quality || 'New' });
    setMessage('');
  };
  const cancelEditing = () => { setEditingId(null); setForm(emptyForm); };
  const saveProduct = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.put(`/products/${editingId}`, form, { headers: authHeaders() });
      setProducts((items) => items.map((item) => item._id === editingId ? data : item));
      cancelEditing();
      setMessage('Product updated.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Product could not be updated.');
    }
  };
  const removeProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/products/${id}`, { headers: authHeaders() });
      setProducts((items) => items.filter((item) => item._id !== id));
      if (editingId === id) cancelEditing();
      setMessage('Product deleted.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Product could not be deleted.');
    }
  };

  const advanceStatus = async (sale) => {
    const action = NEXT_ACTION[sale.shipmentStatus || 'placed'];
    if (!action) return;
    setUpdating(sale._id);
    setError('');
    try {
      await axios.patch(
        `/orders/${sale.orderId}/items/${sale.itemId}/shipment`,
        { shipmentStatus: action.next },
        { headers: authHeaders() }
      );
      setSales((prev) => prev.map((s) => (s._id === sale._id ? { ...s, shipmentStatus: action.next, status: action.next } : s)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status');
    } finally {
      setUpdating('');
    }
  };

  return (
    <main className="page-shell dashboard-page">
      <p className="eyebrow">Retailer studio</p>
      <h1>Your shop, at a glance.</h1>
      <section className="metric-strip"><div><span>Sales to date</span><strong>Rs.{total.toFixed(2)}</strong></div><div><span>To ship</span><strong>{toShip}</strong></div><div><span>In transit</span><strong>{inTransit}</strong></div></section>
      <div className="dashboard-heading"><div><p className="eyebrow">Activity</p><h2>Recent sales</h2></div><a href="/retailer/add-product">Add a product →</a></div>

      {error && <p className="sales-error">{error}</p>}

      <ul className="sales-list">
        {sales.map((s) => {
          const ship = s.shipmentStatus || 'placed';
          const action = NEXT_ACTION[ship];
          return (
            <li key={s._id} className="sale-row">
              <div className="sale-info">
                <strong>{s.productName}{s.quantity > 1 ? ` × ${s.quantity}` : ''}</strong>
                <small>Order …{String(s.orderId || '').slice(-6)} · {s.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</small>
                <span className={`ship-badge ship-${ship}`}>{STATUS_LABEL[ship] || ship}</span>
              </div>
              <div className="sale-side">
                <b>Rs.{Number(s.amount).toFixed(2)}</b>
                {action ? (
                  <button
                    className="ship-btn"
                    onClick={() => advanceStatus(s)}
                    disabled={updating === s._id || s.paymentStatus !== 'paid'}
                    title={s.paymentStatus !== 'paid' ? 'Waiting for customer payment' : action.label}
                  >
                    {updating === s._id ? 'Updating…' : action.label + ' →'}
                  </button>
                ) : (
                  <span className="ship-done">✓ {STATUS_LABEL[ship]}</span>
                )}
              </div>
            </li>
          );
        })}
        {!sales.length && <li className="sales-empty">Your first sale will appear here.</li>}
      </ul>
      <section className="retailer-products">
        <div className="dashboard-heading"><div><p className="eyebrow">Your catalog</p><h2>Added products</h2></div><span className="product-count">{products.length} listed</span></div>
        {editingId && <form className="retailer-product-form" onSubmit={saveProduct}>
          <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
          <input name="price" type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />
          <select name="category" value={form.category} onChange={handleChange}>{productCategories.map((category) => <option key={category}>{category}</option>)}</select>
          <select name="condition" value={form.condition} onChange={handleChange}>{productConditions.map((condition) => <option key={condition}>{condition}</option>)}</select>
          <select name="quality" value={form.quality} onChange={handleChange}>{productQualities.map((quality) => <option key={quality}>{quality}</option>)}</select>
          <input name="imageUrl" type="url" placeholder="Image URL" value={form.imageUrl} onChange={handleChange} />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
          <div className="retailer-form-actions"><button type="submit">Save changes</button><button type="button" onClick={cancelEditing}>Cancel</button></div>
        </form>}
        {message && <p className="form-success">{message}</p>}
        <div className="retailer-product-grid">{products.map((product) => <div className="retailer-product-item" key={product._id}><ProductCard product={product} canShop={false} /><div className="retailer-product-actions"><button onClick={() => startEditing(product)}>Edit</button><button onClick={() => removeProduct(product._id)}>Delete</button></div></div>)}</div>
        {!products.length && <p className="sales-empty">You have not added any products yet.</p>}
      </section>
    </main>
  );
}
