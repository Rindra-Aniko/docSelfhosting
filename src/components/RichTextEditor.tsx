import React, { useState, useEffect, useRef, useCallback } from "react";
import { Topic } from "../types";
import EditorToolbar from "./editor/EditorToolbar";
import TableToolbar from "./editor/TableToolbar";
import TableDialog from "./editor/TableDialog";
import { useAutoSave } from "./editor/useAutoSave";
import { useTableEditor } from "./editor/useTableEditor";
import { InputDialog } from "./InputDialog";
import VideoDialog from "./editor/VideoDialog";
import AudioDialog from "./editor/AudioDialog";
import LayoutDialog from "./editor/LayoutDialog";
import ImageDialog from "./editor/ImageDialog";
import { sanitizeHtml } from "../shared/sanitize";





// Helper to parse video URL and return clean source for iframe embed or direct link
const parseVideoSource = (url: string) => {
  const cleanUrl = url.trim();
  
  // YouTube watch link: youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const ytMatch = cleanUrl.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return {
      type: "embed",
      url: `https://www.youtube.com/embed/${ytMatch[1]}`
    };
  }

  // Vimeo link: vimeo.com/VIDEO_ID or player.vimeo.com/video/VIDEO_ID
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
  const vimeoMatch = cleanUrl.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "embed",
      url: `https://player.vimeo.com/video/${vimeoMatch[1]}`
    };
  }

  // Otherwise, assume it is a direct link to a video file
  return {
    type: "direct",
    url: cleanUrl
  };
};

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

  const [videoDialogState, setVideoDialogState] = useState<{
    isOpen: boolean;
    url: string;
    width: string;
    height: string;
    alignH: "left" | "center" | "right";
    frame: "none" | "styled";
    isEditMode: boolean;
    editingNode: HTMLElement | null;
  }>({
    isOpen: false,
    url: "",
    width: "100%",
    height: "auto",
    alignH: "center",
    frame: "none",
    isEditMode: false,
    editingNode: null,
  });

  const [audioDialogState, setAudioDialogState] = useState<{
    isOpen: boolean;
    url: string;
    resolvedUrl: string;
    width: string;
    alignH: "left" | "center" | "right";
    frame: "none" | "styled";
    isEditMode: boolean;
    editingNode: HTMLElement | null;
  }>({
    isOpen: false,
    url: "",
    resolvedUrl: "",
    width: "100%",
    alignH: "center",
    frame: "none",
    isEditMode: false,
    editingNode: null,
  });

  const [showLayoutDialog, setShowLayoutDialog] = useState(false);

  const [imageDialogState, setImageDialogState] = useState<{
    isOpen: boolean;
    url: string;
    width: string;
    height: string;
    alignH: "left" | "center" | "right";
    frame: "none" | "styled";
    isEditMode: boolean;
    editingNode: HTMLImageElement | null;
  }>({
    isOpen: false,
    url: "",
    width: "100%",
    height: "auto",
    alignH: "center",
    frame: "none",
    isEditMode: false,
    editingNode: null,
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

  const savedSelection = useRef<Range | null>(null);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelection.current = range;
      }
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (savedSelection.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelection.current);
      }
      savedSelection.current = null;
    }
  }, []);

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
  } = useTableEditor(editorRef, isSourceMode, execCommand, handleEditorInput, saveSelection, restoreSelection);

  // Sync content when topic changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = sanitizeHtml(activeTopic.content || "");
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
          editorRef.current.innerHTML = sourceCode;
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

  const insertImage = () => {
    if (isSourceMode) return;
    saveSelection();
    setImageDialogState({
      isOpen: true,
      url: "",
      width: "100%",
      height: "auto",
      alignH: "center",
      frame: "none",
      isEditMode: false,
      editingNode: null,
    });
  };

  const handleImageConfirm = (
    url: string,
    width: string,
    height: string,
    alignH: "left" | "center" | "right",
    frame: "none" | "styled"
  ) => {
    let justifyOuterClass = "justify-center";
    if (alignH === "left") justifyOuterClass = "justify-start";
    if (alignH === "right") justifyOuterClass = "justify-end";

    const frameClasses = frame === "styled"
      ? "border border-coral-200 bg-coral-50/20 rounded-xl p-2"
      : "";

    const frameStyle = `width: ${width}; height: ${height}; max-width: 100%;`;
    const imgStyle = `max-width: 100%; max-height: 100%; object-fit: contain;`;

    const imgHtml = `<img src="${url}" alt="Gambar" style="${imgStyle}" class="rounded-lg cursor-pointer transition-all hover:opacity-95" />`;
    const imgFrameHtml = `<div class="image-frame flex flex-col items-center justify-center ${frameClasses}" style="${frameStyle}">${imgHtml}</div>`;

    if (imageDialogState.isEditMode && imageDialogState.editingNode) {
      // Update existing node
      const imgNode = imageDialogState.editingNode;
      const wrapper = imgNode.closest(".image-wrapper") as HTMLElement;

      if (wrapper) {
        wrapper.setAttribute("data-img-url", url);
        wrapper.setAttribute("data-img-width", width);
        wrapper.setAttribute("data-img-height", height);
        wrapper.setAttribute("data-img-align-h", alignH);
        wrapper.setAttribute("data-img-frame", frame);
        wrapper.className = `image-wrapper my-4 flex flex-row ${justifyOuterClass}`;
        wrapper.setAttribute("style", "width: 100%;");
        wrapper.innerHTML = imgFrameHtml;
      } else {
        // Fallback: wrap it
        const newWrapper = document.createElement("div");
        newWrapper.className = `image-wrapper my-4 flex flex-row ${justifyOuterClass}`;
        newWrapper.setAttribute("data-img-url", url);
        newWrapper.setAttribute("data-img-width", width);
        newWrapper.setAttribute("data-img-height", height);
        newWrapper.setAttribute("data-img-align-h", alignH);
        newWrapper.setAttribute("data-img-frame", frame);
        newWrapper.setAttribute("contenteditable", "false");
        newWrapper.setAttribute("style", "width: 100%;");
        newWrapper.innerHTML = imgFrameHtml;
        imgNode.parentNode?.replaceChild(newWrapper, imgNode);
      }
      handleEditorInput();
    } else {
      // Insert new image
      restoreSelection();
      const wrappedImgHtml = `<div class="image-wrapper my-4 flex flex-row ${justifyOuterClass}" data-img-url="${url}" data-img-width="${width}" data-img-height="${height}" data-img-align-h="${alignH}" data-img-frame="${frame}" contenteditable="false" style="width: 100%;">${imgFrameHtml}</div><p>&nbsp;</p>`;
      execCommand("insertHTML", wrappedImgHtml);
    }

    setImageDialogState({
      isOpen: false,
      url: "",
      width: "100%",
      height: "auto",
      alignH: "center",
      frame: "none",
      isEditMode: false,
      editingNode: null,
    });
  };

  const openVideoDialog = () => {
    if (isSourceMode) return;
    saveSelection();
    setVideoDialogState({
      isOpen: true,
      url: "",
      width: "100%",
      height: "auto",
      alignH: "center",
      frame: "none",
      isEditMode: false,
      editingNode: null,
    });
  };

  const handleVideoConfirm = (
    url: string,
    width: string,
    height: string,
    alignH: "left" | "center" | "right",
    frame: "none" | "styled"
  ) => {
    const parsed = parseVideoSource(url);
    
    let justifyOuterClass = "justify-center";
    if (alignH === "left") justifyOuterClass = "justify-start";
    if (alignH === "right") justifyOuterClass = "justify-end";

    const frameClasses = frame === "styled"
      ? "border border-coral-200 bg-coral-50/20 rounded-xl p-2"
      : "";

    const frameStyle = `width: ${width}; height: ${height}; max-width: 100%;`;
    const mediaHtml = parsed.type === "embed"
      ? `<iframe src="${parsed.url}" frameborder="0" allowfullscreen style="width: 100%; height: 100%;" class="rounded-lg shadow-sm border border-coral-200"></iframe>`
      : `<video src="${parsed.url}" controls style="width: 100%; height: auto;" class="rounded-lg shadow-sm border border-coral-200"></video>`;

    const videoFrameHtml = `<div class="video-frame flex flex-col items-center justify-center ${frameClasses}" style="${frameStyle}">${mediaHtml}</div>`;

    if (videoDialogState.isEditMode && videoDialogState.editingNode) {
      const node = videoDialogState.editingNode;
      node.setAttribute("data-video-url", url);
      node.setAttribute("data-video-width", width);
      node.setAttribute("data-video-height", height);
      node.setAttribute("data-video-align-h", alignH);
      node.setAttribute("data-video-frame", frame);
      node.className = `video-wrapper my-4 flex flex-row ${justifyOuterClass} cursor-pointer`;
      node.setAttribute("style", "width: 100%;");
      node.innerHTML = videoFrameHtml;
      
      handleEditorInput();
    } else {
      restoreSelection();
      const wrappedVideoHtml = `<div class="video-wrapper my-4 flex flex-row ${justifyOuterClass} cursor-pointer" data-video-url="${url}" data-video-width="${width}" data-video-height="${height}" data-video-align-h="${alignH}" data-video-frame="${frame}" contenteditable="false" style="width: 100%;">${videoFrameHtml}</div><p>&nbsp;</p>`;
      execCommand("insertHTML", wrappedVideoHtml);
    }

    setVideoDialogState({
      isOpen: false,
      url: "",
      width: "100%",
      height: "auto",
      alignH: "center",
      frame: "none",
      isEditMode: false,
      editingNode: null,
    });
  };

  const openAudioDialog = () => {
    if (isSourceMode) return;
    saveSelection();
    setAudioDialogState({
      isOpen: true,
      url: "",
      resolvedUrl: "",
      width: "100%",
      alignH: "center",
      frame: "none",
      isEditMode: false,
      editingNode: null,
    });
  };

  const handleAudioConfirm = (
    url: string,
    resolvedUrl: string,
    width: string,
    alignH: "left" | "center" | "right",
    frame: "none" | "styled"
  ) => {
    let justifyOuterClass = "justify-center";
    if (alignH === "left") justifyOuterClass = "justify-start";
    if (alignH === "right") justifyOuterClass = "justify-end";

    const frameClasses = frame === "styled"
      ? "border border-coral-200 bg-coral-50/20 rounded-xl p-2"
      : "";

    const frameStyle = `width: ${width}; max-width: 100%;`;
    const audioHtml = `<audio src="${resolvedUrl}" controls class="w-full rounded-lg"></audio>`;
    const audioFrameHtml = `<div class="audio-frame flex flex-col items-center justify-center ${frameClasses}" style="${frameStyle}">${audioHtml}</div>`;

    if (audioDialogState.isEditMode && audioDialogState.editingNode) {
      const node = audioDialogState.editingNode;
      node.setAttribute("data-audio-url", url);
      node.setAttribute("data-resolved-url", resolvedUrl);
      node.setAttribute("data-audio-width", width);
      node.setAttribute("data-audio-align-h", alignH);
      node.setAttribute("data-audio-frame", frame);
      node.className = `audio-wrapper my-4 flex flex-row ${justifyOuterClass} cursor-pointer`;
      node.setAttribute("style", "width: 100%;");
      node.innerHTML = audioFrameHtml;
      
      handleEditorInput();
    } else {
      restoreSelection();
      const wrappedAudioHtml = `<div class="audio-wrapper my-4 flex flex-row ${justifyOuterClass} cursor-pointer" data-audio-url="${url}" data-resolved-url="${resolvedUrl}" data-audio-width="${width}" data-audio-align-h="${alignH}" data-audio-frame="${frame}" contenteditable="false" style="width: 100%;">${audioFrameHtml}</div><p>&nbsp;</p>`;
      execCommand("insertHTML", wrappedAudioHtml);
    }

    setAudioDialogState({
      isOpen: false,
      url: "",
      resolvedUrl: "",
      width: "100%",
      alignH: "center",
      frame: "none",
      isEditMode: false,
      editingNode: null,
    });
  };

  const openLayoutDialog = () => {
    if (isSourceMode) return;
    saveSelection();
    setShowLayoutDialog(true);
  };

  const handleLayoutConfirm = (type: "cols-2" | "cols-3" | "cols-30-70") => {
    restoreSelection();
    
    let columnsHtml = "";
    if (type === "cols-2") {
      columnsHtml = `<div class="layout-row cols-2 my-6" contenteditable="false"><div class="layout-col" contenteditable="true"><h3>Kolom Kiri</h3><p>Tulis teks kolom kiri di sini...</p></div><div class="layout-col" contenteditable="true"><h3>Kolom Kanan</h3><p>Tulis teks kolom kanan di sini...</p></div></div><p>&nbsp;</p>`;
    } else if (type === "cols-3") {
      columnsHtml = `<div class="layout-row cols-3 my-6" contenteditable="false"><div class="layout-col" contenteditable="true"><h3>Kolom 1</h3><p>Tulis teks kolom 1 di sini...</p></div><div class="layout-col" contenteditable="true"><h3>Kolom 2</h3><p>Tulis teks kolom 2 di sini...</p></div><div class="layout-col" contenteditable="true"><h3>Kolom 3</h3><p>Tulis teks kolom 3 di sini...</p></div></div><p>&nbsp;</p>`;
    } else if (type === "cols-30-70") {
      columnsHtml = `<div class="layout-row cols-30-70 my-6" contenteditable="false"><div class="layout-col" contenteditable="true"><h3>Detail</h3><p>Materi pendukung...</p></div><div class="layout-col" contenteditable="true"><h3>Penjelasan Utama</h3><p>Tulis isi penjelasan utama di sini secara rinci...</p></div></div><p>&nbsp;</p>`;
    }

    execCommand("insertHTML", columnsHtml);
    setShowLayoutDialog(false);
  };

  const insertLink = async () => {
    if (isSourceMode) return;
    saveSelection();
    const url = await triggerPrompt("Masukkan URL Link (contoh: https://google.com):", "https://");
    if (url && url !== "https://") {
      const selection = window.getSelection()?.toString();
      if (!selection) {
        const text = await triggerPrompt("Masukkan Teks Tautan:", url);
        if (text === null) {
          savedSelection.current = null;
          return;
        }
        const linkHtml = `<a href="${url}" target="_blank" class="text-coral-800 font-bold hover:underline">${text || url}</a>`;
        restoreSelection();
        execCommand("insertHTML", linkHtml);
      } else {
        restoreSelection();
        execCommand("createLink", url);
      }
    } else {
      savedSelection.current = null;
    }
  };

  // Media click handler (Image resize & Video/Audio edit)
  useEffect(() => {
    const handleEditorClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Image Resizing/Alignment Edit
      const imageWrapper = target.closest(".image-wrapper") as HTMLElement;
      if (imageWrapper && editorRef.current?.contains(imageWrapper)) {
        const imgNode = imageWrapper.querySelector("img");
        if (imgNode) {
          const imgUrl = imgNode.getAttribute("src") || "";
          const imgWidth = imageWrapper.getAttribute("data-img-width") || "100%";
          const imgHeight = imageWrapper.getAttribute("data-img-height") || "auto";
          const imgAlignH = imageWrapper.getAttribute("data-img-align-h") || imageWrapper.getAttribute("data-img-align") || "center";
          const imgFrame = imageWrapper.getAttribute("data-img-frame") || "none";

          setImageDialogState({
            isOpen: true,
            url: imgUrl,
            width: imgWidth,
            height: imgHeight,
            alignH: imgAlignH as "left" | "center" | "right",
            frame: imgFrame as "none" | "styled",
            isEditMode: true,
            editingNode: imgNode,
          });
          return;
        }
      } else if (target.tagName === "IMG" && editorRef.current?.contains(target)) {
        const imgNode = target as HTMLImageElement;
        const imgUrl = imgNode.getAttribute("src") || "";
        const imgWidth = imgNode.style.width || "100%";
        
        setImageDialogState({
          isOpen: true,
          url: imgUrl,
          width: imgWidth,
          height: "auto",
          alignH: "center",
          frame: "none",
          isEditMode: true,
          editingNode: imgNode,
        });
        return;
      }

      // Video Editing/Resizing
      const videoWrapper = target.closest(".video-wrapper") as HTMLElement;
      if (videoWrapper && editorRef.current?.contains(videoWrapper)) {
        const videoUrl = videoWrapper.getAttribute("data-video-url") || "";
        const videoWidth = videoWrapper.getAttribute("data-video-width") || "100%";
        const videoHeight = videoWrapper.getAttribute("data-video-height") || "auto";
        const videoAlignH = videoWrapper.getAttribute("data-video-align-h") || "center";
        const videoFrame = videoWrapper.getAttribute("data-video-frame") || "none";

        setVideoDialogState({
          isOpen: true,
          url: videoUrl,
          width: videoWidth,
          height: videoHeight,
          alignH: videoAlignH as "left" | "center" | "right",
          frame: videoFrame as "none" | "styled",
          isEditMode: true,
          editingNode: videoWrapper,
        });
        return;
      }

      // Audio Editing
      const audioWrapper = target.closest(".audio-wrapper") as HTMLElement;
      if (audioWrapper && editorRef.current?.contains(audioWrapper)) {
        const audioUrl = audioWrapper.getAttribute("data-audio-url") || "";
        const resolvedUrl = audioWrapper.getAttribute("data-resolved-url") || "";
        const audioWidth = audioWrapper.getAttribute("data-audio-width") || "100%";
        const audioAlignH = audioWrapper.getAttribute("data-audio-align-h") || "center";
        const audioFrame = audioWrapper.getAttribute("data-audio-frame") || "none";

        setAudioDialogState({
          isOpen: true,
          url: audioUrl,
          resolvedUrl: resolvedUrl,
          width: audioWidth,
          alignH: audioAlignH as "left" | "center" | "right",
          frame: audioFrame as "none" | "styled",
          isEditMode: true,
          editingNode: audioWrapper,
        });
        return;
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
  }, [handleEditorInput, triggerPrompt, setVideoDialogState, setAudioDialogState, setImageDialogState]);

  return (
    <div
      className="flex flex-col h-full bg-white rounded-xl border border-coral-200 shadow-sm overflow-visible relative"
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
        openVideoDialog={openVideoDialog}
        openAudioDialog={openAudioDialog}
        openLayoutDialog={openLayoutDialog}
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

      <div className="px-4 py-1.5 bg-coral-50 border-t border-coral-200/80 text-[10px] text-coral-400 flex justify-between rounded-b-xl">
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

      {/* Custom Video Dialog */}
      <VideoDialog
        isOpen={videoDialogState.isOpen}
        onClose={() => setVideoDialogState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleVideoConfirm}
        initialUrl={videoDialogState.url}
        initialWidth={videoDialogState.width}
        initialHeight={videoDialogState.height}
        initialAlignH={videoDialogState.alignH}
        initialFrame={videoDialogState.frame}
        isEditMode={videoDialogState.isEditMode}
      />

      {/* Custom Audio Dialog */}
      <AudioDialog
        isOpen={audioDialogState.isOpen}
        onClose={() => setAudioDialogState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleAudioConfirm}
        initialUrl={audioDialogState.url}
        initialWidth={audioDialogState.width}
        initialAlignH={audioDialogState.alignH}
        initialFrame={audioDialogState.frame}
        isEditMode={audioDialogState.isEditMode}
      />

      {/* Custom Layout Dialog */}
      <LayoutDialog
        isOpen={showLayoutDialog}
        onClose={() => setShowLayoutDialog(false)}
        onConfirm={handleLayoutConfirm}
      />

      {/* Custom Image Dialog */}
      <ImageDialog
        isOpen={imageDialogState.isOpen}
        onClose={() => setImageDialogState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleImageConfirm}
        initialUrl={imageDialogState.url}
        initialWidth={imageDialogState.width}
        initialHeight={imageDialogState.height}
        initialAlignH={imageDialogState.alignH}
        initialFrame={imageDialogState.frame}
        isEditMode={imageDialogState.isEditMode}
      />
    </div>
  );
}
