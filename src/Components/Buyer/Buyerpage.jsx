import { useEffect, useState } from "react";
import api from "../../api/axios";
import Productcard from "./Productcard";
import toast from "react-hot-toast";

const categories = [
  { id: "All", label: "All Items", icon: "✨" },
  { id: "electronics", label: "Electronics", icon: "⚡" },
  { id: "grocery", label: "Grocery", icon: "🥦" },
  { id: "fashion", label: "Fashion", icon: "👗" },
];

const Buyerpage = ({ setPage }) => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const username = localStorage.getItem("username") || "Shopper";
  const isLoggedIn = Boolean(localStorage.getItem("token") || localStorage.getItem("username"));

  const fetchCartCount = async () => {
    try {
      const res = await api.get("/cart");
      if (Array.isArray(res.data)) {
        const count = res.data.reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartCount(count);
      }
    } catch {
      // Cart count fail can be ignored gracefully
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      const list = res.data.data || [];
      setProducts(list);
      setFiltered(list);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  useEffect(() => {
    let result = products;
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [activeCategory, search, products]);

  const handleLogout = () => {
    localStorage.clear();
    setPage("login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveCategory("All"); setSearch(""); }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-500/30">
                🛍️
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                Shop<span className="text-rose-500">.</span>ly
              </span>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search over 30+ products, electronics, fashion..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 outline-none focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold">{username}</span>
                  </div>

                  <button
                    onClick={() => setPage("orders")}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <span>📦</span>
                    <span>My Orders</span>
                  </button>

                  <button
                    onClick={() => setPage("cart")}
                    className="relative px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg shadow-rose-600/20 transition flex items-center gap-2 active:scale-95"
                  >
                    <span>🛒</span>
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="inline-flex items-center justify-center bg-white text-rose-600 text-[11px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[1.25rem] shadow">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setPage("login")}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-600/25 transition active:scale-95 flex items-center gap-1.5"
                >
                  <span>🔑</span>
                  <span>Sign In / Demo</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setPage("cart")}
                className="relative p-2 rounded-xl bg-rose-500/20 text-rose-400"
              >
                <span className="text-lg">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-800 space-y-3">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 outline-none"
                />
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">🔍</span>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="text-xs text-slate-400 px-1">
                  Logged in as <strong className="text-white">{username}</strong>
                </div>
                <button
                  onClick={() => { setPage("orders"); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-slate-800 text-sm font-semibold text-slate-200 flex items-center gap-2"
                >
                  <span>📦</span> My Orders
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-rose-500/10 text-sm font-semibold text-rose-400 flex items-center gap-2"
                >
                  <span>🚪</span> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-12 sm:py-16">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-4">
              <span>🚀 Summer Mega Sale</span>
              <span>•</span>
              <span>Up to 50% Off</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              Everything You Love,<br />
              <span className="bg-gradient-to-r from-indigo-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
                Delivered in Minutes.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
              Explore thousands of hand-picked electronics, fresh daily groceries, and trendsetting fashion at unbelievable prices.
            </p>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs sm:text-sm font-semibold text-slate-300 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base">🚚</span>
                <span>Free Shipping ₹499+</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🔒</span>
                <span>100% Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span>Same Day Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Category Filter Pills & Product Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                    active
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105"
                      : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>
              Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm animate-pulse">
                  <div className="aspect-[4/3] bg-slate-200 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <Productcard
                  key={product._id}
                  product={product}
                  onCartUpdated={fetchCartCount}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8">
              <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 text-4xl flex items-center justify-center mx-auto mb-4">
                🔍
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                No matching products found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                We couldn't find anything matching your search criteria. Try a different search term or category.
              </p>
              <button
                onClick={() => { setActiveCategory("All"); setSearch(""); }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Reset Filters & View All
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛍️</span>
            <span className="text-white font-bold">Shop.ly</span>
            <span>— Next Generation E-Commerce Platform</span>
          </div>
          <p>© {new Date().getFullYear()} Shop.ly Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Buyerpage;
