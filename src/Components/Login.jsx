import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Login = ({ setPage }) => {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password) {
      return toast.error("Please fill in all fields");
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("role", res.data.data.role);
      localStorage.setItem("username", res.data.data.username);
      if (res.data.data.token) {
        localStorage.setItem("token", res.data.data.token);
      }
      toast.success("Welcome back! 🎉");
      setPage("dashboard");
    } catch (error) {
      console.log("LOGIN ERROR:", error.response);
      toast.error(
        error?.response?.data?.message || "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    const creds =
      role === "seller"
        ? { username: "demoseller", password: "password123" }
        : { username: "demobuyer", password: "password123" };

    setForm(creds);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", creds);
      localStorage.setItem("role", res.data.data.role);
      localStorage.setItem("username", res.data.data.username);
      if (res.data.data.token) {
        localStorage.setItem("token", res.data.data.token);
      }
      toast.success(`Logged in as Demo ${role === "seller" ? "Seller" : "Buyer"}! 🎉`);
      setPage("dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 text-white text-2xl font-bold shadow-lg shadow-indigo-500/30 mb-3">
            🛍️
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Shop<span className="text-rose-500">.</span>ly
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Welcome back! Log in to explore the marketplace
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition duration-200"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition duration-200"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In to Your Account →</span>
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider mb-2.5">
              Instant 1-Click Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo("buyer")}
                disabled={loading}
                className="px-3 py-2.5 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-xl text-center font-bold transition active:scale-95 disabled:opacity-50"
              >
                👤 Buyer Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("seller")}
                disabled={loading}
                className="px-3 py-2.5 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl text-center font-bold transition active:scale-95 disabled:opacity-50"
              >
                🏪 Seller Demo
              </button>
            </div>

            {/* Guest Browsing */}
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("role", "buyer");
                setPage("dashboard");
              }}
              className="w-full mt-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>👀</span>
              <span>Browse Catalog as Guest</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Footer switch */}
        <div className="text-center mt-6 text-sm text-slate-400">
          Don't have an account yet?{" "}
          <button
            onClick={() => setPage("register")}
            className="text-indigo-400 hover:text-white font-bold transition underline underline-offset-4"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;