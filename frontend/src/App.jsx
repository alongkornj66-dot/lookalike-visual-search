import { NavLink, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import ProductDetail from "./pages/ProductDetail";

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

const NAV_LINKS = [
  { to: "/", label: "Clothing", end: true, category: "tshirt" },
  { to: "/?cat=shoe", label: "Shoes", end: false },
  { to: "/?cat=bag", label: "Bags", end: false },
  { to: "/?cat=hat", label: "Accessories", end: false },
];

export default function App() {
  return (
    <div className="app-shell">
      <div className="announcement-bar">
        Complimentary standard shipping on orders over ฿2,000 &middot; Free returns
      </div>

      <header className="top-nav">
        <div className="nav-main">
          <nav className="nav-left">
            <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Clothing</NavLink>
            <NavLink to="/shoes" className={({ isActive }) => isActive ? "active" : ""}>Shoes</NavLink>
            <NavLink to="/bags" className={({ isActive }) => isActive ? "active" : ""}>Bags</NavLink>
            <NavLink to="/accessories" className={({ isActive }) => isActive ? "active" : ""}>Accessories</NavLink>
          </nav>

          <Link to="/" className="nav-brand">LOOKALIKE</Link>

          <div className="nav-right">
            <Link to="/search" className="nav-icon-btn" title="Shop by photo">
              <IconCamera />
              <span>Shop by Photo</span>
            </Link>
            <button className="nav-icon-btn" title="Search"><IconSearch /></button>
            <button className="nav-icon-btn" title="Account"><IconUser /></button>
            <button className="nav-icon-btn" title="Wishlist"><IconHeart /></button>
            <button className="nav-icon-btn" title="Cart"><IconBag /></button>
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shoes" element={<Home defaultCategory="shoe" />} />
          <Route path="/bags" element={<Home defaultCategory="bag" />} />
          <Route path="/accessories" element={<Home defaultCategory="hat" />} />
          <Route path="/search" element={<Search />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </main>

      <footer className="site-footer">
        LOOKALIKE &copy; {new Date().getFullYear()} &middot; All rights reserved
      </footer>
    </div>
  );
}
