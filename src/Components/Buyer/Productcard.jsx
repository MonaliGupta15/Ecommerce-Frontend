import { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const categoryStyles = {
  electronics: {
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
    label: "⚡ Electronics"
  },
  grocery: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "🥦 Grocery"
  },
  fashion: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    label: "👗 Fashion"
  }
};

const Productcard = ({ product, onCartUpdated }) => {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const style = categoryStyles[product.category] || {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-500",
    label: product.category
  };

  // Simulate a calculated MRP to show discounts
  const originalPrice = Math.round(product.price * 1.22);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast("Please sign in to add items to your cart! 🛍️", { icon: "🔑" });
      return;
    }

    setAdding(true);
    try {
      await api.post(`/cart/add/${product._id}`);
      setAdded(true);
      toast.success(`${product.name} added to cart! 🛒`);
      if (onCartUpdated) onCartUpdated();
      setTimeout(() => setAdded(false), 2000);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = `https://placehold.co/600x450/f1f5f9/64748b?text=${encodeURIComponent(product.name)}`;
          }}
          loading="lazy"
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-white/90 shadow-sm ${style.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            <span className="capitalize">{product.category}</span>
          </span>
        </div>

        {/* Discount Tag */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-rose-500 text-white shadow-sm">
            {discountPercent}% OFF
          </span>
        </div>

        {/* Low stock badge */}
        {product.quantity <= 10 && (
          <div className="absolute bottom-2 left-2 right-2">
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/90 text-white backdrop-blur-sm shadow-sm">
              🔥 Only {product.quantity} left in stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Rating & Reviews */}
        <div className="flex items-center gap-1.5 mb-1.5 text-xs">
          <div className="flex items-center text-amber-400 font-bold">
            <span>★</span>
            <span className="text-slate-700 ml-1">4.8</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">120+ bought</span>
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition mb-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-400 line-through font-medium">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold">Free Delivery</p>
          </div>

          <button
            onClick={addToCart}
            disabled={adding}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-60 whitespace-nowrap ${
              added
                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-900/10 hover:shadow-indigo-600/30"
            }`}
          >
            {adding ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Adding...</span>
              </>
            ) : added ? (
              <>
                <span>✓ Added</span>
              </>
            ) : (
              <>
                <span>🛒</span>
                <span>+ Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Productcard;
