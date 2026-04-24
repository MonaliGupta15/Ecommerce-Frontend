import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Register = ({ setPage }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    mobileNo: "",
    role: "buyer"
  });

  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 🔹 submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (
      !form.firstName ||
      !form.lastName ||
      !form.username ||
      !form.password ||
      !form.mobileNo
    ) {
      return toast.error("Please fill all fields");
    }

    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      await api.post("/auth/register", form);

      toast.success("Registered successfully 🎉");

      // redirect after short delay
      setTimeout(() => {
        setPage("login");
      }, 1000);

    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-sm">

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-300 px-8 py-10 rounded-sm"
        >
          {/* Title */}
          <h1 className="text-3xl font-semibold text-center mb-8 tracking-tight">
            Ecommerce
          </h1>

          {/* Inputs */}
          <input
            name="firstName"
            placeholder="First name"
            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
            value={form.firstName}
            onChange={handleChange}
          />

          <input
            name="lastName"
            placeholder="Last name"
            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
            value={form.lastName}
            onChange={handleChange}
          />

          <input
            name="username"
            placeholder="Username"
            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
            value={form.username}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
            value={form.password}
            onChange={handleChange}
          />

          <input
            name="mobileNo"
            placeholder="Mobile number"
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
            value={form.mobileNo}
            onChange={handleChange}
          />

          {/* Role */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white text-sm font-semibold py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-4">
            By signing up, you agree to our Terms & Privacy Policy.
          </p>
        </form>

        {/* Bottom box */}
        <div className="bg-white border border-gray-300 mt-3 py-4 text-center text-sm">
          Already have an account?{" "}
          <span
            onClick={() => setPage("login")}
            className="text-blue-500 font-semibold cursor-pointer"
          >
            Log in
          </span>
        </div>

      </div>
    </div>
  );
};

export default Register;