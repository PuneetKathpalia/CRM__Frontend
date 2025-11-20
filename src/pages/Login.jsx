import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { API_BASE_URL as API_BASE } from '../config/api';
import { FiMail, FiLock, FiUser, FiArrowRight, FiTrendingUp, FiCheckCircle } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status}. Please make sure the backend is running on ${API_BASE}`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || data.details || "Authentication failed");
      }

      if (data.data && data.data.token) {
        localStorage.setItem("token", data.data.token);
        login(data.data);
        setSuccess(isLogin ? "Login successful! Redirecting..." : "Account created! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Auth error:", err);
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError(`Cannot connect to server. Please make sure the backend is running on ${API_BASE}`);
      } else if (err.message.includes("Server error")) {
        setError(err.message);
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-3xl mb-6 shadow-2xl shadow-purple-500/30">
            <FiTrendingUp className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">
            MiniCRM
          </h1>
          <p className="text-gray-400 text-base">
            Professional Customer Relationship Management
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-10 backdrop-blur-sm">
          {/* Toggle */}
          <div className="flex gap-3 mb-10 p-1.5 bg-black/50 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
                setSuccess("");
                setFormData({ name: "", email: "", password: "" });
              }}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all ${
                isLogin
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError("");
                setSuccess("");
                setFormData({ name: "", email: "", password: "" });
              }}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all ${
                !isLogin
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {!isLogin && (
                <p className="mt-2 text-xs text-gray-500">Minimum 6 characters required</p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
                <span className="text-red-500 text-lg">⚠</span>
                <span className="flex-1">{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-2xl shadow-purple-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our terms of service
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Created by{" "}
            <a
              href="https://pk-portfolio-six.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
            >
              Puneet Kathpalia
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
