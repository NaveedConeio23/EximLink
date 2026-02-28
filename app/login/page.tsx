"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC] font-sans">
      {/* Background blobs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#FF8C42]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#48CAE4]/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-4 border-[#FF8C42]/10 overflow-hidden">

          {/* Top accent */}
          <div className="h-2 bg-gradient-to-r from-[#FF8C42] via-[#48CAE4] to-[#99D98C]" />

          <div className="p-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#FF8C42] flex items-center justify-center shadow-lg shadow-[#FF8C42]/30 mb-4">
                <span className="text-white text-2xl font-black">C</span>
              </div>
              <h1 className="text-2xl font-black text-[#4A4E69] tracking-tight">Coneio Global Trade</h1>
              <p className="text-sm text-[#4A4E69]/50 font-semibold mt-1">WhatsApp CRM Dashboard</p>
            </div>

            {/* Welcome */}
            <div className="mb-6">
              <h2 className="text-xl font-black text-[#4A4E69]">Welcome back! 👋</h2>
              <p className="text-sm text-[#4A4E69]/50 font-medium mt-1">Sign in to manage your conversations</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-black text-[#4A4E69]/60 uppercase tracking-widest mb-2 block">Email</label>
                <input
                  type="email"
                  placeholder="admin@coneio.com"
                  className="w-full px-5 py-3.5 bg-[#F5F5DC]/50 border-2 border-[#4A4E69]/10 rounded-2xl outline-none text-sm font-medium text-[#4A4E69] placeholder-[#4A4E69]/30 focus:border-[#FF8C42] transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-black text-[#4A4E69]/60 uppercase tracking-widest mb-2 block">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-[#F5F5DC]/50 border-2 border-[#4A4E69]/10 rounded-2xl outline-none text-sm font-medium text-[#4A4E69] placeholder-[#4A4E69]/30 focus:border-[#FF8C42] transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3">
                  <p className="text-red-500 text-sm font-bold">⚠️ {error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF8C42] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-[#FF8C42]/30 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#FF8C42]/40 transition-all disabled:opacity-60 disabled:scale-100 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In 🚀"}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t-2 border-[#4A4E69]/5 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#99D98C] animate-pulse" />
              <p className="text-xs font-bold text-[#4A4E69]/40">Powered by SeaOne Global Trade Ecosystem</p>
            </div>
          </div>
        </div>

        {/* Platform badges */}
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          {["seaone.io", "dollarexim.com", "silkroutex.com", "coneio.com"].map((platform) => (
            <span key={platform} className="text-[10px] font-black text-[#4A4E69]/40 bg-white px-3 py-1.5 rounded-full border border-[#4A4E69]/10 shadow-sm">
              {platform}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}