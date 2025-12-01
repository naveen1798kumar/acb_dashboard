// dashboard/src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ShieldCheck, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.post(`${API_BASE}/auth/admin-login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Branding / Intro */}
        <div className="text-slate-100 hidden md:block">
          <div className="inline-flex items-center gap-2 bg-slate-900/40 border border-slate-700/60 px-4 py-2 rounded-full mb-4">
            <span className="h-7 w-7 rounded-full bg-red-500/20 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-red-400" />
            </span>
            <span className="text-xs font-medium text-slate-300">
              Secure Admin Access • ACB Bakery
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            Welcome back, Admin
          </h1>
          <p className="text-sm lg:text-base text-slate-300/90 max-w-md">
            Manage products, orders, events, and users from a single, streamlined
            dashboard. Please log in with your admin credentials to continue.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-slate-300/80">
            <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl px-4 py-3">
              <p className="font-semibold mb-1">Role-based Access</p>
              <p className="text-[11px]">
                Only authorized admins can access this dashboard.
              </p>
            </div>
            <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl px-4 py-3">
              <p className="font-semibold mb-1">Secure Sessions</p>
              <p className="text-[11px]">
                Tokens are stored safely and validated on each request.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-red-500/40 via-rose-500/30 to-blue-500/30 blur-2xl opacity-70 md:opacity-60 pointer-events-none" />
          <div className="relative bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl p-7 md:p-8 backdrop-blur-md">
            {/* Logo / Title mobile */}
            <div className="flex items-center justify-between mb-6 md:mb-7">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 rounded-xl bg-red-500/15 border border-red-500/30 items-center justify-center">
                    <span className="font-bold text-red-400 text-xs">ACB</span>
                  </span>
                  <span>Admin Login</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Sign in with your admin email and password.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 text-xs text-red-300 bg-red-900/30 border border-red-700/50 rounded-xl px-3 py-2">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-200">
                  Admin Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/60"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-200">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/60"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute inset-y-0 right-3 flex items-center text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Small bottom row */}
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Only authorized admins can log in.</span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-red-900/30 hover:from-red-500 hover:via-rose-500 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign in to Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
