import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadFile } from "../api";
import { Upload as UploadIcon, Music, FileAudio, X, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 20 * 1024 * 1024) {
        alert("File size exceeds 20MB limit.");
        return;
      }
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.split(".")[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("genre", genre);
    formData.append("tags", tags);

    try {
      await uploadFile("/songs/upload", formData);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      alert("Upload failed: " + err);
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <h2 className="text-2xl font-bold text-zinc-900">Upload Successful!</h2>
        <p className="text-zinc-500 mt-2">Your demo has been added to the library.</p>
        <p className="text-zinc-400 text-sm mt-4 italic">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Upload Demo</h1>
        <p className="text-zinc-500 mt-1">Share your latest creation with the world.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
          <div className="space-y-6">
            {/* File Dropzone */}
            <div className="relative">
              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:bg-zinc-50 hover:border-indigo-400 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className="w-10 h-10 text-zinc-400 group-hover:text-indigo-500 mb-4 transition-colors" />
                    <p className="mb-2 text-sm text-zinc-700 font-semibold">Click to upload or drag and drop</p>
                    <p className="text-xs text-zinc-400">MP3 or WAV (Max 20MB)</p>
                  </div>
                  <input type="file" className="hidden" accept=".mp3,.wav" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                      <FileAudio className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-zinc-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Song Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter song title"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Genre</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                >
                  <option value="">Select Genre</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Classical">Classical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your song..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="demo, vocal, acoustic..."
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Uploading Demo...</span>
            </>
          ) : (
            <>
              <UploadIcon className="w-5 h-5" />
              <span>Publish Demo</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
