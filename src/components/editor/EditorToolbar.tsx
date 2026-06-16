import React from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Table,
  Save,
  AlignLeft,
  AlignJustify,
  Image,
  AlignCenter,
  Link,
  Video,
  Volume2,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface EditorToolbarProps {
  isSourceMode: boolean;
  saveStatus: "clean" | "dirty" | "saving" | "saved";
  execCommand: (command: string, value?: string) => void;
  insertLink: () => void;
  insertCodeBlock: () => void;
  openTableDialog: () => void;
  insertImage: () => void;
  insertVideo: () => void;
  insertAudio: () => void;
  insertCallout: (type: "info" | "warning" | "success") => void;
  manualSave: () => void;
  toggleSourceMode: () => void;
}

export default function EditorToolbar({
  isSourceMode,
  saveStatus,
  execCommand,
  insertLink,
  insertCodeBlock,
  openTableDialog,
  insertImage,
  insertVideo,
  insertAudio,
  insertCallout,
  manualSave,
  toggleSourceMode,
}: EditorToolbarProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between p-3 gap-2 bg-coral-50 border-b border-coral-200/85 relative z-10"
      id="editor-toolbar"
      role="toolbar"
      aria-label="Editor Formatting Toolbar"
    >
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          disabled={isSourceMode}
          title="Tebal"
          aria-label="Tebal (Bold)"
          className="p-1.5 rounded text-coral-600 hover:bg-coral-200 disabled:opacity-30"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          disabled={isSourceMode}
          title="Miring"
          aria-label="Miring (Italic)"
          className="p-1.5 rounded text-coral-600 hover:bg-coral-200 disabled:opacity-30"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          disabled={isSourceMode}
          title="Garis Bawah"
          aria-label="Garis Bawah (Underline)"
          className="p-1.5 rounded text-coral-600 hover:bg-coral-200 disabled:opacity-30"
        >
          <Underline className="w-4 h-4" />
        </button>
        <span className="h-4 w-[1px] bg-coral-200 mx-1" />
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "H2")}
          disabled={isSourceMode}
          title="H2"
          aria-label="Judul Utama (H2)"
          className="p-1.5 rounded text-coral-600 hover:bg-coral-200 disabled:opacity-30"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "H3")}
          disabled={isSourceMode}
          title="Sub Judul"
          aria-label="Sub-judul (H3)"
          className="p-1.5 rounded text-coral-600 hover:bg-coral-200 disabled:opacity-30"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "P")}
          disabled={isSourceMode}
          title="Rata Kiri"
          aria-label="Rata Kiri"
          className="p-1.5 rounded text-coral-600 hover:bg-coral-200 disabled:opacity-30"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyCenter")}
          disabled={isSourceMode}
          title="Rata Tengah"
          aria-label="Rata Tengah"
          className="p-1.5 rounded text-coral-600 hover:bg-coral-200 disabled:opacity-30"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyFull")}
          disabled={isSourceMode}
          title="Rata Kiri Kanan"
          aria-label="Rata Kiri Kanan"
          className="p-1.5 rounded text-coral-600 hover:bg-coral-200 disabled:opacity-30"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
        <span className="h-4 w-[1px] bg-coral-200 mx-1" />
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          disabled={isSourceMode}
          title="List"
          aria-label="Daftar Bullets"
          className="p-1.5 rounded text-coral-600 hover:bg-coral-200 disabled:opacity-30"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          disabled={isSourceMode}
          title="Ordered"
          aria-label="Daftar Angka"
          className="p-1.5 rounded text-coral-600 hover:bg-coral-200 disabled:opacity-30"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "BLOCKQUOTE")}
          disabled={isSourceMode}
          title="Quote"
          aria-label="Kutipan (Blockquote)"
          className="p-1.5 rounded text-coral-600 hover:bg-coral-200 disabled:opacity-30"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertLink}
          disabled={isSourceMode}
          title="Link"
          aria-label="Sisipkan Tautan"
          className="p-1.5 rounded text-coral-600 hover:bg-coral-200 disabled:opacity-30"
        >
          <Link className="w-4 h-4" />
        </button>
        <span className="h-4 w-[1px] bg-coral-200 mx-1" />
        <button
          type="button"
          onClick={insertCodeBlock}
          disabled={isSourceMode}
          title="Kode"
          aria-label="Sisipkan Blok Kode"
          className="p-1.5 rounded text-coral-700 hover:bg-coral-100 border border-coral-200 flex items-center gap-1 px-2"
        >
          <Code className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">Kode</span>
        </button>
        <button
          type="button"
          onClick={openTableDialog}
          disabled={isSourceMode}
          title="Tabel"
          aria-label="Sisipkan Tabel"
          className="p-1.5 rounded text-coral-700 hover:bg-coral-100 border border-coral-200 flex items-center gap-1 px-2"
        >
          <Table className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">Tabel</span>
        </button>
        <button
          type="button"
          onClick={insertImage}
          disabled={isSourceMode}
          title="Foto"
          aria-label="Sisipkan Gambar"
          className="p-1.5 rounded text-coral-700 hover:bg-coral-100 border border-coral-200 flex items-center gap-1 px-2"
        >
          <Image className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">Foto</span>
        </button>
        <button
          type="button"
          onClick={insertVideo}
          disabled={isSourceMode}
          title="Video"
          aria-label="Sisipkan Video"
          className="p-1.5 rounded text-coral-700 hover:bg-coral-100 border border-coral-200 flex items-center gap-1 px-2"
        >
          <Video className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">Video</span>
        </button>
        <button
          type="button"
          onClick={insertAudio}
          disabled={isSourceMode}
          title="Audio"
          aria-label="Sisipkan Audio"
          className="p-1.5 rounded text-coral-700 hover:bg-coral-100 border border-coral-200 flex items-center gap-1 px-2"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">Audio</span>
        </button>
        <span className="h-4 w-[1px] bg-coral-200 mx-1" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertCallout("info")}
            disabled={isSourceMode}
            title="Info"
            aria-label="Sisipkan Info Box"
            className="p-1 rounded text-blue-500 hover:bg-blue-50"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertCallout("warning")}
            disabled={isSourceMode}
            title="Warning"
            aria-label="Sisipkan Warning Box"
            className="p-1 rounded text-amber-500 hover:bg-amber-50"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertCallout("success")}
            disabled={isSourceMode}
            title="Success"
            aria-label="Sisipkan Success Box"
            className="p-1 rounded text-emerald-500 hover:bg-emerald-50"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden lg:block w-20 text-right">
          {saveStatus === "saving" && (
            <span className="text-[9px] font-black text-coral-400 uppercase tracking-widest animate-pulse">
              Saving
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
              Synced
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={manualSave}
          className="p-1.5 rounded hover:bg-coral-200 text-coral-600 transition-all"
          title="Simpan"
          aria-label="Simpan Konten (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleSourceMode}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${isSourceMode ? "bg-coral-800 text-coral-50" : "bg-coral-200/50 text-coral-700 hover:bg-coral-200"}`}
          aria-label={isSourceMode ? "Beralih ke Editor Visual" : "Beralih ke Kode Sumber HTML"}
        >
          {isSourceMode ? "Visual" : "HTML"}
        </button>
      </div>
    </div>
  );
}
