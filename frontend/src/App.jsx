import { useState, useRef, useEffect } from "react";
import { NavLink, Route, Routes, Link, useNavigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { useCart } from "./context/CartContext";
import { useWishlist } from "./context/WishlistContext";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Search from "./pages/Search";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";

/* ── SVG Icons ── */
const IconSearch = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconCamera = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IconUser = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconHeart = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const IconBag = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── User dropdown menu ── */
function UserMenu() {
  const { user, logout, isLoggedIn } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isLoggedIn) {
    return (
      <Link to="/login" className="nav-icon-btn" title="Sign in">
        <IconUser />
      </Link>
    );
  }

  return (
    <div className="user-menu-wrap" ref={ref}>
      <button className="nav-icon-btn user-menu-trigger" onClick={() => setOpen((v) => !v)} title="Account">
        <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
      </button>
      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown__info">
            <p className="user-dropdown__name">{user.name}</p>
            <p className="user-dropdown__email">{user.email}</p>
          </div>
          <div className="user-dropdown__divider" />
          <Link to="/wishlist" className="user-dropdown__item" onClick={() => setOpen(false)}>Saved Items</Link>
          <a href="#" className="user-dropdown__item">My Orders</a>
          <a href="#" className="user-dropdown__item">Account Settings</a>
          <div className="user-dropdown__divider" />
          <button
            className="user-dropdown__item user-dropdown__item--red"
            onClick={() => { logout(); show("Signed out successfully", "default"); navigate("/"); setOpen(false); }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main Shell ── */
function Shell() {
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

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
            <Link to="/search" className="nav-icon-btn" title="Shop by Photo">
              <IconCamera />
            </Link>
            <button className="nav-icon-btn" title="Search" onClick={() => setSearchOpen((v) => !v)}>
              <IconSearch />
            </button>
            <UserMenu />
            <Link to="/wishlist" className="nav-icon-btn nav-icon-btn--badge" title="Wishlist">
              <IconHeart />
              {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
            </Link>
            <button className="nav-icon-btn nav-icon-btn--badge" title="Shopping Bag" onClick={() => setCartOpen(true)}>
              <IconBag />
              {totalItems > 0 && <span className="nav-badge">{totalItems}</span>}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="nav-search-bar">
            <form onSubmit={handleSearchSubmit} className="nav-search-form">
              <IconSearch />
              <input
                autoFocus
                type="text"
                placeholder="Search for products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nav-search-input"
              />
              <button type="button" className="icon-btn" onClick={() => setSearchOpen(false)}>
                <IconClose />
              </button>
            </form>
          </div>
        )}
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shoes" element={<Home defaultCategory="shoe" />} />
          <Route path="/bags" element={<Home defaultCategory="bag" />} />
          <Route path="/accessories" element={<Home defaultCategory="hat" />} />
          <Route path="/search" element={<Search />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-col">
            <p className="footer-brand">LOOKALIKE</p>
            <p>Visual fashion search — find anything by photo.</p>
          </div>
          <div className="footer-col">
            <p className="footer-heading">Shop</p>
            <Link to="/">Clothing</Link>
            <Link to="/shoes">Shoes</Link>
            <Link to="/bags">Bags</Link>
            <Link to="/accessories">Accessories</Link>
          </div>
          <div className="footer-col">
            <p className="footer-heading">Help</p>
            <a href="#">Shipping &amp; Returns</a>
            <a href="#">Size Guide</a>
            <a href="#">Contact Us</a>
            <a href="#">FAQ</a>
          </div>
          <div className="footer-col">
            <p className="footer-heading">About</p>
            <a href="#">Our Story</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} LOOKALIKE. All rights reserved.</span>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <Shell />
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
