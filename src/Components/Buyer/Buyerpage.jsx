import { useEffect, useState } from "react";
import api from "../../api/axios";
import Productcard from "./Productcard";
import toast from "react-hot-toast";

const categories = ["All", "electronics", "grocery", "fashion"];

const Buyerpage = ({ setPage }) => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data.data);
        setFiltered(res.data.data);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    const fetchCartCount = async () => {
      try {
        const res = await api.get("/cart");
        setCartCount(res.data.length);
      } catch {}
    };
    fetchProducts();
    fetchCartCount();
  }, []);

  useEffect(() => {
    let result = products;
    if (activeCategory !== "All") result = result.filter((p) => p.category === activeCategory);
    if (search.trim()) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [activeCategory, search, products]);

  const catLabels = {
    All: "🛍 All",
    electronics: "⚡ Electronics",
    grocery: "🥦 Grocery",
    fashion: "👗 Fashion",
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">

      {/* Navbar */}
      <nav className="bg-[#1a1a2e] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-white text-xl font-bold tracking-tight">
            Shop<span className="text-red-500">.</span>ly
          </span>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm hidden sm:block">👤 {username}</span>
            <button
              onClick={() => setPage("orders")}
              className="text-sm font-semibold text-white bg-[#0f3460] hover:bg-[#1a4a7a] px-4 py-2 rounded-full transition"
            >
              📋 My Orders
            </button>
            <button
              onClick={() => setPage("cart")}
              className="relative text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full transition"
            >
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-red-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { localStorage.clear(); setPage("login"); }}
              className="text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-300 px-4 py-2 rounded-full transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-400 opacity-10 rounded-full translate-y-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-gray-400 text-sm mb-1">Hello, {username} 👋</p>
          <h1 className="text-white text-4xl font-bold leading-tight mb-6">
            Shop Everything<br />You Love
          </h1>
          <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 max-w-md shadow-xl">
            <span className="text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-6 pt-6 flex gap-3 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition ${
              activeCategory === cat
                ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#1a1a2e] hover:text-[#1a1a2e]"
            }`}
          >
            {catLabels[cat]}
          </button>
        ))}
        {!loading && (
          <span className="ml-auto text-sm text-gray-400 self-center">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-3/5" />
              </div>
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((p) => <Productcard key={p._id} product={p} />)
        ) : (
          <div className="col-span-full text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-semibold">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Buyerpage;
