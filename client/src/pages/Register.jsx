import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "./Login.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/register", form);
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Try a different email.");
    }
  };

  return (
    <div className="auth-layout"><div className="auth-aside"><p className="eyebrow">Join the edit</p><h1>Make room<br />for better.</h1><p>Open a shop, discover a favorite, or both.</p></div><div className="login-container">
      <p className="eyebrow">New account</p><h2>Create your account</h2><p className="form-hint">It only takes a minute.</p>
      <form onSubmit={handleSubmit}>
        <label>Your name
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        /></label>
        <label>Email
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        /></label>
        <label>Password
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        /></label>
        <label>I'm joining as
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="customer">Customer</option>
          <option value="retailer">Retailer</option>
        </select></label>
        <button type="submit">Create account <span aria-hidden="true">→</span></button>
      </form>
      {error && <p className="form-error">{error}</p>}<p className="form-footer">Already have an account? <a href="/login">Sign in</a></p>
    </div></div>
  );
}
