import React, { useState } from "react";
import { X, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await onLogin(username, password);
      // Reset form states on success
      setUsername("");
      setPassword("");
      setErrorMsg("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal melakukan login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-coral-950/60 flex items-center justify-center p-4 z-[60] animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-coral-200">
        <div className="px-6 py-5 bg-coral-50 flex flex-col items-center justify-center text-center relative border-b border-coral-200">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-md text-coral-400 hover:bg-coral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="bg-coral-800 text-coral-50 p-3 rounded-xl mb-3 shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-coral-900 text-lg">Login Administrator</h3>
          <p className="text-xs text-coral-500 mt-1">Masuk untuk mengedit dokumentasi ini.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 font-medium">
              {errorMsg}
            </div>
          )}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-coral-500 block mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-sm px-4 py-2.5 border border-coral-200 rounded-xl focus:ring-2 focus:ring-coral-800/25 focus:border-coral-800 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-coral-500 block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm px-4 py-2.5 pr-12 border border-coral-200 rounded-xl focus:ring-2 focus:ring-coral-800/25 focus:border-coral-800 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-coral-400 hover:text-coral-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-coral-800 hover:bg-coral-900 disabled:bg-coral-400 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Masuk...</span>
              </>
            ) : (
              <span>Login Akses Editor</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
