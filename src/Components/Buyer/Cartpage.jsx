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
    fullName: "",
    mobile: "",
    pincode: "",
    street: "",
    city: "",
    state: "",
    isDefault: false
  });

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/addresses");
      const list = res.data.addresses || [];
      setAddresses(list);
      const def = list.find((a) => a.isDefault) || list[0];
      if (def) setSelectedAddress(def._id);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  const updateQuantity = async (productId, newQty) => {
    setUpdatingId(productId);
    try {
      if (newQty <= 0) {
        await removeItem(productId);
        return;
      }
      await api.patch(`/cart/update/${productId}`, { quantity: newQty });
      setCart((prev) =>
        prev.map((item) =>
          item.product?._id === productId ? { ...item, quantity: newQty } : item
        )
      );
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (productId) => {
    setUpdatingId(productId);
    try {
      await api.delete(`/cart/remove/${productId}`);
      setCart((prev) => prev.filter((item) => item.product?._id !== productId));
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddAddress = async () => {
    const { fullName, mobile, pincode, street, city, state } = newAddr;
    if (!fullName || !mobile || !pincode || !street || !city || !state) {
      return toast.error("Please fill all address fields");
    }
    try {
      const res = await api.post("/addresses", newAddr);
      setAddresses(res.data.addresses);
      const added = res.data.addresses[res.data.addresses.length - 1];
      if (added) setSelectedAddress(added._id);
      setShowAddForm(false);
      setNewAddr({
        fullName: "",
        mobile: "",
        pincode: "",
        street: "",
        city: "",
        state: "",
        isDefault: false
      });
      toast.success("Address saved successfully!");
    } catch {
      toast.error("Failed to save address");
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      return toast.error("Please select a delivery address");
    }
    setPlacing(true);
    try {
      await api.post("/orders/checkout");
      toast.success("Order placed successfully! 🎉");
      setShowCheckout(false);
      setCart([]);
      setTimeout(() => setPage("orders"), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Checkout failed");
    } finally {
      setPlacing(false);
    }
  };

  const validItems = cart.filter((i) => i.product);
  const totalAmount = validItems.reduce(
    (s, i) => s + (i.product?.price || 0) * (i.quantity || 1),
    0
  );
  const totalItems = validItems.reduce((s, i) => s + (i.quantity || 1), 0);
  const chosenAddr = addresses.find((a) => a._id === selectedAddress);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setPage("dashboard")}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white text-lg font-bold">
              🛍️
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Shop<span className="text-rose-500">.</span>ly
            </span>
          </div>

          <button
            onClick={() => setPage("dashboard")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Continue Shopping</span>
          </button>
        </div>
      </header>

      {/* Main Cart Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {loading ? "Checking cart..." : `${totalItems} item${totalItems !== 1 ? "s" : ""} in your bag`}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-slate-200 h-28 animate-pulse"
              />
            ))}
          </div>
        ) : validItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-400 text-5xl flex items-center justify-center mx-auto mb-5">
              🛒
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Looks like you haven't added anything to your cart yet. Explore our latest products and exclusive deals!
            </p>
            <button
              onClick={() => setPage("dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition"
            >
              Start Shopping Now →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {validItems.map((item) => {
                const product = item.product;
                const isUpdating = updatingId === product._id;

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-100 flex-shrink-0 border border-slate-100"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/100x100/f1f5f9/94a3b8?text=IMG";
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Unit Price: ₹{product.price.toLocaleString("en-IN")}
                      </p>
                      <div className="mt-2 text-sm font-extrabold text-indigo-900">
                        Subtotal: ₹{(product.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
                        <button
                          disabled={isUpdating}
                          onClick={() => updateQuantity(product._id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs transition disabled:opacity-40"
                        >
                          {item.quantity === 1 ? "🗑" : "−"}
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          disabled={isUpdating}
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs transition disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(product._id)}
                        disabled={isUpdating}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm text-slate-600 pb-4 border-b border-slate-100">
                  <div className="flex justify-between">
                    <span>Items Subtotal ({totalItems})</span>
                    <span className="font-semibold text-slate-900">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Standard Delivery</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      FREE
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applicable Taxes</span>
                    <span className="text-xs text-slate-400">Included</span>
                  </div>
                </div>

                <div className="py-4 flex justify-between items-baseline font-extrabold text-slate-900">
                  <span className="text-base">Order Total</span>
                  <span className="text-2xl text-indigo-900">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {chosenAddr && (
                  <div className="mb-5 p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs text-indigo-950">
                    <p className="font-bold mb-1 flex items-center gap-1.5">
                      <span>📍 Delivering to:</span>
                      <span>{chosenAddr.fullName}</span>
                    </p>
                    <p className="text-slate-600 text-[11px] line-clamp-2">
                      {chosenAddr.street}, {chosenAddr.city}, {chosenAddr.state} - {chosenAddr.pincode}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-rose-600/25 active:scale-[0.99] transition duration-200 text-sm flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <span>→</span>
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <span>🔒</span>
                  <span>Safe & Encrypted Checkout</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-900">
                Confirm Your Order
              </h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Select your delivery address and payment method to complete purchase
            </p>

            {/* Delivery Address Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  📍 Delivery Address
                </span>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    + Add New
                  </button>
                )}
              </div>

              {addresses.length > 0 && !showAddForm && (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddress === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddress(addr._id)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/50"
                            : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800">{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{addr.mobile}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Address Form */}
              {showAddForm && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <p className="font-bold text-xs text-slate-800 uppercase">New Address Details</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      placeholder="Full Name"
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                    />
                    <input
                      placeholder="Mobile No (10 digits)"
                      value={newAddr.mobile}
                      onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                    />
                    <input
                      placeholder="Pincode"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                    />
                    <input
                      placeholder="Street / Flat / Colony"
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                    />
                    <input
                      placeholder="City"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                    />
                    <input
                      placeholder="State"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={handleAddAddress}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold py-2 shadow"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                💳 Payment Method
              </span>
              <div className="p-4 border-2 border-indigo-600 bg-indigo-50/40 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-900">Cash on Delivery</p>
                  <p className="text-xs text-slate-500">Pay cash or UPI directly when your package arrives</p>
                </div>
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                  ✓
                </span>
              </div>
            </div>

            {/* Order Total Highlight */}
            <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center mb-6">
              <div>
                <p className="text-xs text-slate-500">Total Payable Amount</p>
                <p className="text-xl font-extrabold text-slate-900">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                No Extra Fees
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-100 py-3.5 rounded-xl text-xs font-bold text-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={placeOrder}
                disabled={placing || !selectedAddress}
                className="flex-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white py-3.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition"
              >
                {placing ? "Placing Order..." : "✓ Confirm & Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cartpage;
