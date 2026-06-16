import React, { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Plus,
  Settings,
  Trash2,
  Eye,
  Edit3,
  LogOut,
  X,
  Mail,
  Menu,
  User,
} from "lucide-react";
import { Documentation, AppMode } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";

interface HeaderProps {
  documentations: Documentation[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onCreateDoc: (title: string, description: string) => void;
  onUpdateDoc: (id: string, title: string, description: string) => void;
  onDeleteDoc: (id: string) => void;
  mode: AppMode;
  onToggleMode: (mode: AppMode) => void;
  user: any | null;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  onOpenProfile?: () => void;
}

export default function Header({
  documentations,
  activeDocId,
  onSelectDoc,
  onCreateDoc,
  onUpdateDoc,
  onDeleteDoc,
  mode,
  onToggleMode,
  user,
  onLogout,
  onToggleSidebar,
  onOpenProfile,
}: HeaderProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docDesc, setDocDesc] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const activeDoc = documentations.find((d) => d.id === activeDocId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;
    onCreateDoc(docTitle.trim(), docDesc.trim());
    setShowCreateModal(false);
    setDocTitle("");
    setDocDesc("");
  };

  const handleOpenConfig = () => {
    if (activeDoc) {
      setEditTitle(activeDoc.title);
      setEditDesc(activeDoc.description);
      setShowConfigModal(true);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeDoc && editTitle.trim()) {
      onUpdateDoc(activeDoc.id, editTitle.trim(), editDesc.trim());
      setShowConfigModal(false);
    }
  };

