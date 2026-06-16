import React, { useState } from "react";
import {
  Plus,
  FolderPlus,
  FileText,
  ChevronRight,
  Trash2,
  MoveUp,
  MoveDown,
  Settings,
  X,
  Layers,
  Search,
} from "lucide-react";
import { Topic } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";

interface SidebarLeftProps {
  documentationId: string;
  topics: Topic[];
  activeTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
  onAddTopic: (title: string, parent_id: string | null) => void;
  onUpdateTopic: (id: string, updates: Partial<Topic>) => void;
  onDeleteTopic: (id: string) => void;
  onReorderTopics: (updatedTopics: { id: string; sort_order: number }[]) => void;
}

export default function SidebarLeft({
  documentationId: _documentationId,
  topics,
  activeTopicId,
  onSelectTopic,
  onAddTopic,
  onUpdateTopic,
  onDeleteTopic,
  onReorderTopics,
}: SidebarLeftProps) {
  const [collapsedParents, setCollapsedParents] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState<"parent" | "child" | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");

  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editParentId, setEditParentId] = useState<string | null>(null);

  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    topicId: string | null;
    message: string;
  }>({
    isOpen: false,
    topicId: null,
    message: "",
  });

  const handleDeleteClick = (id: string, title: string, isParent: boolean) => {
    setDeleteConfirmState({
      isOpen: true,
      topicId: id,
      message: isParent
        ? `Apakah Anda yakin ingin menghapus Bab "${title}"? Seluruh sub-bab di dalamnya akan dihapus secara permanen.`
        : `Apakah Anda yakin ingin menghapus Sub-Bab "${title}" secara permanen?`,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmState.topicId) {
      onDeleteTopic(deleteConfirmState.topicId);
    }
    setDeleteConfirmState({ isOpen: false, topicId: null, message: "" });
  };

  // Filter root topics and sort
  const rootTopics = topics
    .filter((t) => t.parent_id === null)
    .filter((t) => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.sort_order - b.sort_order);

  const getChildren = (parentId: string) => {
    return topics
      .filter((t) => t.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddModal = (mode: "parent" | "child", parentId: string | null = null) => {
    setNewTopicTitle("");
    setSelectedParentId(parentId);
    setShowAddModal(mode);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    onAddTopic(newTopicTitle.trim(), selectedParentId);
    setShowAddModal(null);
  };

  const handleMove = (direction: "up" | "down", topic: Topic) => {
    const siblings = topics
      .filter((t) => t.parent_id === topic.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order);

    const idx = siblings.findIndex((t) => t.id === topic.id);
    if (idx === -1) return;

    if (direction === "up" && idx > 0) {
      const peer = siblings[idx - 1];
      onReorderTopics([
        { id: topic.id, sort_order: peer.sort_order },
        { id: peer.id, sort_order: topic.sort_order },
      ]);
    } else if (direction === "down" && idx < siblings.length - 1) {
      const peer = siblings[idx + 1];
      onReorderTopics([
        { id: topic.id, sort_order: peer.sort_order },
        { id: peer.id, sort_order: topic.sort_order },
      ]);
    }
  };

  const startEditing = (topic: Topic, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTopic(topic);
    setEditTitle(topic.title);
    setEditSlug(topic.slug);
    setEditParentId(topic.parent_id);
  };

  const saveTopicEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editTitle.trim()) return;
    await onUpdateTopic(editingTopic.id, {
      title: editTitle.trim(),
      slug: editSlug.trim(),
      parent_id: editParentId === "root" ? null : editParentId,
    });
    setEditingTopic(null);
  };

  return (
    <nav
      className="flex flex-col h-full bg-white/70 backdrop-blur-md border border-coral-200 rounded-2xl shadow-sm overflow-hidden"
      id="cms-sidebar-left"
      aria-label="Daftar Bab dan Topik"
    >
      {/* Header Section */}
      <div className="p-4 border-b border-coral-100 bg-coral-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-coral-800 rounded-lg shadow-sm">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-coral-900">
              Struktur Konten
            </h3>
          </div>
          <button
            onClick={() => openAddModal("parent")}
            className="p-1.5 bg-white border border-coral-200 text-coral-800 rounded-lg hover:bg-coral-800 hover:text-white transition-all shadow-sm group"
            title="Tambah Bab Baru"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-coral-400" />
          <input
            type="text"
            placeholder="Cari topik..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-coral-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-coral-800/10 focus:border-coral-800 transition-all"
          />
        </div>
      </div>

      {/* Topics Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {rootTopics.length === 0 ? (
          <div className="text-center py-10">
            <div className="bg-coral-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-coral-200" />
            </div>
            <p className="text-[10px] font-bold text-coral-300 uppercase tracking-tighter">
              Kosong
            </p>
          </div>
        ) : (
          rootTopics.map((root, rootIndex) => {
            const children = getChildren(root.id);
            const isCollapsed = collapsedParents[root.id] || false;
            const isActive = activeTopicId === root.id;

            return (
              <div key={root.id} className="space-y-0.5">
                {/* Parent Row */}
                <div
                  onClick={() => {
                    onSelectTopic(root.id);
                    if (isCollapsed) {
                      setCollapsedParents((prev) => ({ ...prev, [root.id]: false }));
                    }
                  }}
                  className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? "bg-coral-800 text-white shadow-md shadow-coral-800/20"
                      : "hover:bg-coral-50 text-coral-700"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      onClick={(e) => toggleCollapse(root.id, e)}
                      className={`p-0.5 rounded transition-transform ${isCollapsed ? "" : "rotate-90"} ${isActive ? "text-white" : "text-coral-400 hover:bg-coral-200/50"}`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <FolderPlus
                      className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-coral-200" : "text-coral-400 group-hover:text-coral-800"}`}
                    />
                    <span className="font-bold text-xs whitespace-normal break-words leading-tight">
                      {root.title}
                    </span>
                  </div>

                  {/* Actions */}
                  <div
                    className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all ${isActive ? "opacity-100" : ""}`}
                  >
                    <div className="flex bg-white/10 rounded-lg p-0.5 backdrop-blur-sm">
                      <button
                        disabled={rootIndex === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove("up", root);
                        }}
                        className="p-1 rounded hover:bg-white/20 text-current disabled:opacity-20"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        disabled={rootIndex === rootTopics.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove("down", root);
                        }}
                        className="p-1 rounded hover:bg-white/20 text-current disabled:opacity-20"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => openAddModal("child", root.id)}
                      className="p-1 rounded hover:bg-white/20 text-current"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => startEditing(root, e)}
                      className="p-1 rounded hover:bg-white/20 text-current"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(root.id, root.title, true);
                      }}
                      className={`p-1 rounded transition-colors ${isActive ? "hover:bg-red-500/20" : "hover:bg-red-50 text-red-400 hover:text-red-600"}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-Bab Children */}
                {!isCollapsed && (
                  <div className="ml-4 pl-3 border-l-2 border-coral-100 space-y-0.5 mt-0.5 mb-2">
                    {children.length === 0 ? (
                      <div className="py-1 text-[10px] text-coral-300 font-bold uppercase italic tracking-tighter ml-2">
                        Kosong
                      </div>
                    ) : (
                      children.map((child, childIndex) => {
                        const isChildActive = activeTopicId === child.id;
                        return (
                          <div
                            key={child.id}
                            onClick={() => onSelectTopic(child.id)}
                            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                              isChildActive
                                ? "bg-coral-50 border-l-4 border-coral-800 text-coral-950 font-bold pl-1"
                                : "hover:bg-coral-50/50 text-coral-500 hover:text-coral-800"
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText
                                className={`w-3.5 h-3.5 flex-shrink-0 ${isChildActive ? "text-coral-800" : "text-coral-300"}`}
                              />
                              <span className="text-[11px] whitespace-normal break-words leading-tight">
                                {child.title}
                              </span>
                            </div>

                            {/* Child Actions */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                disabled={childIndex === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMove("up", child);
                                }}
                                className="p-0.5 rounded hover:bg-coral-200 text-coral-500 disabled:opacity-20"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                disabled={childIndex === children.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMove("down", child);
                                }}
                                className="p-0.5 rounded hover:bg-coral-200 text-coral-500 disabled:opacity-20"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => startEditing(child, e)}
                                className="p-0.5 rounded hover:bg-coral-200 text-coral-600"
                              >
                                <Settings className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(child.id, child.title, false);
                                }}
                                className="p-0.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-coral-50/30 border-t border-coral-100 text-[9px] font-bold text-coral-300 uppercase tracking-widest text-center">
        DocaCMS v1.2 • Editor Mode
      </div>

      {/* Modal: Add Topic */}
      {showAddModal && (
        <div className="fixed inset-0 bg-coral-950/40 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-coral-200 scale-100 animate-slide-up">
            <div className="px-6 py-4 bg-coral-50 border-b border-coral-100 flex items-center justify-between">
              <h3 className="font-black text-coral-900 text-xs uppercase tracking-widest">
                {showAddModal === "parent" ? "Buat Bab Utama" : "Buat Sub-Bab"}
              </h3>
              <button
                onClick={() => setShowAddModal(null)}
                className="p-1 rounded-full hover:bg-coral-200 transition-colors text-coral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTopic} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-coral-400 block mb-1.5">
                  Judul Topik
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder={
                    showAddModal === "parent"
                      ? "Contoh: 1. Pendahuluan"
                      : "Contoh: Instalasi Library"
                  }
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full text-xs px-4 py-3 border border-coral-200 rounded-xl focus:ring-4 focus:ring-coral-800/5 focus:border-coral-800 outline-none transition-all font-medium"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(null)}
                  className="flex-1 py-3 border border-coral-200 hover:bg-coral-50 rounded-xl text-xs font-bold text-coral-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-coral-800 hover:bg-coral-900 rounded-xl text-xs font-bold text-white shadow-lg shadow-coral-800/20 transition-all active:scale-95"
                >
                  Buat Artikel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Topic */}
      {editingTopic && (
        <div className="fixed inset-0 bg-coral-950/40 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-coral-200 animate-slide-up">
            <div className="px-6 py-4 bg-coral-50 border-b border-coral-100 flex items-center justify-between">
              <h3 className="font-black text-coral-900 text-xs uppercase tracking-widest">
                Pengaturan Artikel
              </h3>
              <button
                onClick={() => setEditingTopic(null)}
                className="p-1 rounded-full hover:bg-coral-200 text-coral-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveTopicEdit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-coral-400 block mb-1.5">
                  Judul Artikel
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs px-4 py-3 border border-coral-200 rounded-xl focus:ring-4 focus:ring-coral-800/5 focus:border-coral-800 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-coral-400 block mb-1.5">
                  Slug / URL Path
                </label>
                <input
                  type="text"
                  required
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full text-[10px] px-4 py-3 border border-coral-200 rounded-xl font-mono bg-coral-50/50 text-coral-900 outline-none focus:border-coral-400 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-coral-400 block mb-1.5">
                  Relasi Induk
                </label>
                <select
                  value={editParentId || "root"}
                  onChange={(e) => setEditParentId(e.target.value)}
                  className="w-full text-xs px-4 py-3 border border-coral-200 rounded-xl focus:ring-4 focus:ring-coral-800/5 outline-none bg-white font-medium"
                >
                  <option value="root">-- Bab Utama --</option>
                  {topics
                    .filter((t) => t.parent_id === null && t.id !== editingTopic.id)
                    .map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="flex-1 py-3 border border-coral-200 hover:bg-coral-50 rounded-xl text-xs font-bold text-coral-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-coral-800 hover:bg-coral-900 rounded-xl text-xs font-bold text-white shadow-lg shadow-coral-800/20 transition-all active:scale-95"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirmState.isOpen}
        title="Hapus Topik"
        message={deleteConfirmState.message}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmState({ isOpen: false, topicId: null, message: "" })}
      />
    </nav>
  );
}
