import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Cartpage = ({ setPage }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: "", mobile: "", pincode: "", street: "", city: "", state: "", isDefault: false
  });

  useEffect(() => { fetchCart(); fetchAddresses(); }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch { toast.error("Failed to load cart"); }
    finally { setLoading(false); }
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/addresses");
      setAddresses(res.data.addresses);
      const def = res.data.addresses.find((a) => a.isDefault) || res.data.addresses[0];
      if (def) setSelectedAddress(def._id);
    } catch {}
  };

  const updateQuantity = async (productId, newQty) => {
    setUpdatingId(productId);
    try {
      if (newQty <= 0) { await removeItem(productId); return; }
      await api.patch(`/cart/update/${productId}`, { quantity: newQty });
      setCart((prev) => prev.map((item) =>
        item.product._id === productId ? { ...item, quantity: newQty } : item
      ));
    } catch { toast.error("Failed to update"); }
    finally { setUpdatingId(null); }
  };

  const removeItem = async (productId) => {
    setUpdatingId(productId);
    try {
      await api.delete(`/cart/remove/${productId}`);
      setCart((prev) => prev.filter((item) => item.product._id !== productId));
      toast.success("Item removed");
    } catch { toast.error("Failed to remove"); }
    finally { setUpdatingId(null); }
  };

  const handleAddAddress = async () => {
    const { fullName, mobile, pincode, street, city, state } = newAddr;
    if (!fullName || !mobile || !pincode || !street || !city || !state)
      return toast.error("Please fill all address fields");
    try {
      const res = await api.post("/addresses", newAddr);
      setAddresses(res.data.addresses);
      const added = res.data.addresses[res.data.addresses.length - 1];
      setSelectedAddress(added._id);
      setShowAddForm(false);
      setNewAddr({ fullName: "", mobile: "", pincode: "", street: "", city: "", state: "", isDefault: false });
      toast.success("Address saved!");
    } catch { toast.error("Failed to save address"); }
  };

  const placeOrder = async () => {
    if (!selectedAddress) return toast.error("Please select a delivery address");
    setPlacing(true);
    try {
      await api.post("/orders/checkout");
      toast.success("Order placed! 🎉");
      setShowCheckout(false);
      setCart([]);
      setTimeout(() => setPage("orders"), 1200);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Checkout failed");
    } finally { setPlacing(false); }
  };

  const totalAmount = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const totalItems  = cart.reduce((s, i) => s + i.quantity, 0);
  const chosenAddr  = addresses.find((a) => a._id === selectedAddress);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-[#1a1a2e] sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-white text-xl font-bold">Shop<span className="text-red-500">.</span>ly</span>
          <button
            onClick={() => setPage("dashboard")}
            className="text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-300 px-4 py-2 rounded-full transition"
          >
            ← Continue Shopping
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left: Items */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Your Cart</h1>
          {!loading && <p className="text-sm text-gray-400 mb-6">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>}

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />
              ))}
            </div>
          ) : cart.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
              <p className="text-5xl mb-4">🛒</p>
              <p className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</p>
              <p className="text-sm text-gray-400 mb-6">Looks like you haven't added anything yet</p>
              <button onClick={() => setPage("dashboard")} className="bg-[#1a1a2e] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0f3460] transition">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product._id} className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition">
                  <img
                    src={item.product.image} alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-gray-100"
                    onError={(e) => { e.target.src = "https://placehold.co/80x80/f0f0f0/999?text=IMG"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-400 capitalize mb-2">{item.product.category}</p>
                    <p className="font-bold text-[#1a1a2e]">₹{item.product.price.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-gray-400">Subtotal: ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      disabled={updatingId === item.product._id}
                      onClick={() => item.quantity === 1 ? removeItem(item.product._id) : updateQuantity(item.product._id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 flex items-center justify-center font-bold transition disabled:opacity-40"
                    >
                      {item.quantity === 1 ? "🗑" : "−"}
                    </button>
                    <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      disabled={updatingId === item.product._id}
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-200 text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white hover:border-[#1a1a2e] flex items-center justify-center font-bold transition disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Summary */}
        {!loading && cart.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
            <p className="font-bold text-[#1a1a2e] text-lg mb-5">Order Summary</p>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between"><span>Items ({totalItems})</span><span>₹{totalAmount.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className="text-green-600 font-semibold">FREE</span></div>
              <div className="border-t pt-3 flex justify-between font-bold text-[#1a1a2e] text-base">
                <span>Total</span><span>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
            {chosenAddr && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-gray-600">
                📍 {chosenAddr.street}, {chosenAddr.city}, {chosenAddr.state} - {chosenAddr.pincode}
              </div>
            )}
            <button
              onClick={() => setShowCheckout(true)}
              className="mt-5 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition"
            >
              Proceed to Checkout →
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">🔒 Secure checkout</p>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCheckout(false)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-[slideUp_0.3s_ease]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-1">Checkout</h2>
            <p className="text-sm text-gray-400 mb-6">Select delivery address & confirm order</p>

            {/* Address */}
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">📍 Delivery Address</p>
            {addresses.length > 0 && (
              <div className="space-y-3 mb-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddress(addr._id)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                      selectedAddress === addr._id ? "border-[#1a1a2e] bg-blue-50" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#1a1a2e]">{addr.fullName}</span>
                        {addr.isDefault && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Default</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{addr.mobile}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddress === addr._id ? "bg-[#1a1a2e] border-[#1a1a2e]" : "border-gray-300"}`}>
                          {selectedAddress === addr._id && <span className="text-white text-[8px]">✓</span>}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                ))}
              </div>
            )}

            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full border-2 border-dashed border-gray-300 hover:border-[#1a1a2e] text-gray-500 hover:text-[#1a1a2e] text-sm font-semibold py-2.5 rounded-xl transition mb-5"
              >
                + Add New Address
              </button>
            )}

            {showAddForm && (
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="font-semibold text-sm text-[#1a1a2e] mb-4">New Address</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Full Name", key: "fullName", placeholder: "John Doe", full: true },
                    { label: "Mobile",    key: "mobile",   placeholder: "9876543210" },
                    { label: "Pincode",   key: "pincode",  placeholder: "400001" },
                    { label: "Street",    key: "street",   placeholder: "123 Main St", full: true },
                    { label: "City",      key: "city",     placeholder: "Mumbai" },
                    { label: "State",     key: "state",    placeholder: "Maharashtra" },
                  ].map(({ label, key, placeholder, full }) => (
                    <div key={key} className={full ? "col-span-2" : ""}>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                      <input
                        placeholder={placeholder}
                        value={newAddr[key]}
                        onChange={(e) => setNewAddr({ ...newAddr, [key]: e.target.value })}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a1a2e] transition"
                      />
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mt-3 cursor-pointer">
                  <input type="checkbox" checked={newAddr.isDefault} onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })} />
                  Set as default address
                </label>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100 transition">Discard</button>
                  <button onClick={handleAddAddress} className="flex-1 bg-[#1a1a2e] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#0f3460] transition">Save Address</button>
                </div>
              </div>
            )}

            <hr className="my-4" />

            {/* COD */}
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">💳 Payment Method</p>
            <div className="border-2 border-[#1a1a2e] bg-blue-50 rounded-xl p-4 flex items-center gap-4 mb-4">
              <span className="text-3xl">💵</span>
              <div>
                <p className="font-semibold text-[#1a1a2e]">Cash on Delivery</p>
                <p className="text-xs text-gray-500">Pay when your order arrives at your door</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center mb-5">
              <span className="text-sm text-gray-600">Amount to pay on delivery</span>
              <span className="font-bold text-[#1a1a2e] text-lg">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCheckout(false)} className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">Cancel</button>
              <button
                onClick={placeOrder}
                disabled={placing || !selectedAddress}
                className="flex-2 flex-1 bg-[#1a1a2e] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#0f3460] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {placing ? "Placing..." : !selectedAddress ? "Select Address" : "✓ Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cartpage;
