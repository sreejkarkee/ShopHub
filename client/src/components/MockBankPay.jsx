import { useState } from 'react';
import './MockBankPay.css';

export const MOCK_BANKS = [
  'Mock State Bank',
  'Mock National Bank',
  'Mock City Bank',
  'Mock Rural Co-op Bank',
];

// Mock bank-transfer form. Amount is auto-filled and read-only.
// No real payment happens — onPay({ bank, accountNo }) runs the mock flow.
export default function MockBankPay({ amount, busyLabel, error, payLabel, onPay }) {
  const [bank, setBank] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [hint, setHint] = useState('');

  const handlePay = () => {
    if (busyLabel) return;
    if (!bank) {
      setHint('Please choose your bank.');
      return;
    }
    if (!/^\d{9,18}$/.test(accountNo.trim())) {
      setHint('Enter a valid 9–18 digit account number.');
      return;
    }
    setHint('');
    onPay({ bank, accountNo: accountNo.trim() });
  };

  return (
    <div className="mockbank">
      <p className="mockbank-title">
        Mock bank transfer <span>no real money moves</span>
      </p>
      <label className="mockbank-field">
        Bank
        <select value={bank} onChange={(e) => setBank(e.target.value)} disabled={!!busyLabel}>
          <option value="">Choose bank…</option>
          {MOCK_BANKS.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </label>
      <label className="mockbank-field">
        Account number
        <input
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 1234567890"
          value={accountNo}
          onChange={(e) => setAccountNo(e.target.value.replace(/[^\d]/g, '').slice(0, 18))}
          disabled={!!busyLabel}
        />
      </label>
      <div className="mockbank-amount">
        <span>Amount (auto)</span>
        <strong>Rs.{Number(amount || 0).toFixed(2)}</strong>
      </div>
      <button className="mockbank-pay" onClick={handlePay} disabled={!!busyLabel}>
        {busyLabel ? (
          <><span className="spinner" />{busyLabel}</>
        ) : (
          payLabel || `Pay Rs.${Number(amount || 0).toFixed(2)}`
        )}
      </button>
      {hint && <p className="mockbank-hint">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
