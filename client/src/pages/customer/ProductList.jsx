import { useEffect, useState } from 'react';
import axios from '../../api/axios';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/products').then((res) => setProducts(res.data));
  }, []);

  return (
    <div>
      <h2>Products</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {products.map((p) => (
          <div key={p._id} style={{ border: '1px solid #ccc', padding: '1rem', width: '200px' }}>
            <h3>{p.name}</h3>
            <p>${p.price}</p>
            <p>{p.description}</p>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}