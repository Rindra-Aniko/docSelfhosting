import React, { useState, useEffect, useRef, useCallback } from "react";
import DOMPurify from "dompurify";
import { Topic } from "../types";
import EditorToolbar from "./editor/EditorToolbar";
import TableToolbar from "./editor/TableToolbar";
import TableDialog from "./editor/TableDialog";
import { useAutoSave } from "./editor/useAutoSave";
import { useTableEditor } from "./editor/useTableEditor";
import { InputDialog } from "./InputDialog";

interface RichTextEditorProps {
  activeTopic: Topic;
  onSave: (updatedContent: string) => void;
}

export default function RichTextEditor({ activeTopic, onSave }: RichTextEditorProps) {
  const [isSourceMode, setIsSourceMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const [promptState, setPromptState] = useState<{
    isOpen: boolean;
    title: string;
    defaultValue: string;
    resolve: ((value: string | null) => void) | null;
  }>({
    isOpen: false,
    title: "",
    defaultValue: "",
    resolve: null,
  });

  const triggerPrompt = useCallback((title: string, defaultValue = ""): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptState({
        isOpen: true,
        title,
        defaultValue,
        resolve,
      });
    });
  }, []);

  const handlePromptSubmit = useCallback(
    (value: string) => {
      if (promptState.resolve) promptState.resolve(value);
      setPromptState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    },
    [promptState]
  );

  const handlePromptCancel = useCallback(() => {
    if (promptState.resolve) promptState.resolve(null);
    setPromptState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [promptState]);

  // Hook 1: Auto-Save management
  const { saveStatus, sourceCode, setSourceCode, triggerAutoSave, manualSave } = useAutoSave(
    activeTopic,
    onSave,
    isSourceMode,
    editorRef
  );

  // Format executable command helper
  const execCommand = useCallback(
    (command: string, value: string = "") => {
      if (isSourceMode) return;
      document.execCommand(command, false, value);

      // Trigger auto-save on change
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        triggerAutoSave(html);
        editorRef.current.focus();
      }
    },
    [isSourceMode, triggerAutoSave]
  );

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      triggerAutoSave(html);
    }
  }, [triggerAutoSave]);

  // Hook 2: Table Editor management
  const {
    showTableDialog,
    setShowTableDialog,
    gridHoverRow,
    setGridHoverRow,
    gridHoverCol,
    setGridHoverCol,
    manualRows,
    setManualRows,
    manualCols,
    setManualCols,
    showTableToolbar,
    setShowTableToolbar,
    toolbarPos,
    activeCell,
    setActiveCell,
    showCellColorPicker,
    setShowCellColorPicker,
    cellColor,
    colWidthInput,
    setColWidthInput,
    rowHeightInput,
    setRowHeightInput,
    openTableDialog,
    insertTableWithSize,
    addRow,
    addCol,
    deleteRow,
    deleteCol,
    setCellBgColor,
    applyColumnWidth,
    applyRowHeight,
  } = useTableEditor(editorRef, isSourceMode, execCommand, handleEditorInput);

  // Sync content when topic changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = DOMPurify.sanitize(activeTopic.content || "", {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target", "contenteditable", "style"],
      });
    }
    setIsSourceMode(false);
    setShowTableToolbar(false);
    setShowTableDialog(false);
    setActiveCell(null);

    // Reset scroll position of editor canvas to top when topic changes
    const editorBody = document.getElementById("editor-body");
    if (editorBody) {
      editorBody.scrollTop = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopic.id]);

  // Handle changes in Raw HTML Source mode
  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSourceCode(val);
    triggerAutoSave(val);
  };

  // Toggle visual vs code source mode
  const toggleSourceMode = () => {
    if (isSourceMode) {
      setIsSourceMode(false);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = DOMPurify.sanitize(sourceCode, {
            ADD_TAGS: ["iframe"],
            ADD_ATTR: [
              "allow",
              "allowfullscreen",
              "frameborder",
              "target",
              "contenteditable",
              "style",
            ],
          });
          editorRef.current.focus();
        }
      }, 50);
    } else {
      if (editorRef.current) {
        setSourceCode(editorRef.current.innerHTML);
      }
      setIsSourceMode(true);
    }
    setShowTableToolbar(false);
    setActiveCell(null);
    setShowCellColorPicker(false);
  };

  // Element Injection Helpers
  const insertCallout = (type: "info" | "warning" | "success") => {
    if (isSourceMode) return;
    let calloutHtml = "";
    if (type === "info") {
      calloutHtml = `<div class="my-4 p-4 rounded-lg bg-coral-50 text-coral-900 border-l-4 border-coral-400 font-sans" contenteditable="true"><strong>💡 Info:</strong> Ketik informasi...</div><p>&nbsp;</p>`;
    } else if (type === "warning") {
      calloutHtml = `<div class="my-4 p-4 rounded-lg bg-amber-50 text-amber-900 border-l-4 border-amber-500 font-sans" contenteditable="true"><strong>⚠️ Perhatian:</strong> Ketik peringatan...</div><p>&nbsp;</p>`;
    } else {
      calloutHtml = `<div class="my-4 p-4 rounded-lg bg-coral-50 text-coral-950 border-l-4 border-coral-500 font-sans" contenteditable="true"><strong>✅ Sukses:</strong> Langkah berhasil...</div><p>&nbsp;</p>`;
    }
    execCommand("insertHTML", calloutHtml);
  };

  const insertCodeBlock = () => {
    if (isSourceMode) return;
    const codeHtml = `<pre class="bg-coral-900 text-coral-100 p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm leading-relaxed" contenteditable="true"><code>// Tulis kode di sini...</code></pre><p>&nbsp;</p>`;
    execCommand("insertHTML", codeHtml);
  };

  const insertImage = async () => {
    if (isSourceMode) return;
    const url = await triggerPrompt("Masukkan URL Gambar:");
    if (!url) return;
    const width = await triggerPrompt("Masukkan Lebar Gambar (contoh: 100%, 50%, 300px):", "100%");
    if (width === null) return;
    const imgHtml = `<div class="flex flex-col items-center my-4"><img src="${url}" alt="Gambar" style="width: ${width || "100%"};" class="h-auto rounded-lg shadow-sm border border-coral-200 cursor-pointer" /></div><p>&nbsp;</p>`;
    execCommand("insertHTML", imgHtml);
  };

  const insertLink = async () => {
    if (isSourceMode) return;
    const url = await triggerPrompt("Masukkan URL Link (contoh: https://google.com):", "https://");
    if (url && url !== "https://") {
      const selection = window.getSelection()?.toString();
      if (!selection) {
        const text = await triggerPrompt("Masukkan Teks Tautan:", url);
        if (text === null) return;
        const linkHtml = `<a href="${url}" target="_blank" class="text-coral-800 font-bold hover:underline">${text || url}</a>`;
        execCommand("insertHTML", linkHtml);
      } else {
        execCommand("createLink", url);
      }
    }
  };

  const insertVideo = async () => {
    if (isSourceMode) return;
    const url = await triggerPrompt(
      "Masukkan URL Video (Link file .mp4, link YouTube/Vimeo, atau kode embed <iframe>):",
      "https://"
    );
    if (!url) return;
    const trimmed = url.trim();
    if (trimmed === "" || trimmed === "https://") return;

    const width = await triggerPrompt(
      "Masukkan Lebar Tampilan Video (contoh: 100%, 70%, 500px):",
      "100%"
    );
    if (width === null) return;

    let contentHtml = "";

    if (trimmed.startsWith("<iframe")) {
      const srcMatch = trimmed.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        contentHtml = `<iframe src="${srcMatch[1]}" frameborder="0" allowfullscreen class="absolute inset-0 w-full h-full"></iframe>`;
      } else {
        contentHtml = trimmed.replace("<iframe", '<iframe class="absolute inset-0 w-full h-full"');
      }
    } else {
      const isArchiveOrg = trimmed.includes("archive.org");
      const isRawVideo = !isArchiveOrg && /\.(mp4|webm|ogg|mov|mkv)(\?.*)?$/i.test(trimmed);

      if (isRawVideo) {
        contentHtml = `<video controls class="w-full h-full object-cover"><source src="${trimmed}" type="video/mp4"></video>`;
      } else if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
        let videoId = "";
        if (trimmed.includes("v=")) {
          videoId = trimmed.split("v=")[1].split("&")[0];
        } else if (trimmed.includes("youtu.be/")) {
          videoId = trimmed.split("youtu.be/")[1].split("?")[0];
        }
        if (videoId) {
          contentHtml = `<iframe src="https://www.youtube.com/embed/${videoId}" title="Video" frameborder="0" allowfullscreen class="absolute inset-0 w-full h-full"></iframe>`;
        }
      } else if (trimmed.includes("vimeo.com")) {
        const matches = trimmed.match(/vimeo\.com\/(\d+)/);
        if (matches && matches[1]) {
          contentHtml = `<iframe src="https://player.vimeo.com/video/${matches[1]}" title="Vimeo Video" frameborder="0" allowfullscreen class="absolute inset-0 w-full h-full"></iframe>`;
        } else {
          contentHtml = `<iframe src="${trimmed}" title="Video" frameborder="0" allowfullscreen class="absolute inset-0 w-full h-full"></iframe>`;
        }
      } else {
        let embedUrl = trimmed;
        if (embedUrl.includes("drive.google.com") && embedUrl.includes("/view")) {
          embedUrl = embedUrl.replace("/view", "/preview");
        }
        if (
          embedUrl.includes("archive.org/details/") ||
          embedUrl.includes("archive.org/download/")
        ) {
          embedUrl = embedUrl.replace(
            /archive\.org\/(details|download)\/([^/]+).*/,
            "archive.org/embed/$2"
          );
        }
        contentHtml = `<iframe src="${embedUrl}" title="Video" frameborder="0" allowfullscreen class="absolute inset-0 w-full h-full"></iframe>`;
      }
    }

    if (contentHtml) {
      const videoHtml = `
        <div class="doca-video-container" style="width: ${width || "100%"};">
          <div class="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-coral-200">
            ${contentHtml}
            <div class="doca-video-resizer-overlay">
              <div class="doca-video-resizer-text">Atur Ukuran Video</div>
            </div>
          </div>
        </div>
        <p>&nbsp;</p>
      `;
      execCommand("insertHTML", videoHtml);
    }
  };

  const insertAudio = async () => {
    if (isSourceMode) return;
    const url = await triggerPrompt(
      "Masukkan URL Audio (Link file .mp3, link audio.com, link NotebookLM, atau kode embed <iframe>):",
      "https://"
    );
    if (!url) return;
    const trimmed = url.trim();
    if (trimmed === "" || trimmed === "https://") return;

    let contentHtml = "";

    if (trimmed.startsWith("<iframe")) {
      contentHtml = `
        <div class="doca-embed-container my-4 max-w-xl mx-auto rounded-xl overflow-hidden border border-coral-200 shadow-sm" contenteditable="false">
          ${trimmed}
        </div>
        <p>&nbsp;</p>
      `;
    } else {
      const isArchiveOrg = trimmed.includes("archive.org");
      const isRawAudio = !isArchiveOrg && /\.(mp3|wav|ogg|m4a|flac|aac)(\?.*)?$/i.test(trimmed);

      if (isRawAudio) {
        let mimeType = "audio/mpeg";
        if (trimmed.endsWith(".m4a")) {
          mimeType = "audio/mp4";
        } else if (trimmed.endsWith(".wav")) {
          mimeType = "audio/wav";
        } else if (trimmed.endsWith(".ogg")) {
          mimeType = "audio/ogg";
        } else if (trimmed.endsWith(".aac")) {
          mimeType = "audio/aac";
        }

        contentHtml = `
          <div class="doca-audio-card my-4 p-4 rounded-xl border border-coral-200 bg-coral-50/70 backdrop-blur-md flex items-center gap-4 max-w-xl mx-auto shadow-sm" contenteditable="false">
            <div class="doca-audio-icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[10px] font-bold text-coral-500 uppercase tracking-widest truncate">Pemutar Audio</div>
              <audio controls preload="metadata" class="w-full mt-1 accent-coral-500 h-8 focus:outline-none">
                <source src="${trimmed}" type="${mimeType}">
                Browser Anda tidak mendukung pemutaran audio ini.
              </audio>
            </div>
          </div>
          <p>&nbsp;</p>
        `;
      } else {
        let embedUrl = trimmed;
        if (embedUrl.includes("audio.com") && !embedUrl.includes("/embed/")) {
          embedUrl = embedUrl.replace(
            /audio\.com\/([^/]+)\/audio\/([^/?#]+)/,
            "audio.com/embed/$1/audio/$2"
          );
        }
        if (
          embedUrl.includes("archive.org/details/") ||
          embedUrl.includes("archive.org/download/")
        ) {
          embedUrl = embedUrl.replace(
            /archive\.org\/(details|download)\/([^/]+).*/,
            "archive.org/embed/$2"
          );
        }

        const isNotebookLM = embedUrl.includes("notebooklm.google.com");

        let iframeHeight = "120";
        if (embedUrl.includes("archive.org")) {
          iframeHeight = "42";
        } else if (embedUrl.includes("audio.com")) {
          iframeHeight = "150";
        }

        if (isNotebookLM) {
          contentHtml = `
            <div class="doca-audio-card my-4 p-4 rounded-xl border border-coral-200 bg-coral-50/70 backdrop-blur-md flex items-center gap-4 max-w-xl mx-auto shadow-sm" contenteditable="false">
              <div class="doca-audio-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[10px] font-bold text-coral-500 uppercase tracking-widest truncate">NotebookLM Audio Overview</div>
                <div class="text-xs font-semibold text-coral-900 mt-0.5 truncate">Dengar Audio Podcast AI</div>
                <a href="${embedUrl}" target="_blank" class="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-coral-800 hover:bg-coral-900 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm">
                  <span>Buka Pemutar Audio ↗</span>
                </a>
              </div>
            </div>
            <p>&nbsp;</p>
          `;
        } else {
          contentHtml = `
            <div class="doca-embed-container my-4 max-w-xl mx-auto rounded-xl overflow-hidden border border-coral-200 shadow-sm" style="height: ${iframeHeight}px;" contenteditable="false">
              <iframe src="${embedUrl}" width="100%" height="100%" style="border:0;" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen;"></iframe>
            </div>
            <p>&nbsp;</p>
          `;
        }
      }
    }

    if (contentHtml) {
      execCommand("insertHTML", contentHtml);
    }
  };

  // Image and Video resize click handler
  useEffect(() => {
    const handleEditorClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Image Resizing
      if (target.tagName === "IMG" && editorRef.current?.contains(target)) {
        const newWidth = await triggerPrompt("Ubah Lebar Gambar:", target.style.width || "100%");
        if (newWidth) {
          target.style.width = newWidth;
          handleEditorInput();
        }
      }

      // Video Resizing
      const overlay = target.closest(".doca-video-resizer-overlay");
      const videoContainer = target.closest(".doca-video-container") as HTMLElement;

      if (overlay && videoContainer && editorRef.current?.contains(videoContainer)) {
        const newWidth = await triggerPrompt(
          "Ubah Lebar Video (contoh: 100%, 70%, 500px):",
          videoContainer.style.width || "100%"
        );
        if (newWidth) {
          videoContainer.style.width = newWidth;
          handleEditorInput();
        }
      }
    };

    const currentEditor = editorRef.current;
    if (currentEditor) {
      currentEditor.addEventListener("click", handleEditorClick);
    }
    return () => {
      if (currentEditor) {
        currentEditor.removeEventListener("click", handleEditorClick);
      }
    };
  }, [handleEditorInput, triggerPrompt]);

  return (
    <div
      className="flex flex-col h-full bg-white rounded-xl border border-coral-200 shadow-sm overflow-hidden relative"
      id="editor-wrapper"
    >
      {/* Save Status Progress Bar */}
      <div className="absolute top-[52px] left-0 w-full h-[1.5px] bg-transparent z-20 pointer-events-none">
        <div
          className={`h-full transition-all duration-1000 ease-in-out ${
            saveStatus === "dirty"
              ? "w-[10%] bg-amber-400/30"
              : saveStatus === "saving"
                ? "w-[80%] bg-coral-500 animate-pulse"
                : saveStatus === "saved"
                  ? "w-full bg-emerald-500 opacity-0"
                  : "w-0"
          }`}
        />
      </div>

      {/* Editor Main Formatting Toolbar */}
      <EditorToolbar
        isSourceMode={isSourceMode}
        saveStatus={saveStatus}
        execCommand={execCommand}
        insertLink={insertLink}
        insertCodeBlock={insertCodeBlock}
        openTableDialog={openTableDialog}
        insertImage={insertImage}
        insertVideo={insertVideo}
        insertAudio={insertAudio}
        insertCallout={insertCallout}
        manualSave={manualSave}
        toggleSourceMode={toggleSourceMode}
      />

      <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-[400px]" id="editor-body">
        {isSourceMode ? (
          <textarea
            className="w-full h-full p-4 font-mono text-sm border border-coral-200 rounded-lg bg-coral-900 text-coral-100 focus:outline-none leading-relaxed resize-none"
            value={sourceCode}
            onChange={handleSourceChange}
            spellCheck={false}
          />
        ) : (
          <div
            ref={editorRef}
            className="prose prose-coral max-w-none focus:outline-none min-h-[400px] text-coral-900 leading-relaxed"
            contentEditable
            role="textbox"
            aria-multiline="true"
            aria-label="Konten Artikel"
            onInput={handleEditorInput}
            onKeyDown={(e) => {
              if (e.ctrlKey || e.metaKey) {
                if (e.key === "s" || e.key === "S") {
                  e.preventDefault();
                  manualSave();
                }
              }
            }}
            style={{ outline: "none" }}
            placeholder="Mulai menulis..."
          />
        )}
      </div>

      <div className="px-4 py-1.5 bg-coral-50 border-t border-coral-200/80 text-[10px] text-coral-400 flex justify-between">
        <span>Gunakan H2/H3 untuk navigasi otomatis.</span>
        <span>Autosave aktif • Ctrl+S untuk simpan manual</span>
      </div>

      {/* Table Size Selection Dialog */}
      <TableDialog
        isOpen={showTableDialog}
        onClose={() => setShowTableDialog(false)}
        gridHoverRow={gridHoverRow}
        setGridHoverRow={setGridHoverRow}
        gridHoverCol={gridHoverCol}
        setGridHoverCol={setGridHoverCol}
        manualRows={manualRows}
        setManualRows={setManualRows}
        manualCols={manualCols}
        setManualCols={setManualCols}
        onInsertTable={insertTableWithSize}
      />

      {/* Table Floating Toolbar */}
      <TableToolbar
        showTableToolbar={showTableToolbar}
        activeCell={activeCell}
        toolbarPos={toolbarPos}
        showCellColorPicker={showCellColorPicker}
        setShowCellColorPicker={setShowCellColorPicker}
        cellColor={cellColor}
        colWidthInput={colWidthInput}
        setColWidthInput={setColWidthInput}
        rowHeightInput={rowHeightInput}
        setRowHeightInput={setRowHeightInput}
        addRow={addRow}
        addCol={addCol}
        deleteRow={deleteRow}
        deleteCol={deleteCol}
        setCellBgColor={setCellBgColor}
        applyColumnWidth={applyColumnWidth}
        applyRowHeight={applyRowHeight}
        onClose={() => {
          setShowTableToolbar(false);
          setActiveCell(null);
          setShowCellColorPicker(false);
        }}
      />
      {/* Custom Input Dialog for prompts */}
      <InputDialog
        isOpen={promptState.isOpen}
        title={promptState.title}
        defaultValue={promptState.defaultValue}
        onConfirm={handlePromptSubmit}
        onCancel={handlePromptCancel}
      />
    </div>
  );
}