  const handleDelete = () => {
    if (activeDoc) {
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = () => {
    if (activeDoc) {
      onDeleteDoc(activeDoc.id);
      setShowConfigModal(false);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <header
      className="bg-white/75 backdrop-blur-md border-b border-coral-200 sticky top-0 z-40 px-4 py-3 shadow-sm"
      id="header-container"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Switcher */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 -ml-1.5 text-coral-600 hover:bg-coral-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="bg-coral-800 text-coral-50 p-2 rounded-lg shadow-sm flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-coral-950 leading-none">
                myinfo.my.id
              </h1>
              <span className="text-[10px] font-mono text-coral-700/80">Self-Hosted CMS v1.2</span>
            </div>
          </div>

          <span className="h-6 w-[1px] bg-coral-200 hidden md:block" />

          {/* Documentation Picker */}
          <div className="relative group" id="doc-picker-dropdown">
            <div className="flex items-center gap-2 bg-coral-100/60 hover:bg-coral-200 border border-coral-200 rounded-lg px-3 py-1.5 cursor-pointer select-none transition-all">
              <div className="text-left">
                <p className="text-[10px] text-coral-500 font-bold uppercase tracking-wider leading-none">
                  Proyek Aktif
                </p>
                <p className="text-xs font-semibold text-coral-800 max-w-[200px] whitespace-normal break-words leading-tight">
                  {activeDoc ? activeDoc.title : "Default Documentation"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-coral-500" />
            </div>

            {/* Dropdown Box */}
            <div className="absolute left-0 mt-1.5 w-64 bg-white border border-coral-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 p-2 space-y-1">
              <p className="text-[10px] font-bold text-coral-400 uppercase tracking-widest p-2">
                Pilih Dokumentasi
              </p>
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {documentations.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => onSelectDoc(doc.id)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg block whitespace-normal break-words transition-colors ${
                      doc.id === activeDocId
                        ? "bg-coral-800 text-coral-50 font-semibold"
                        : "text-coral-700 hover:bg-coral-50"
                    }`}
                  >
                    {doc.title}
                  </button>
                ))}
              </div>
              <div className="border-t border-coral-100 mt-2 pt-1.5">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full text-left text-xs text-coral-800 hover:text-coral-950 font-semibold flex items-center gap-2 p-2 hover:bg-coral-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Proyek Dokumentasi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active project setting controls */}
          {activeDoc && (
            <button
              onClick={handleOpenConfig}
              title="Atur Proyek Dokumentasi"
              className="p-1.5 text-coral-400 hover:text-coral-800 hover:bg-coral-50 rounded-lg transition-all border border-transparent hover:border-coral-100"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Center / Mode Switcher */}
        <div
          className="flex items-center gap-1.5 bg-coral-200/40 p-1 rounded-xl"
          id="mode-switcher-container"
        >
          <button
            onClick={() => onToggleMode("editor")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === "editor"
                ? "bg-coral-800 text-coral-50 shadow-sm"
                : "text-coral-600 hover:text-coral-900"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Mode Editor</span>
          </button>
          <button
            onClick={() => onToggleMode("public")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === "public"
                ? "bg-coral-800 text-coral-50 shadow-sm"
                : "text-coral-600 hover:text-coral-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Mode Publik</span>
          </button>
        </div>

        {/* Right Info Details */}
        <div className="hidden lg:flex items-center gap-3">
          {user && onOpenProfile && (
            <button
              onClick={onOpenProfile}
              title="Pengaturan Profil & Keamanan"
              className="p-1.5 text-coral-500 hover:text-coral-800 hover:bg-coral-100/60 rounded-lg transition-all border border-transparent hover:border-coral-200 cursor-pointer"
            >
              <User className="w-4.5 h-4.5" />
            </button>
          )}
          <div className="text-right">
            <span className="text-[10px] font-bold text-coral-400 flex items-center justify-end gap-1 font-mono uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
              Sesi Administrator
            </span>
            <span className="text-[11px] text-coral-600 flex items-center gap-1 font-sans">
              <Mail className="w-3 h-3 text-coral-400" />
              {user ? user.fullName || user.username : "Not logged in"}
            </span>
          </div>
          {user && (
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 text-coral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* MODAL: CREATE DOCUMENTATION */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-coral-950/50 flex items-center justify-center p-4 z-50 animate-fade-in"
          id="create-modal"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-coral-200">
            <div className="px-5 py-4 bg-coral-50 border-b border-coral-200 flex items-center justify-between">
              <h3 className="font-bold text-coral-800 text-sm">Buat Proyek Dokumentasi Baru</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded hover:bg-coral-200 text-coral-400 hover:text-coral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-coral-500 block mb-1">
                  Judul Dokumentasi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Flutter SDK Indonesia"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-coral-200 rounded-lg focus:ring-2 focus:ring-coral-800/25 focus:border-coral-800 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-coral-500 block mb-1">
                  Deskripsi Ringkas
                </label>
                <textarea
                  placeholder="Deskripsikan tujuan atau basis audiens tulisan ini..."
                  value={docDesc}
                  onChange={(e) => setDocDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-coral-200 rounded-lg focus:ring-2 focus:ring-coral-800/25 focus:border-coral-800 outline-none h-20 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-coral-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-coral-200 hover:bg-coral-100 rounded-lg text-xs font-semibold text-coral-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-coral-800 hover:bg-coral-900 rounded-lg text-xs font-semibold text-white shadow"
                >
                  Mulai Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURE DOCUMENTATION PROJECT */}
      {showConfigModal && (
        <div
          className="fixed inset-0 bg-coral-900/50 flex items-center justify-center p-4 z-50 animate-fade-in"
          id="config-modal"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-coral-200">
            <div className="px-5 py-4 bg-coral-50 border-b border-coral-200 flex items-center justify-between">
              <h3 className="font-bold text-coral-800 text-sm">Pengaturan Proyek Dokumentasi</h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded hover:bg-coral-200 text-coral-400 hover:text-coral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-coral-500 block mb-1">
                  Judul Dokumentasi
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-coral-200 rounded-lg focus:ring-2 focus:ring-coral-800/25 focus:border-coral-800 outline-none font-sans"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-coral-500 block mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-coral-200 rounded-lg focus:ring-2 focus:ring-coral-800/25 focus:border-coral-800 outline-none h-20 resize-none font-sans"
                />
              </div>

              <div className="pt-2 border-t border-coral-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-800 rounded-lg font-semibold flex items-center gap-1 transition-all border border-transparent hover:border-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Permanen</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 border border-coral-200 hover:bg-coral-50 rounded-lg text-xs font-semibold text-coral-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-coral-800 hover:bg-coral-900 rounded-lg text-xs font-semibold text-white shadow"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Hapus Proyek Dokumentasi"
        message={`Apakah Anda yakin ingin menghapus proyek dokumentasi "${activeDoc?.title}"? Seluruh bab dan artikel di dalamnya akan dihapus secara permanen.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </header>
  );
}
