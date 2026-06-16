import React, { useState, useEffect, useLayoutEffect, useMemo } from "react";
import {
  Menu,
  BookOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  Type,
  ZoomIn,
  ZoomOut,
  Hash,
  ArrowLeftRight,
  X,
  Search,
} from "lucide-react";
import DOMPurify from "dompurify";
import { Documentation, Topic } from "../types";
import SidebarRight from "./SidebarRight";

interface PublicViewProps {
  documentations: Documentation[];
  activeDoc: Documentation | undefined;
  topics: Topic[];
  activeTopicId: string | null;
  onSelectTopic: (id: string) => void;
  onSelectDoc: (id: string) => void;
  onBackToEditor: () => void;
  isAuthenticated?: boolean;
}

type FontType = "sans" | "serif" | "mono";
type FontSize = "sm" | "base" | "lg" | "xl";

export default function PublicView({
  documentations,
  activeDoc,
  topics,
  activeTopicId,
  onSelectTopic,
  onSelectDoc,
  onBackToEditor,
  isAuthenticated: _isAuthenticated,
}: PublicViewProps) {
  const [collapsedParents, setCollapsedParents] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // High-fidelity reading settings
  const [fontType, setFontType] = useState<FontType>("sans");
  const [fontSize, setFontSize] = useState<FontSize>("base");
  const [showTypographyControls, setShowTypographyControls] = useState(false);

  // Search Logic: Filter topics by title or content
  const searchResults = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    return topics
      .filter(
        (topic) =>
          topic.title.toLowerCase().includes(term) ||
          (topic.content || "").toLowerCase().includes(term)
      )
      .slice(0, 8); // Limit to 8 results for the dropdown
  }, [searchTerm, topics]);

  // Auto select first topic if no active topic is chosen
  useEffect(() => {
    if (!activeTopicId && topics.length > 0) {
      const sorted = [...topics].sort((a, b) => a.sort_order - b.sort_order);
      const first = sorted.find((t) => t.parent_id === null) || sorted[0];
      if (first) {
        onSelectTopic(first.id);
      }
    }
  }, [activeTopicId, topics, onSelectTopic]);

  // Reset scroll position of reading canvas to top when topic changes without flickering
  useLayoutEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
    window.scrollTo({ top: 0 });
  }, [activeTopicId]);

  const rootTopics = topics
    .filter((t) => t.parent_id === null)
    .sort((a, b) => a.sort_order - b.sort_order);

  const getChildren = (parentId: string) => {
    return topics
      .filter((t) => t.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  const toggleCollapse = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeTopic = topics.find((t) => t.id === activeTopicId);

  const fontClass = {
    sans: "",
    serif: "font-serif font-light",
    mono: "font-mono text-sm",
  }[fontType];

  const sizeClass = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg md:text-xl",
    xl: "text-xl md:text-2xl",
  }[fontSize];

  return (
    <div className="min-h-screen bg-white flex flex-col" id="public-view-container">
      {/* TOP NAVBAR (Project Switcher & Search) */}
      <nav className="bg-coral-900 text-white border-b border-coral-800 sticky top-0 z-50 px-4 py-0 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Project Picker */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 pr-4 border-r border-coral-700/50 flex-shrink-0">
              <BookOpen className="w-5 h-5 text-coral-200" />
              <span className="font-black text-sm tracking-tighter text-white uppercase">
                myinfo.my.id
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              {documentations.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    doc.id === activeDoc?.id
                      ? "bg-white text-coral-900 shadow-sm"
                      : "text-coral-100 hover:text-white hover:bg-coral-800"
                  }`}
                >
                  {doc.title}
                </button>
              ))}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileDocsOpen(!mobileDocsOpen)}
                className="flex items-center gap-2 bg-coral-800 px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-coral-700"
              >
                <span className="truncate max-w-[100px]">{activeDoc?.title || "Proyek"}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${mobileDocsOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Search Box & Controls */}
          <div className="flex items-center gap-3">
            {/* Global Search Input */}
            <div className="relative hidden sm:block">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-coral-300 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Cari informasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="bg-coral-800/50 hover:bg-coral-800 border border-coral-700/50 focus:bg-white focus:text-coral-900 focus:w-64 w-40 text-xs font-medium py-2 pl-9 pr-4 rounded-xl transition-all outline-none placeholder:text-coral-300/80"
                />
              </div>

              {/* Search Results Dropdown */}
              {isSearchFocused && searchTerm.length >= 2 && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-coral-200 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-slide-up">
                  <div className="p-3 border-b border-coral-50 bg-coral-50/50">
                    <p className="text-[10px] font-black text-coral-400 uppercase tracking-widest">
                      Hasil Pencarian
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => onSelectTopic(result.id)}
                          className="w-full text-left p-3 rounded-xl hover:bg-coral-50 transition-colors flex items-start gap-3 group"
                        >
                          <div className="p-2 bg-coral-100 rounded-lg group-hover:bg-white transition-colors">
                            <FileText className="w-4 h-4 text-coral-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-coral-900 leading-tight mb-0.5">
                              {result.title}
                            </p>
                            <p className="text-[10px] text-coral-400 truncate">
                              Sesuai kata kunci: "{searchTerm}"
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-xs font-bold text-coral-300">
                          Tidak ada hasil ditemukan
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onBackToEditor}
              className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-coral-100 hover:bg-white text-coral-900 px-3 py-1.5 rounded-md transition-all shadow-sm"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white hover:bg-coral-800 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Document Picker Overlay */}
        {mobileDocsOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-coral-900 border-t border-coral-800 shadow-2xl py-2 animate-slide-down">
            {documentations.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  onSelectDoc(doc.id);
                  setMobileDocsOpen(false);
                }}
                className={`w-full text-left px-6 py-3.5 text-xs font-bold transition-all ${
                  doc.id === activeDoc?.id
                    ? "text-white bg-coral-800 border-l-4 border-white"
                    : "text-coral-100 hover:text-white hover:bg-coral-800"
                }`}
              >
                {doc.title}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main Grid Wrapper */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row relative">
        {/* LEFT SIDEBAR: Directory tree */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 bg-coral-50 border-r border-coral-200 z-40 w-64 lg:w-64 p-5 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:transform-none
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          id="public-sidebar-left"
          aria-label="Daftar Isi Dokumentasi"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[10px] font-black text-coral-400 uppercase tracking-[0.2em] mb-1">
                Daftar Isi
              </h2>
              <p className="text-xs font-bold text-coral-900 leading-tight">{activeDoc?.title}</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-coral-400 hover:bg-coral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar specifically for Mobile sidebar */}
          <div className="relative mb-6 lg:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-coral-400" />
            <input
              type="text"
              placeholder="Cari dalam bab..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-coral-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium outline-none focus:border-coral-400 transition-all"
            />

            {searchTerm.length >= 2 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-coral-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      onSelectTopic(result.id);
                      setSearchTerm("");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-coral-50 text-xs font-bold text-coral-800 truncate"
                  >
                    {result.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pb-4 mb-4 border-b border-coral-200">
            <p className="text-[11px] text-coral-500 leading-relaxed italic">
              {activeDoc?.description || "CMS Dokumentasi Mandiri"}
            </p>
          </div>

          <nav className="space-y-1.5" id="public-toc-navigation">
            {rootTopics.map((root) => {
              const children = getChildren(root.id);
              const isCollapsed = collapsedParents[root.id] || false;
              const isActive = activeTopicId === root.id;

              return (
                <div key={root.id} className="space-y-1">
                  <div
                    onClick={() => {
                      onSelectTopic(root.id);
                      setMobileMenuOpen(false);
                      if (collapsedParents[root.id]) {
                        setCollapsedParents((prev) => ({ ...prev, [root.id]: false }));
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? "bg-coral-800 text-coral-50 font-semibold shadow-sm"
                        : "text-coral-700 hover:bg-coral-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={(e) => toggleCollapse(root.id, e)}
                        className="p-0.5 rounded text-coral-400 hover:text-coral-600 focus:outline-none"
                      >
                        {isCollapsed ? (
                          <ChevronRight
                            className={`w-3.5 h-3.5 ${isActive ? "text-coral-200" : ""}`}
                          />
                        ) : (
                          <ChevronDown
                            className={`w-3.5 h-3.5 ${isActive ? "text-coral-200" : ""}`}
                          />
                        )}
                      </button>
                      <span className="text-xs font-semibold whitespace-normal break-words leading-tight">
                        {root.title}
                      </span>
                    </div>
                  </div>

                  {!isCollapsed && children.length > 0 && (
                    <div className="pl-4 ml-3 border-l border-coral-200 space-y-1 pt-0.5">
                      {children.map((child) => {
                        const isChildActive = activeTopicId === child.id;
                        return (
                          <button
                            key={child.id}
                            onClick={() => {
                              onSelectTopic(child.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-1.5 px-3 py-1.5 rounded-md text-left transition-colors ${
                              isChildActive
                                ? "bg-coral-50 text-coral-950 font-semibold text-xs border-l-2 border-coral-800 ml-[-5px] pl-[13px]"
                                : "text-coral-600 hover:bg-coral-100 text-xs"
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 flex-shrink-0 text-coral-400" />
                            <span className="whitespace-normal break-words leading-tight">
                              {child.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-coral-950/40 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* CENTER COLUMN: Document Reading canvas */}
        <main className="flex-1 px-6 md:px-12 py-8 overflow-y-auto" id="main-content">
          {activeTopic ? (
            <div className="max-w-3xl mx-auto">
              {/* Reading Tool Controls */}
              <div className="flex items-center justify-between pb-4 mb-8 border-b border-coral-100 gap-4">
                <div className="text-[10px] font-black text-coral-400 font-mono flex items-center gap-1.5 uppercase tracking-widest">
                  <Hash className="w-3 h-3" />
                  <span>{activeDoc?.title}</span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowTypographyControls(!showTypographyControls)}
                    className="p-1 px-2.5 rounded-lg border border-coral-200 hover:bg-coral-50 text-[10px] text-coral-700 font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
                  >
                    <Type className="w-3.5 h-3.5 text-coral-400" />
                    <span>Ukuran Huruf</span>
                  </button>

                  {showTypographyControls && (
                    <div className="absolute right-0 mt-2 p-3 w-48 bg-white border border-coral-200 rounded-xl shadow-lg z-30 space-y-3 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-coral-400 mb-1.5">
                          Jenis Font
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => setFontType("sans")}
                            className={`p-1 rounded text-center ${fontType === "sans" ? "bg-coral-800 text-coral-50" : "bg-coral-100"}`}
                          >
                            Sans
                          </button>
                          <button
                            onClick={() => setFontType("serif")}
                            className={`p-1 rounded text-center ${fontType === "serif" ? "bg-coral-800 text-coral-50 font-serif" : "bg-coral-100 font-serif"}`}
                          >
                            Serif
                          </button>
                          <button
                            onClick={() => setFontType("mono")}
                            className={`p-1 rounded text-center ${fontType === "mono" ? "bg-coral-800 text-coral-50 font-mono" : "bg-coral-100 font-mono"}`}
                          >
                            Mono
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-coral-400 mb-1.5">
                          Ukuran Teks
                        </p>
                        <div className="flex items-center justify-between border border-coral-300 rounded-lg p-1 bg-coral-100">
                          <button
                            onClick={() => setFontSize("sm")}
                            className="p-1 hover:bg-coral-200 rounded"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold">{fontSize.toUpperCase()}</span>
                          <button
                            onClick={() => {
                              if (fontSize === "sm") setFontSize("base");
                              else if (fontSize === "base") setFontSize("lg");
                              else setFontSize("xl");
                            }}
                            className="p-1 hover:bg-coral-200 rounded"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <article
                className={`prose max-w-none hover:prose-headings:text-coral-700 ${fontClass} ${sizeClass}`}
                id="public-reading-article"
              >
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-coral-900 mb-2 leading-tight border-b border-coral-200/80 pb-4">
                  {activeTopic.title}
                </h1>
                <div
                  className="mt-6 leading-relaxed text-coral-900 space-y-4 prose prose-coral"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(activeTopic.content || "", {
                      ADD_TAGS: ["iframe"],
                      ADD_ATTR: [
                        "allow",
                        "allowfullscreen",
                        "frameborder",
                        "target",
                        "contenteditable",
                        "style",
                      ],
                    }),
                  }}
                  style={{ fontFamily: fontType === "serif" ? "Georgia, serif" : undefined }}
                />
              </article>

              <div className="mt-12 pt-6 border-t border-coral-200 flex items-center justify-between gap-4">
                <div className="text-[10px] font-bold text-coral-400 uppercase tracking-widest">
                  Updated: {new Date(activeTopic.created_at).toLocaleDateString("id-ID")}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="w-12 h-12 text-coral-200 mb-4" />
              <h3 className="font-bold text-coral-700 text-base">
                Pilih artikel untuk mulai membaca
              </h3>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR: In-page navigation */}
        <aside
          className="hidden xl:block w-52 p-5 border-l border-coral-200 self-start sticky top-20"
          id="public-sidebar-right"
        >
          <SidebarRight content={activeTopic?.content || ""} />
        </aside>
      </div>
    </div>
  );
}
