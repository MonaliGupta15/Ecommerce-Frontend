import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Login = ({ setPage }) => {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      return toast.error("Please fill all fields");
    }

    try {
      const res = await api.post("/auth/login", form); // cookie handled automatically
        localStorage.setItem("role", res.data.data.role)
        localStorage.setItem("username", res.data.data.username)
        toast.success("Login successful 🎉");

        console.log(res.data);

      // 👉 move to next page (you can later replace with dashboard)
      setPage("dashboard");

    } catch (error) {
        console.log("LOGIN ERROR:", error.response);
      toast.error(
        error?.response?.data?.message || "Login failed"
      );
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
          <h1 className="text-3xl font-semibold text-center mb-8 tracking-tight">
            Login
          </h1>

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
            value={form.username}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
            value={form.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white text-sm font-semibold py-2 rounded hover:bg-blue-600 transition"
          >
            Log in
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Forgot password?
          </p>
        </form>

        {/* Bottom box */}
        <div className="bg-white border border-gray-300 mt-3 py-4 text-center text-sm">
          Don't have an account?{" "}
          <span
            onClick={() => setPage("register")}
            className="text-blue-500 font-semibold cursor-pointer"
          >
            Sign up
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;