import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Music, LogOut, Upload, LayoutDashboard, User, Shield } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Music className="w-6 h-6" />
            <span>Mandari</span>
          </Link>

          {user && (
            <nav className="flex items-center gap-6">
              {user.role === "admin" && (
                <Link to="/admin" className="text-zinc-600 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
              <Link to="/dashboard" className="text-zinc-600 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link to="/upload" className="text-zinc-600 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </Link>
              <div className="h-6 w-px bg-zinc-200" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-zinc-900">{user.email}</span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="bg-white border-t border-zinc-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-400 text-sm">© 2026 Mandari Demo Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
