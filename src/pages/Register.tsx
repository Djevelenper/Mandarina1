import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { Music, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"artist" | "admin">("artist");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      });
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl shadow-zinc-200/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
              <Music className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Create Account</h1>
            <p className="text-zinc-500 mt-1">Join Mandari to start sharing your demos.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("artist")}
                  className={`py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all ${
                    role === "artist"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                      : "border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200"
                  }`}
                >
                  Artist
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    role === "admin"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                      : "border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? "Creating Account..." : (
                <>
                  <span>Register Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-100 text-center">
            <p className="text-zinc-500 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
