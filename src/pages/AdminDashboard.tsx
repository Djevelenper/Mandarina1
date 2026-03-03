import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { Users, Music, Trash2, Shield, Calendar, Mail, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface Song {
  id: string;
  title: string;
  artist_email: string;
  upload_date: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "songs">("users");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, songsData] = await Promise.all([
        apiFetch("/admin/users"),
        apiFetch("/songs") // Admin already gets all songs from this endpoint
      ]);
      setUsers(usersData);
      setSongs(songsData);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure? This will delete the user and all their songs forever.")) return;
    try {
      await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
      setUsers(users.filter(u => u.id !== id));
      setSongs(songs.filter(s => users.find(u => u.id === id)?.email !== s.artist_email));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (!confirm("Delete this song?")) return;
    try {
      await apiFetch(`/songs/${id}`, { method: "DELETE" });
      setSongs(songs.filter(s => s.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            Admin Control Center
          </h1>
          <p className="text-zinc-500 mt-1">Global management of users and song recordings.</p>
        </div>
        
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "users" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("songs")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "songs" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            All Demos ({songs.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          <AnimatePresence mode="wait">
            {activeTab === "users" ? (
              <motion.div
                key="users-table"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                              <Mail className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-zinc-900">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <motion.div
                key="songs-table"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Song Title</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Artist</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Uploaded</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {songs.map((song) => (
                      <tr key={song.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                              <Music className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-zinc-900">{song.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500">{song.artist_email}</td>
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {new Date(song.upload_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteSong(song.id)}
                            className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Song"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {!loading && activeTab === "users" && users.length === 0 && (
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">No users found in the system.</p>
        </div>
      )}
    </div>
  );
}
