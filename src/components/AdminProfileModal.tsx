import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Lock,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Key,
} from "lucide-react";
import { UserProfile } from "../types";

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateUser: (updatedUser: UserProfile) => void;
  token: string | null;
}

type ActiveTab = "profile" | "password";

export default function AdminProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  token,
}: AdminProfileModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password Visibility States (User requested toggles to prevent typos)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Alert/Status States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize fields on open
  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setErrorMsg(null);
      setSuccessMsg(null);
      // Reset password states
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      if (user.must_change_password) {
        setActiveTab("password");
      } else {
        setActiveTab("profile");
      }
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const authHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ fullName, email, bio }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil");
      }

      onUpdateUser(data.user);
      setSuccessMsg("Profil admin berhasil diperbarui!");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password baru tidak cocok.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password baru minimal 6 karakter.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengubah password");
      }

      if (data.user) {
        onUpdateUser(data.user);
      }
      setSuccessMsg("Password berhasil diperbarui!");
      // Reset password inputs
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-coral-200/60 flex flex-col md:flex-row h-[560px] max-h-[90vh]">
        {/* LEFT COLUMN: Sidebar Navigation inside modal */}
        <div className="bg-coral-50/50 md:w-56 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-coral-200">
          <div className="space-y-6">
            <div>
              <h3 className="font-extrabold text-coral-950 text-base">Pengaturan</h3>
              <p className="text-[10px] text-coral-500 font-mono mt-0.5 uppercase tracking-wider">
                Akun Administrator
              </p>
            </div>

            <nav className="flex md:flex-col gap-1.5">
              {!user.must_change_password && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("profile");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 md:flex-none flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "profile"
                      ? "bg-coral-800 text-white shadow-md shadow-coral-800/10"
                      : "text-coral-700 hover:bg-coral-100/70"
                  }`}
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>Ubah Profil</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveTab("password");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 md:flex-none flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "password"
                    ? "bg-coral-800 text-white shadow-md shadow-coral-800/10"
                    : "text-coral-700 hover:bg-coral-100/70"
                }`}
                disabled={user.must_change_password}
              >
                <Key className="w-4 h-4 flex-shrink-0" />
                <span>Keamanan & Sandi</span>
              </button>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2.5 p-3 bg-coral-100/40 rounded-xl border border-coral-200/50">
            <div className="w-8 h-8 rounded-full bg-coral-800 text-coral-50 font-black flex items-center justify-center text-xs shadow-sm uppercase">
              {user.username.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-coral-900 truncate leading-none">
                {user.fullName || user.username}
              </p>
              <p className="text-[9px] text-coral-400 font-medium truncate mt-0.5">
                @{user.username}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-coral-100 flex items-center justify-between flex-shrink-0">
            <h4 className="font-bold text-coral-900 text-sm flex items-center gap-2">
              {activeTab === "profile" ? (
                <>
                  <User className="w-4.5 h-4.5 text-coral-800" />
                  <span>Ubah Profil Administrator</span>
                </>
              ) : (
                <>
                  <Lock className="w-4.5 h-4.5 text-coral-800" />
                  <span>Ubah Password Akun</span>
                </>
              )}
            </h4>
            {!user.must_change_password && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-coral-400 hover:bg-coral-50 hover:text-coral-800 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Warning for forced password change */}
            {user.must_change_password && (
              <div className="bg-amber-50 text-amber-800 text-xs p-4 rounded-xl border border-amber-200 flex items-start gap-3 animate-slide-up">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 mb-0.5">
                    Wajib Mengganti Password Default
                  </p>
                  <p className="text-amber-700 leading-relaxed font-medium">
                    Demi keamanan akun Anda, harap ganti password bawaan (`admin123`) terlebih
                    dahulu sebelum dapat mengakses fitur pengelolaan CMS ini.
                  </p>
                </div>
              </div>
            )}

            {/* Feedback Notifications */}
            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl border border-red-100 flex items-start gap-2.5 animate-slide-up">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-xl border border-emerald-100 flex items-start gap-2.5 animate-slide-up">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB CONTENT: PROFILE */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-4 font-sans">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-coral-500 block mb-1">
                    Username (Tidak Bisa Diubah)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-coral-400 font-semibold text-xs">
                      @
                    </span>
                    <input
                      type="text"
                      disabled
                      value={user.username}
                      className="w-full text-xs pl-8 pr-4 py-2.5 bg-coral-100/40 border border-coral-200 rounded-xl text-coral-500 font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-coral-500 block mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4.5 h-4.5 text-coral-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda..."
                      className="w-full text-xs pl-10 pr-4 py-2.5 border border-coral-200 rounded-xl focus:ring-2 focus:ring-coral-800/20 focus:border-coral-800 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-coral-500 block mb-1">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-coral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh@domain.com"
                      className="w-full text-xs pl-10 pr-4 py-2.5 border border-coral-200 rounded-xl focus:ring-2 focus:ring-coral-800/20 focus:border-coral-800 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-coral-500 block mb-1">
                    Deskripsi / Bio Singkat
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 w-4.5 h-4.5 text-coral-400" />
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tulis deskripsi singkat tentang peran Anda atau informasi profil..."
                      className="w-full text-xs pl-10 pr-4 py-2.5 border border-coral-200 rounded-xl focus:ring-2 focus:ring-coral-800/20 focus:border-coral-800 outline-none h-24 resize-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-coral-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-coral-800 hover:bg-coral-900 disabled:bg-coral-400 text-white rounded-xl text-xs font-bold shadow-md shadow-coral-800/10 flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Perubahan Profil</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: PASSWORD */}
            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-4 font-sans">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-coral-500 block mb-1">
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-coral-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ketik password lama Anda..."
                      className="w-full text-xs pl-10 pr-12 py-2.5 border border-coral-200 rounded-xl focus:ring-2 focus:ring-coral-800/20 focus:border-coral-800 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      title={showCurrentPassword ? "Sembunyikan password" : "Tampilkan password"}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-coral-400 hover:text-coral-600 focus:outline-none"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="my-4 border-b border-coral-100" />

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-coral-500 block mb-1">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-coral-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter..."
                      className="w-full text-xs pl-10 pr-12 py-2.5 border border-coral-200 rounded-xl focus:ring-2 focus:ring-coral-800/20 focus:border-coral-800 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      title={showNewPassword ? "Sembunyikan password" : "Tampilkan password"}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-coral-400 hover:text-coral-600 focus:outline-none"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-coral-500 block mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-coral-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password baru..."
                      className="w-full text-xs pl-10 pr-12 py-2.5 border border-coral-200 rounded-xl focus:ring-2 focus:ring-coral-800/20 focus:border-coral-800 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-coral-400 hover:text-coral-600 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-coral-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-coral-800 hover:bg-coral-900 disabled:bg-coral-400 text-white rounded-xl text-xs font-bold shadow-md shadow-coral-800/10 flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengubah...</span>
                      </>
                    ) : (
                      <span>Ubah Password Akun</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
