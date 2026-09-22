import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const statusConfig = {
  placed: {
    color: "text-sky-700 bg-sky-50 border-sky-200",
    label: "Order Placed",
    icon: "📦"
  },
  shipped: {
    color: "text-amber-700 bg-amber-50 border-amber-200",
    label: "In Transit",
    icon: "🚚"
  },
  delivered: {
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    label: "Delivered",
    icon: "✅"
  },
  cancelled: {
    color: "text-rose-700 bg-rose-50 border-rose-200",
    label: "Cancelled",
    icon: "❌"
  }
};

const Orderspage = ({ setPage }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data.orders || []);
      } catch {
        toast.error("Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage("dashboard")}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              🛍 Shop
            </button>
            <button
              onClick={() => setPage("cart")}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              🛒 Cart
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {loading ? "Fetching your purchase history..." : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200 h-36 animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-400 text-5xl flex items-center justify-center mx-auto mb-5">
              📦
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              No orders placed yet
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              You haven't purchased anything yet. Browse our catalog and place your first order!
            </p>
            <button
              onClick={() => setPage("dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition"
            >
              Start Exploring Products →
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.placed;
              const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-slate-50/70 px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        📦
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">
                          ORDER #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Placed on {date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Card Items */}
                  <div className="p-5 divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-3 first:pt-0 last:pb-0 flex items-center gap-4"
                      >
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="w-14 h-14 object-cover rounded-xl bg-slate-100 flex-shrink-0 border border-slate-100"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/80x80/f1f5f9/94a3b8?text=IMG";
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 truncate">
                            {item.product?.name || "Product Item"}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Quantity: {item.quantity}
                          </p>
                        </div>

                        <span className="font-bold text-sm text-slate-900 flex-shrink-0">
                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orderspage;
