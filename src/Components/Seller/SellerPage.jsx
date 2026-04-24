import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const EMPTY_FORM = { name: "", price: "", description: "", quantity: "", image: "", category: "electronics" };
const CATEGORIES = ["electronics", "grocery", "fashion"];
const categoryStyles = {
  electronics: "bg-blue-100 text-blue-700",
  grocery:     "bg-green-100 text-green-700",
  fashion:     "bg-pink-100 text-pink-700",
};

const SellerPage = ({ setPage }) => {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [deletingId, setDeletingId]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch]             = useState("");
  const [filterCat, setFilterCat]       = useState("All");

  const username = localStorage.getItem("username");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.data);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, price: p.price, description: p.description, quantity: p.quantity, image: p.image, category: p.category });
    setEditingId(p._id); setShowForm(true);
  };

  const handleSave = async () => {
    const { name, price, description, quantity, image, category } = form;
    if (!name || !price || !description || !quantity || !image || !category)
      return toast.error("Please fill all fields");
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.patch(`/products/${editingId}`, { ...form, price: Number(form.price), quantity: Number(form.quantity) });
        setProducts((prev) => prev.map((p) => p._id === editingId ? res.data.data : p));
        toast.success("Product updated ✅");
      } else {
        const res = await api.post("/products", { ...form, price: Number(form.price), quantity: Number(form.quantity) });
        setProducts((prev) => [res.data.data, ...prev]);
        toast.success("Product added 🎉");
      }
      setShowForm(false); setEditingId(null);
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted");
      setConfirmDelete(null);
    } catch { toast.error("Failed to delete"); }
    finally { setDeletingId(null); }
  };

  const filtered = products
    .filter((p) => filterCat === "All" || p.category === filterCat)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const totalValue = products.reduce((s, p) => s + p.price * p.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-[#0d1117] sticky top-0 z-50 border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <span className="text-white text-xl font-bold">Shop<span className="text-red-400">.</span>ly</span>
            <span className="text-gray-500 text-xs ml-2">Seller Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm hidden sm:block">👤 {username}</span>
            <button onClick={openAdd} className="bg-green-700 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
              + Add Product
            </button>
            <button onClick={() => { localStorage.clear(); setPage("login"); }} className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-400 px-4 py-2 rounded-lg transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 pt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: products.length, sub: "across all categories", border: "border-l-blue-500" },
          { label: "Inventory Value", value: `₹${totalValue.toLocaleString("en-IN")}`, sub: "stock × price", border: "border-l-green-500" },
          { label: "Low Stock", value: products.filter((p) => p.quantity <= 5).length, sub: "items with qty ≤ 5", border: "border-l-orange-500" },
          { label: "Out of Stock", value: products.filter((p) => p.quantity === 0).length, sub: "needs restocking", border: "border-l-red-500" },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${s.border}`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-6 pt-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 flex-1 min-w-48">
          <span className="text-gray-400">🔍</span>
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm flex-1 bg-transparent"
          />
        </div>
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition capitalize ${
              filterCat === cat ? "bg-[#0d1117] text-white border-[#0d1117]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-500"
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="text-sm text-gray-400 ml-auto">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 py-5 pb-16">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[60px_2fr_1fr_100px_80px_110px_120px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div>Image</div><div>Product</div><div>Category</div>
            <div>Price</div><div>Stock</div><div>Value</div><div>Actions</div>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-semibold text-gray-500">No products found</p>
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p._id}
                className="grid grid-cols-[60px_2fr_1fr_100px_80px_110px_120px] gap-4 px-5 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition last:border-0"
              >
                <img
                  src={p.image} alt={p.name}
                  className="w-11 h-11 object-cover rounded-xl bg-gray-100"
                  onError={(e) => { e.target.src = "https://placehold.co/44x44/f0f0f0/999?text=IMG"; }}
                />
                <div>
                  <p className="font-semibold text-sm text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400 truncate max-w-xs">{p.description}</p>
                </div>
                <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full capitalize w-fit ${categoryStyles[p.category] || "bg-gray-100 text-gray-600"}`}>
                  {p.category}
                </span>
                <span className="font-bold text-sm text-gray-900">₹{p.price.toLocaleString("en-IN")}</span>
                <span className={`font-semibold text-sm ${p.quantity <= 5 ? "text-red-500" : "text-gray-600"}`}>
                  {p.quantity <= 5 ? "⚠ " : ""}{p.quantity}
                </span>
                <span className="text-sm text-gray-500">₹{(p.price * p.quantity).toLocaleString("en-IN")}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-100 transition">✏ Edit</button>
                  <button onClick={() => setConfirmDelete(p)} className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition">🗑</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-[#0d1117] mb-1">{editingId ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-sm text-gray-400 mb-6">{editingId ? "Update the product details below" : "Fill in the details to list a new product"}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Product Name</label>
                <input name="name" placeholder="e.g. Apple iPhone 15" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0d1117] transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Price (₹)</label>
                <input type="number" name="price" placeholder="79999" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0d1117] transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Quantity</label>
                <input type="number" name="quantity" placeholder="50" value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0d1117] transition" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                <textarea name="description" rows={3} placeholder="Short product description..." value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0d1117] transition resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                <select name="category" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0d1117] transition bg-white">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Image URL</label>
                <input name="image" placeholder="https://..." value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0d1117] transition" />
              </div>
              {form.image && (
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Preview</label>
                  <img src={form.image} className="mt-1 w-full h-36 object-cover rounded-xl bg-gray-100"
                    onError={(e) => { e.target.src = "https://placehold.co/400x140/f0f0f0/999?text=Invalid+URL"; }} />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-[2] bg-[#0d1117] hover:bg-green-700 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-60 transition">
                {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-4xl mb-3">🗑️</p>
            <p className="text-lg font-bold text-gray-900 mb-2">Delete Product?</p>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <strong>"{confirmDelete.name}"</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">Cancel</button>
              <button
                onClick={() => handleDelete(confirmDelete._id)}
                disabled={deletingId === confirmDelete._id}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 transition"
              >
                {deletingId === confirmDelete._id ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerPage;
