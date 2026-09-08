import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import ProductDetail from "./pages/ProductDetail";

export default function App() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="brand">
          <div className="brand-icon">👗</div>
          Lookalike
        </div>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
            Catalog
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => isActive ? "active" : ""}>
            Visual Search
          </NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </main>

      <footer className="footer">
        Visual &amp; Style Search — find anything by photo, not by words.
      </footer>
    </div>
  );
}
