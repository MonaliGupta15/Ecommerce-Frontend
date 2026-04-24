import { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const categoryStyles = {
  electronics: "bg-blue-100 text-blue-700",
  grocery:     "bg-green-100 text-green-700",
  fashion:     "bg-pink-100 text-pink-700",
};

const Productcard = ({ product }) => {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const addToCart = async () => {
    setAdding(true);
    try {
      await api.post(`/cart/add/${product._id}`);
      setAdded(true);
      toast.success("Added to cart 🛒");
      setTimeout(() => setAdded(false), 2000);
    } catch {
      toast.error("Failed to add");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x300/f0f0f0/999?text=${encodeURIComponent(product.name)}`;
          }}
        />
        <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full capitalize ${categoryStyles[product.category] || "bg-gray-100 text-gray-600"}`}>
          {product.category}
        </span>
        {product.quantity <= 10 && (
          <span className="absolute top-2 right-2 text-xs font-semibold bg-black/60 text-white px-2 py-1 rounded-md">
            Only {product.quantity} left
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">{product.name}</h3>
        <p className="text-xs text-gray-400 line-clamp-2 mb-4">{product.description}</p>

        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-[#1a1a2e]">₹{product.price.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-400">incl. taxes</p>
          </div>
          <button
            onClick={addToCart}
            disabled={adding}
            className={`text-xs font-bold px-4 py-2 rounded-full transition whitespace-nowrap ${
              added
                ? "bg-green-100 text-green-700"
                : "bg-[#1a1a2e] text-white hover:bg-[#0f3460]"
            } disabled:opacity-60`}
          >
            {adding ? "Adding..." : added ? "✓ Added" : "+ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Productcard;
