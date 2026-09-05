import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", form);
      login(res.data);

      // redirect based on role
      if (res.data.role === "retailer") {
        navigate("/retailer/dashboard");
      } else if (res.data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/products");
      }
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="auth-layout"><div className="auth-aside"><p className="eyebrow">Welcome back</p><h1>Good things,<br />well chosen.</h1><p>Shop independent. Keep the everyday considered.</p></div><div className="login-container">
      <p className="eyebrow">Your account</p><h2>Sign in to ShopHub</h2><p className="form-hint">Pick up where you left off.</p>
      <form onSubmit={handleSubmit}>
        <label>Email<input type="email" required placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<div className="password-field"><input type={showPassword ? "text" : "password"} placeholder="Your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div></label>
        <button type="submit">Continue <span aria-hidden="true">→</span></button>
      </form>
      {error && <p className="form-error">{error}</p>}<p className="form-footer">New to ShopHub? <a href="/register">Create an account</a></p>
    </div></div>
  );
} 