import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import { Search, Filter, Trash2, Play, Pause, Clock, Tag, User, Music } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../AuthContext";

interface Song {
  id: string;
  title: string;
  description: string;
  genre: string;
  tags: string;
  file_path: string;
  upload_date: string;
  artist_email: string;
}

export default function Dashboard() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const { user } = useAuth();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio] = useState(new Audio());

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (genre) params.append("genre", genre);
      const data = await apiFetch(`/songs?${params.toString()}`);
      setSongs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [genre]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this demo?")) return;
    try {
      await apiFetch(`/songs/${id}`, { method: "DELETE" });
      setSongs(songs.filter(s => s.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const togglePlay = (song: Song) => {
    if (playingId === song.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      audio.src = song.file_path;
      audio.play();
      setPlayingId(song.id);
    }
  };

  useEffect(() => {
    audio.onended = () => setPlayingId(null);
    return () => {
      audio.pause();
    };
  }, [audio]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Your Demo Library</h1>
          <p className="text-zinc-500 mt-1">Manage and review your song recordings.</p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Upload New Demo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, tags..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchSongs()}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <select
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none transition-all"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Hip Hop">Hip Hop</option>
            <option value="Electronic">Electronic</option>
            <option value="Jazz">Jazz</option>
            <option value="Classical">Classical</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {songs.map((song) => (
              <motion.div
                key={song.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-grow">
                    <h3 className="font-bold text-zinc-900 text-lg leading-tight mb-1">{song.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      {new Date(song.upload_date).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(song.id)}
                    className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-zinc-600 text-sm line-clamp-2 mb-4 h-10">
                  {song.description || "No description provided."}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {song.genre && (
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md">
                      {song.genre}
                    </span>
                  )}
                  {song.tags?.split(",").map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                      <Tag className="w-2 h-2" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>

                {user?.role === "admin" && (
                  <div className="flex items-center gap-2 mb-4 p-2 bg-zinc-50 rounded-lg">
                    <User className="w-3 h-3 text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase truncate">Artist: {song.artist_email}</span>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => togglePlay(song)}
                    className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                      playingId === song.id
                        ? "bg-zinc-900 text-white"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {playingId === song.id ? (
                      <>
                        <Pause className="w-5 h-5 fill-current" />
                        <span>Pause Demo</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-current" />
                        <span>Play Demo</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && songs.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-zinc-300 rounded-3xl">
          <Music className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-900">No demos found</h3>
          <p className="text-zinc-500">Start by uploading your first song recording.</p>
          <Link to="/upload" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">
            Upload a song
          </Link>
        </div>
      )}
    </div>
  );
}
