import React, { useState, useMemo } from "react";

const PRODUCTS = [
  { id: "014", name: "Weighted tray, ash", category: "Desk", price: 68, tone: "#C9C2B4", desc: "Solid ash, brass corner weight" },
  { id: "027", name: "Stacking bowl set", category: "Table", price: 94, tone: "#B7C4B9", desc: "Three sizes, unglazed stoneware" },
  { id: "031", name: "Reading lamp, low", category: "Desk", price: 142, tone: "#39413A", desc: "Dimmable, cast iron base" },
  { id: "008", name: "Linen napkin, set of 4", category: "Table", price: 38, tone: "#D8CFBE", desc: "Stonewashed European linen" },
  { id: "052", name: "Pencil cup, turned oak", category: "Desk", price: 29, tone: "#8B6F4E", desc: "Hand-turned, oiled finish" },
  { id: "019", name: "Carafe, blown glass", category: "Table", price: 56, tone: "#A9B8BE", desc: "600ml, hand-blown" },
];

const CATEGORIES = ["All", "Desk", "Table"];

function useCart() {
  const [items, setItems] = useState([]);
  const add = (p) =>
    setItems((cur) => {
      const found = cur.find((i) => i.id === p.id);
      if (found) return cur.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...cur, { ...p, qty: 1 }];
    });
  const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id));
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return { items, add, remove, total, count };
}

