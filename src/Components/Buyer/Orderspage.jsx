import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const statusConfig = {
  placed:    { color: "text-blue-700",  bg: "bg-blue-100",  label: "Order Placed", icon: "📦" },
  shipped:   { color: "text-orange-700",bg: "bg-orange-100",label: "Shipped",      icon: "🚚" },
  delivered: { color: "text-green-700", bg: "bg-green-100", label: "Delivered",    icon: "✅" },
  cancelled: { color: "text-red-700",   bg: "bg-red-100",   label: "Cancelled",    icon: "❌" },
};

const Orderspage = ({ setPage }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data.orders);
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-[#1a1a2e] sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-white text-xl font-bold">Shop<span className="text-red-500">.</span>ly</span>
          <div className="flex gap-3">
            <button onClick={() => setPage("dashboard")} className="text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-300 px-4 py-2 rounded-full transition">🛍 Shop</button>
            <button onClick={() => setPage("cart")} className="text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-300 px-4 py-2 rounded-full transition">🛒 Cart</button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">My Orders</h1>
        <p className="text-sm text-gray-400 mb-8">
          {loading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
        </p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-20 text-center shadow-sm">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-semibold text-gray-700 mb-2">No orders yet</p>
            <p className="text-sm text-gray-400 mb-6">You haven't placed any orders yet</p>
            <button onClick={() => setPage("dashboard")} className="bg-[#1a1a2e] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0f3460] transition">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.placed;
              const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
              });

              return (
                <div key={order._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                  {/* Order Header */}
                  <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-gray-600 font-medium mt-0.5">📅 {date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${status.bg} ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                      <span className="font-bold text-[#1a1a2e]">₹{order.totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-5 py-4 space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="w-14 h-14 object-cover rounded-xl flex-shrink-0 bg-gray-100"
                          onError={(e) => { e.target.src = "https://placehold.co/56x56/f0f0f0/999?text=IMG"; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{item.product?.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-sm text-[#1a1a2e] flex-shrink-0">
                          ₹{(item.product?.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orderspage;
