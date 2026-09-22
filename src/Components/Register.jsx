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
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleSelect = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.username.trim() ||
      !form.password ||
      !form.mobileNo.trim()
    ) {
      return toast.error("Please fill in all required fields");
    }

    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (!/^[6-9]\d{9}$/.test(form.mobileNo)) {
      return toast.error("Please enter a valid 10-digit mobile number (e.g. 9876543210)");
    }

    setLoading(true);

    try {
      await api.post("/auth/register", form);
      toast.success("Account created successfully! 🎉");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 text-white text-2xl font-bold shadow-lg shadow-indigo-500/30 mb-3">
            🛍️
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Join Shop<span className="text-rose-500">.</span>ly
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Create your account to start buying or selling today
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("buyer")}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    form.role === "buyer"
                      ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                  }`}
                >
                  <span className="text-2xl">🛍️</span>
                  <div>
                    <p className="font-bold text-sm leading-snug">Buyer</p>
                    <p className="text-xs text-slate-500 hidden sm:block">Shop & place orders</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("seller")}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    form.role === "seller"
                      ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                  }`}
                >
                  <span className="text-2xl">🏪</span>
                  <div>
                    <p className="font-bold text-sm leading-snug">Seller</p>
                    <p className="text-xs text-slate-500 hidden sm:block">List & manage items</p>
                  </div>
                </button>
              </div>
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  name="firstName"
                  placeholder="e.g. John"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition duration-200"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  name="lastName"
                  placeholder="e.g. Doe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition duration-200"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                name="username"
                placeholder="Choose a unique username"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition duration-200"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-semibold">
                  +91
                </span>
                <input
                  name="mobileNo"
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition duration-200"
                  value={form.mobileNo}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="At least 6 characters"
                  className="w-full pl-3.5 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition duration-200"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-400 hover:text-indigo-600 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Creating your account...</span>
                </>
              ) : (
                <span>Complete Registration 🎉</span>
              )}
            </button>
          </form>

          {/* Terms info */}
          <p className="text-[11px] text-slate-400 text-center mt-4">
            By signing up, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>

        {/* Footer switch */}
        <div className="text-center mt-6 text-sm text-slate-400">
          Already have an account?{" "}
          <button
            onClick={() => setPage("login")}
            className="text-indigo-400 hover:text-white font-bold transition underline underline-offset-4"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;