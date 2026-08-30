import { useEffect, useState } from 'react';
import axios from '../../api/axios';

export default function Dashboard() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    axios
      .get('/orders/my-sales', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setSales(res.data))
      .catch(() => setSales([]));
  }, []);

  const total = sales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div>
      <h2>My Sales</h2>
      <p>Total: ${total}</p>
      <ul>
        {sales.map((s) => (
          <li key={s._id}>{s.productName} — ${s.amount}</li>
        ))}
      </ul>
    </div>
  );
}