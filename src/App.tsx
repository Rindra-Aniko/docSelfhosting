import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, FolderPlus, BookOpen, Database } from "lucide-react";
import { AppMode } from "./types";
import Header from "./components/Header";
import SidebarLeft from "./components/SidebarLeft";
import SidebarRight from "./components/SidebarRight";
import RichTextEditor from "./components/RichTextEditor";
import PublicView from "./components/PublicView";
import AdminProfileModal from "./components/AdminProfileModal";
import LoginModal from "./components/LoginModal";
import { useAuth } from "./hooks/useAuth";
import { useDocumentations } from "./hooks/useDocumentations";
import { useTopics } from "./hooks/useTopics";

export default function App() {
  const {
    token,
    user,
    setUser,
    showLoginModal,
    setShowLoginModal,
    showProfileModal,
    setShowProfileModal,
    handleLogin,
    handleLogout,
    authHeaders,
  } = useAuth();

  const {
    documentations,
    activeDocId,
    setActiveDocId,
    loading,
    setLoading,
    setErrorMsg,
    handleCreateDoc,
    handleUpdateDoc,
    handleDeleteDoc,
  } = useDocumentations(token, authHeaders);

  const handleTopicsError = useCallback((msg: string) => {
    setErrorMsg(msg);
  }, [setErrorMsg]);

  const {
    topics,
    activeTopicId,
    setActiveTopicId,
    handleAddTopic,
    handleUpdateTopic,
    handleSaveTopicContent,
    handleDeleteTopic,
    handleReorderTopics,
  } = useTopics(activeDocId, token, authHeaders, handleTopicsError);


  const activeDoc = documentations.find((d) => d.id === activeDocId);
  const activeTopic = topics.find((t) => t.id === activeTopicId);

  const [mode, setMode] = useState<AppMode>("public");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync mode state with authentication
  useEffect(() => {
    if (token) {
      setMode("editor");
    } else {
      setMode("public");
    }
  }, [token]);

  // --- URL Hash Routing (flicker-free) ---
  const isInternalHashUpdate = useRef(false);

  // Parse hash on mount and on browser back/forward navigation
  const handleHashChange = useCallback(() => {
    if (isInternalHashUpdate.current) {
      // It was our own programmatic change, just clear the flag and ignore
      isInternalHashUpdate.current = false;
      return;
    }
    const hash = window.location.hash;
    if (hash.startsWith("#/doc/")) {
      const parts = hash.substring(6).split("/topic/");
      const docId = parts[0];
      const topicId = parts[1] || null;

      if (docId && docId !== activeDocId) {
        setActiveDocId(docId);
      }
      if (topicId !== activeTopicId) {
        setActiveTopicId(topicId);
      }
    }
  }, [activeDocId, activeTopicId, setActiveDocId, setActiveTopicId]);

  useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // parse on initial mount
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [handleHashChange]);

  // Silently update hash when state changes (no hashchange event triggered)
  useEffect(() => {
    if (activeDocId) {
      const targetHash = activeTopicId
        ? `#/doc/${activeDocId}/topic/${activeTopicId}`
        : `#/doc/${activeDocId}`;
      if (window.location.hash !== targetHash) {
        // Set flag before changing hash so the listener ignores it
        isInternalHashUpdate.current = true;
        history.replaceState(null, "", targetHash);
      }
    }
  }, [activeDocId, activeTopicId]);

  // Dynamic Document Title based on active document and topic
  useEffect(() => {
    let title = "myinfo.my.id - Documentation System";
    if (activeDoc) {
      if (activeTopic) {
        title = `${activeTopic.title} | ${activeDoc.title} - DocaCMS`;
      } else {
        title = `${activeDoc.title} - DocaCMS`;
      }
    }
    document.title = title;
  }, [activeDoc, activeTopic]);

  // Turn off loading once topics have loaded for the active doc, or if there are no docs
  useEffect(() => {
    if (documentations.length === 0 && !loading) {
      return;
    }
    if (activeDocId && topics.length >= 0) {
      setLoading(false);
    }
  }, [activeDocId, topics, documentations, loading, setLoading]);

  const handleSelectDoc = (id: string) => {
    setActiveDocId(id);
    setActiveTopicId(null);
  };

  const handleDeleteDocWithCallback = async (id: string) => {
    await handleDeleteDoc(id, () => {
      setActiveTopicId(null);
    });
  };

  // Compute stats for welcome panel
  const totalParents = topics.filter((t) => t.parent_id === null).length;
  const totalChildren = topics.filter((t) => t.parent_id !== null).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-coral-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border border-coral-200 shadow-md rounded-2xl p-8 max-w-sm w-full space-y-4 animate-pulse">
          <BookOpen className="w-10 h-10 text-coral-800 mx-auto animate-spin" />
          <h2 className="text-sm font-bold text-coral-900">Menghubungkan Database Turso/JSON...</h2>
          <p className="text-xs text-coral-400">
            Harap tunggu sementara aset CMS disiapkan secara lokal.
          </p>
        </div>
      </div>
    );
  }

  // Switch layouts instantly for public reader
  if (mode === "public") {
    return (
      <>
        <PublicView
          documentations={documentations}
          activeDoc={activeDoc}
          topics={topics}
          activeTopicId={activeTopicId}
          onSelectTopic={setActiveTopicId}
          onSelectDoc={handleSelectDoc}
          onBackToEditor={() => {
            if (token) setMode("editor");
            else setShowLoginModal(true);
          }}
          isAuthenticated={!!token}
        />
        {/* LOGIN MODAL */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-coral-50 flex flex-col" id="cms-main-root">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-coral-800 focus:text-white focus:text-xs focus:font-bold focus:rounded-xl focus:shadow-lg focus:outline-none"
      >
        Lompati ke Konten Utama
      </a>

      {/* Universal Head Navigation bar */}
      <Header
        documentations={documentations}
        activeDocId={activeDocId}
        onSelectDoc={handleSelectDoc}
        onCreateDoc={handleCreateDoc}
        onUpdateDoc={handleUpdateDoc}
        onDeleteDoc={handleDeleteDocWithCallback}
        mode={mode}
        onToggleMode={setMode}
        user={user}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main CMS Layout Grid */}
      <div
        className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6"
        id="cms-body-grid"
      >
        {/* LEFT COLUMN: Sidebar directory hierarchy */}
        <div
          className={`
          lg:col-span-3 h-[calc(100vh-140px)] sticky top-[76px] z-30
          fixed lg:static inset-y-0 left-0 w-64 lg:w-auto bg-coral-50 lg:bg-transparent transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          p-4 lg:p-0 border-r lg:border-none border-coral-200 shadow-xl lg:shadow-none
        `}
          id="grid-col-left"
        >
          {activeDocId ? (
            <SidebarLeft
              documentationId={activeDocId}
              topics={topics}
              activeTopicId={activeTopicId}
              onSelectTopic={(id) => {
                setActiveTopicId(id);
                setSidebarOpen(false); // Close on mobile selection
              }}
              onAddTopic={handleAddTopic}
              onUpdateTopic={handleUpdateTopic}
              onDeleteTopic={handleDeleteTopic}
              onReorderTopics={handleReorderTopics}
            />
          ) : (
            <div className="bg-white border border-coral-200 rounded-xl p-4 text-center text-xs text-coral-400">
              Silakan buat baru atau pilih proyek dokumentasi dari dropdown di atas.
            </div>
          )}
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-coral-950/20 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* CENTER COLUMN: Central article Editor workspace */}
        <div className="lg:col-span-7 flex flex-col gap-6" id="main-content">
          {activeTopicId && activeTopic ? (
            <div className="space-y-4" id="cms-editor-viewport">
              {/* Context Tracker */}
              <div className="bg-white p-4 py-3 border border-coral-200 rounded-xl flex items-center justify-between shadow-sm">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-coral-800 block tracking-wider uppercase font-mono">
                    Topik Terbuka
                  </span>
                  <h2 className="text-sm font-extrabold text-coral-900 whitespace-normal break-words leading-tight mt-0.5">
                    {activeTopic.title}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-coral-400 ml-4 flex-shrink-0">
                  <span>URL Path:</span>
                  <span className="bg-coral-100 text-coral-600 p-1 px-2 rounded lowercase break-all">
                    /{activeTopic.slug}
                  </span>
                </div>
              </div>

              {/* Editor Workspace Component */}
              <RichTextEditor activeTopic={activeTopic} onSave={handleSaveTopicContent} />
            </div>
          ) : (
            /* TELEMETRY CMS DASHBOARD PANEL */
            <div
              className="bg-white border border-coral-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6"
              id="cms-empty-dashboard"
            >
              <div className="border-b border-coral-100 pb-4">
                <h3 className="text-lg font-extrabold text-coral-900">
                  Dashboard CMS: {activeDoc ? activeDoc.title : "Tidak Ada Proyek Aktif"}
                </h3>
                <p className="text-xs text-coral-500 mt-1">
                  {activeDoc?.description ||
                    "Gunakan dropdown proyek di atas untuk mengawali pengetikan panduan teknis."}
                </p>
              </div>

              {activeDocId ? (
                <>
                  {/* Real stats row */}
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                    id="cms-dashboard-telemetry"
                  >
                    <div className="p-4 bg-coral-50 rounded-xl border border-coral-200/60">
                      <span className="text-2xl font-black text-coral-900 block">
                        {totalParents}
                      </span>
                      <span className="text-[11px] font-bold text-coral-400 uppercase tracking-wider block mt-1">
                        Total Bab Utama
                      </span>
                    </div>
                    <div className="p-4 bg-coral-50 rounded-xl border border-coral-200/60">
                      <span className="text-2xl font-black text-coral-900 block">
                        {totalChildren}
                      </span>
                      <span className="text-[11px] font-bold text-coral-400 uppercase tracking-wider block mt-1">
                        Total Sub-Bab
                      </span>
                    </div>
                    <div className="p-4 bg-coral-50 rounded-xl border border-coral-100 col-span-2 md:col-span-1">
                      <span className="text-xs font-bold text-coral-800 flex items-center gap-1">
                        <Database className="w-4 h-4 text-coral-800" />
                        Turso SQLite
                      </span>
                      <span className="text-[10px] text-coral-600 block leading-tight mt-1.5 font-medium">
                        Offline-Ready File System Sync
                      </span>
                    </div>
                  </div>

                  {/* Actions guide or documentation tips */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-coral-500">
                      Mulai Mengisi Dokumen
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 border border-coral-200 hover:border-coral-400 rounded-lg space-y-1 bg-white shadow-sm">
                        <h5 className="text-xs font-bold text-coral-800 flex items-center gap-1.5">
                          <FolderPlus className="w-4 h-4 text-coral-800" />
                          Buat Bab Utama Baru
                        </h5>
                        <p className="text-[11px] text-coral-400">
                          Gunakan tombol 'Bab Baru' di sidebar kiri tingkat root.
                        </p>
                      </div>

                      <div className="p-4 border border-coral-200 hover:border-coral-400 rounded-lg space-y-1 bg-white shadow-sm">
                        <h5 className="text-xs font-bold text-coral-800 flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-coral-800" />
                          Sisipkan Sub-Bab Pembahasan
                        </h5>
                        <p className="text-[11px] text-coral-400">
                          Dekati baris bab utama di sidebar dan klik plus (+).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* API Output Hooks */}
                  <div className="p-4 bg-coral-900 rounded-xl text-coral-300 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-coral-800 pb-2">
                      <span className="text-coral-400 text-[10px] font-bold uppercase">
                        Rest API Endpoints (Self-Hosted Output)
                      </span>
                      <span className="text-coral-400 text-[10px] bg-coral-900/30 px-1.5 py-0.5 rounded uppercase">
                        Connected
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <p className="flex items-center gap-2">
                        <span className="text-coral-400 font-bold">GET</span>
                        <span>/api/documentations</span>
                        <span className="text-coral-500 text-[10px]">— Semua proyek dok</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-coral-400 font-bold">GET</span>
                        <span>/api/documentations/{activeDocId}/topics</span>
                        <span className="text-coral-400 text-[10px]">— Seluruh bab & sub-bab</span>
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <BookOpen className="w-12 h-12 text-coral-300 mx-auto" />
                  <h4 className="font-bold text-coral-800 text-sm">Mari Memulai!</h4>
                  <p className="text-xs text-coral-400 max-w-sm mx-auto">
                    Kelihatannya database Anda belum memiliki proyek dokumentasi. Klik tombol
                    tambahkan proyek di panel dropdown atas untuk memulai.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Real-time heading outlines (In-Page Navigator) */}
        <div className="lg:col-span-2 h-[calc(100vh-140px)] sticky top-[76px]" id="grid-col-right">
          <div className="bg-white/70 backdrop-blur-md border border-coral-200 rounded-xl p-4 shadow-sm h-full overflow-y-auto">
            <SidebarRight content={activeTopic?.content || ""} />
          </div>
        </div>
      </div>

      <AdminProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdateUser={(updatedUser) => setUser(updatedUser)}
        token={token}
      />
    </div>
  );
}
