import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  name: "",
  price: "",
  description: "",
  quantity: "",
  image: "",
  category: "electronics"
};

const CATEGORIES = ["electronics", "grocery", "fashion"];

const categoryStyles = {
  electronics: "bg-sky-50 text-sky-700 border-sky-200",
  grocery: "bg-emerald-50 text-emerald-700 border-emerald-200",
  fashion: "bg-rose-50 text-rose-700 border-rose-200",
};

const SellerPage = ({ setPage }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const username = localStorage.getItem("username") || "Merchant";

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.data || []);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      description: p.description,
      quantity: p.quantity,
      image: p.image,
      category: p.category
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    const { name, price, description, quantity, image, category } = form;
    if (!name || !price || !description || !quantity || !image || !category) {
      return toast.error("Please fill in all product fields");
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.patch(`/products/${editingId}`, {
          ...form,
          price: Number(form.price),
          quantity: Number(form.quantity)
        });
        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? res.data.data : p))
        );
        toast.success("Product updated successfully! ✅");
      } else {
        const res = await api.post("/products", {
          ...form,
          price: Number(form.price),
          quantity: Number(form.quantity)
        });
        setProducts((prev) => [res.data.data, ...prev]);
        toast.success("Product added to catalog! 🎉");
      }
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product removed from catalog");
      setConfirmDelete(null);
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products
    .filter((p) => filterCat === "All" || p.category === filterCat)
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
    );

  const totalValue = products.reduce((s, p) => s + (p.price || 0) * (p.quantity || 0), 0);
  const lowStockCount = products.filter((p) => p.quantity <= 5).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-lg font-bold">
              🏪
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight">
                Shop<span className="text-emerald-400">.</span>ly
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                Seller Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>Merchant:</span>
              <strong className="text-white">{username}</strong>
            </div>

            <button
              onClick={openAdd}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition flex items-center gap-1.5"
            >
              <span>+</span>
              <span>New Product</span>
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                setPage("login");
              }}
              className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3.5 py-2 rounded-xl transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              📦 Total Products
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {products.length}
            </p>
            <p className="text-xs text-slate-400 mt-1">across all categories</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              💰 Inventory Worth
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 truncate">
              ₹{totalValue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-400 mt-1">total retail stock value</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              ⚠️ Low Stock
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {lowStockCount}
            </p>
            <p className="text-xs text-slate-400 mt-1">items with ≤ 5 units</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              🚫 Out of Stock
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {outOfStockCount}
            </p>
            <p className="text-xs text-slate-400 mt-1">units requiring restock</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Filter by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["All", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                  filterCat === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Table (Desktop) & Cards (Mobile) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Loading inventory...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-bold text-slate-700">No products found</p>
              <p className="text-xs mt-1">Try changing your filters or add a new item.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-extrabold">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Inventory</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-100 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = "https://placehold.co/50x50/f1f5f9/94a3b8?text=IMG";
                            }}
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-800 truncate">{p.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{p.description}</p>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${categoryStyles[p.category] || "bg-slate-100"}`}>
                            {p.category}
                          </span>
                        </td>

                        <td className="p-4 font-bold text-slate-800">
                          ₹{p.price?.toLocaleString("en-IN")}
                        </td>

                        <td className="p-4">
                          <span className={`font-semibold ${p.quantity <= 5 ? "text-rose-600 font-bold" : "text-slate-700"}`}>
                            {p.quantity} units
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDelete(p._id)}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filtered.map((p) => (
                  <div key={p._id} className="p-4 flex gap-3 items-center">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0 border border-slate-100"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/60x60/f1f5f9/94a3b8?text=IMG";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span className="font-bold text-indigo-900">₹{p.price?.toLocaleString("en-IN")}</span>
                        <span>•</span>
                        <span className={p.quantity <= 5 ? "text-rose-600 font-bold" : "text-slate-500"}>
                          Qty: {p.quantity}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-200 text-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p._id)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold border border-rose-200 text-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Add / Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="2499"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="25"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 capitalize"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>

              {/* Live Image Preview */}
              {form.image && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-14 h-14 object-cover rounded-xl bg-slate-200"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/100x100/f1f5f9/94a3b8?text=Invalid";
                    }}
                  />
                  <div className="text-xs text-slate-500">
                    <p className="font-bold text-slate-700">Image Preview</p>
                    <p className="text-[11px] truncate max-w-xs">{form.image}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your product specs, features, warranty..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  {saving ? "Saving Product..." : editingId ? "Update Product" : "Publish Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 text-2xl flex items-center justify-center mx-auto mb-4">
              🗑️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Product?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/25"
              >
                {deletingId === confirmDelete ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerPage;