function CatalogCard({ product, onAdd }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: "1px solid #DEDCD3",
        background: "#FBFAF7",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 150ms ease",
        borderColor: hover ? "#16181A" : "#DEDCD3",
      }}
    >
      <div style={{ position: "relative", background: product.tone, aspectRatio: "4 / 3" }}>
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.05em",
            color: "rgba(0,0,0,0.55)",
            background: "rgba(246,245,241,0.85)",
            padding: "2px 6px",
          }}
        >
          NO. {product.id}
        </span>
        <button
          onClick={() => onAdd(product)}
          style={{
            position: "absolute",
            right: 10,
            bottom: 10,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.04em",
            background: "#16181A",
            color: "#F6F5F1",
            border: "none",
            padding: "8px 12px",
            cursor: "pointer",
            opacity: hover ? 1 : 0,
            transform: hover ? "translateY(0)" : "translateY(4px)",
            transition: "opacity 150ms ease, transform 150ms ease",
          }}
        >
          + ADD
        </button>
      </div>
      <div style={{ padding: "14px 14px 16px" }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, margin: "0 0 4px", color: "#16181A" }}>
          {product.name}
        </p>
        <p style={{ fontSize: 13, color: "#8C8A82", margin: "0 0 10px" }}>{product.desc}</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span
            style={{
              flex: 1,
              borderBottom: "1px dotted #C9C6BC",
              transform: "translateY(-4px)",
            }}
          />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: "#16181A" }}>
            ${product.price}
          </span>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ open, onClose, items, remove, total }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(22,24,26,0.35)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 200ms ease",
          zIndex: 40,
        }}
      />
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: 340,
          maxWidth: "88vw",
          background: "#FBFAF7",
          borderLeft: "1px solid #DEDCD3",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 220ms ease",
          zIndex: 41,
          display: "flex",
          flexDirection: "column",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        <div style={{ padding: "20px 22px 14px", borderBottom: "1px dashed #C9C6BC" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, letterSpacing: "0.08em", color: "#16181A" }}>ORDER TICKET</span>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#8C8A82" }}
              aria-label="Close cart"
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px 22px" }}>
          {items.length === 0 && (
            <p style={{ fontSize: 13, color: "#8C8A82", marginTop: 24 }}>No items ticketed yet.</p>
          )}
          {items.map((i) => (
            <div key={i.id} style={{ padding: "12px 0", borderBottom: "1px dotted #DEDCD3" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#16181A" }}>
                <span>{i.qty} × {i.name}</span>
                <span>${(i.price * i.qty).toFixed(2)}</span>
              </div>
              <button
                onClick={() => remove(i.id)}
                style={{
                  marginTop: 4,
                  background: "none",
                  border: "none",
                  color: "#B4522F",
                  fontSize: 11,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                remove
              </button>
            </div>
          ))}
        </div>

        <div style={{ padding: "16px 22px 22px", borderTop: "1px dashed #C9C6BC" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#16181A", marginBottom: 14 }}>
            <span>TOTAL</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            disabled={items.length === 0}
            style={{
              width: "100%",
              padding: "12px 0",
              background: items.length === 0 ? "#DEDCD3" : "#16181A",
              color: items.length === 0 ? "#8C8A82" : "#F6F5F1",
              border: "none",
              fontSize: 12,
              letterSpacing: "0.08em",
              cursor: items.length === 0 ? "default" : "pointer",
            }}
          >
            CHECKOUT →
          </button>
        </div>
      </aside>
    </>
  );
}

export default function PlinthStore() {
  const [cartOpen, setCartOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const { items, add, remove, total, count } = useCart();

  const filtered = useMemo(
    () => (category === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category)),
    [category]
  );

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#F6F5F1",
        color: "#16181A",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .plinth-nav a { color: #16181A; text-decoration: none; font-size: 13px; letter-spacing: 0.03em; }
        .plinth-nav a:hover { color: #4B5D45; }
        .plinth-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1px; background: #DEDCD3; border: 1px solid #DEDCD3; }
        .plinth-grid > * { background: #FBFAF7; }
        .cat-btn { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.05em; background: none; border: 1px solid #DEDCD3; padding: 6px 12px; cursor: pointer; color: #8C8A82; }
        .cat-btn.active { border-color: #16181A; color: #16181A; }
        @media (max-width: 640px) { .hero-wrap { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 32px",
          borderBottom: "1px solid #DEDCD3",
          position: "sticky",
          top: 0,
          background: "#F6F5F1",
          zIndex: 10,
        }}
      >
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, letterSpacing: "0.02em" }}>
          PLINTH
        </span>
        <nav className="plinth-nav" style={{ display: "flex", gap: 24 }}>
          <a href="#objects">Objects</a>
          <a href="#journal">Journal</a>
          <a href="#about">About</a>
        </nav>
        <button
          onClick={() => setCartOpen(true)}
          style={{
            background: "none",
            border: "1px solid #DEDCD3",
            padding: "7px 12px",
            cursor: "pointer",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          BAG
          <span
            style={{
              background: count > 0 ? "#4B5D45" : "#DEDCD3",
              color: count > 0 ? "#F6F5F1" : "#8C8A82",
              borderRadius: "50%",
              width: 18,
              height: 18,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
            }}
          >
            {count}
          </span>
        </button>
      </header>

      {/* Hero */}
      <section
        className="hero-wrap"
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 40,
          padding: "72px 32px 64px",
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        <div>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: "0.08em", color: "#4B5D45", margin: "0 0 18px" }}>
            SPRING CATALOG — 62 OBJECTS
          </p>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              fontSize: "clamp(38px, 5vw, 58px)",
              lineHeight: 1.05,
              margin: "0 0 22px",
              maxWidth: 480,
            }}
          >
            Things worth keeping on the desk.
          </h1>
          <p style={{ fontSize: 15, color: "#5B5952", lineHeight: 1.6, maxWidth: 420, margin: "0 0 28px" }}>
            Small-batch objects for the desk and table, numbered and catalogued
            as they're made. No seasons, no restocks — once a run sells out, it's gone.
          </p>
          <a
            href="#objects"
            style={{
              display: "inline-block",
              background: "#16181A",
              color: "#F6F5F1",
              padding: "13px 24px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            VIEW CATALOG →
          </a>
        </div>

        <div
          style={{
            border: "1px solid #DEDCD3",
            background: "#FBFAF7",
            padding: "22px 22px 18px",
            alignSelf: "start",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          <p style={{ fontSize: 11, letterSpacing: "0.08em", color: "#8C8A82", margin: "0 0 14px" }}>
            FEATURED THIS WEEK
          </p>
          <div style={{ background: "#39413A", aspectRatio: "4 / 3", marginBottom: 14 }} />
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, margin: "0 0 4px" }}>Reading lamp, low</p>
          <p style={{ fontSize: 12, color: "#8C8A82", margin: "0 0 12px" }}>NO. 031 — cast iron, dimmable</p>
          <button
            onClick={() => add(PRODUCTS[2])}
            style={{
              width: "100%",
              background: "none",
              border: "1px solid #16181A",
              padding: "10px 0",
              fontSize: 12,
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            ADD TO BAG — $142
          </button>
        </div>
      </section>

      {/* Catalog */}
      <section id="objects" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 24, margin: 0 }}>
            The catalog
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`cat-btn ${category === c ? "active" : ""}`}
                onClick={() => setCategory(c)}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="plinth-grid">
          {filtered.map((p) => (
            <CatalogCard key={p.id} product={p} onAdd={add} />
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #DEDCD3", padding: "28px 32px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8C8A82", display: "flex", justifyContent: "space-between" }}>
        <span>PLINTH — MADE IN SMALL RUNS</span>
        <span>© 2026</span>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={items} remove={remove} total={total} />
    </div>
  );
}
