import React, { useState, useEffect, useRef } from "react";
import { X, Video, AlignLeft, AlignCenter, AlignRight, Layout, Move } from "lucide-react";

interface VideoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    url: string,
    width: string,
    height: string,
    alignH: "left" | "center" | "right",
    frame: "none" | "styled"
  ) => void;
  initialUrl?: string;
  initialWidth?: string;
  initialHeight?: string;
  initialAlignH?: "left" | "center" | "right";
  initialFrame?: "none" | "styled";
  isEditMode?: boolean;
}

export default function VideoDialog({
  isOpen,
  onClose,
  onConfirm,
  initialUrl = "",
  initialWidth = "100%",
  initialHeight = "auto",
  initialAlignH = "center",
  initialFrame = "none",
  isEditMode = false,
}: VideoDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [width, setWidth] = useState(initialWidth);
  const [preset, setPreset] = useState("100%");

  const [alignH, setAlignH] = useState<"left" | "center" | "right">(initialAlignH);
  const [frame, setFrame] = useState<"none" | "styled">(initialFrame);

  const modalRef = useRef<HTMLFormElement>(null);

  // Sync state with props when modal opens/changes
  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      const cleanWidth = initialWidth.trim();
      setWidth(cleanWidth);

      // Determine preset: "25%", "50%", "75%", "100%", or "custom"
      if (["25%", "50%", "75%", "100%"].includes(cleanWidth)) {
        setPreset(cleanWidth);
      } else {
        setPreset("custom");
      }

      setAlignH(initialAlignH);
      setFrame(initialFrame);
    }
  }, [isOpen, initialUrl, initialWidth, initialHeight, initialAlignH, initialFrame]);

  // Adjust width when preset changes
  const handlePresetSelect = (selectedPreset: string) => {
    setPreset(selectedPreset);
    if (selectedPreset !== "custom") {
      setWidth(selectedPreset);
    }
  };

  // Keyboard navigation & Esc key close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onConfirm(
      url.trim(),
      width || "100%",
      "auto",
      alignH,
      frame
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-coral-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content Box */}
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-dialog-title"
        className="relative w-full max-w-lg bg-white border border-coral-200 rounded-2xl shadow-xl overflow-hidden animate-slide-up z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-coral-100 bg-coral-50/50">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-coral-600" />
            <h3 id="video-dialog-title" className="font-bold text-coral-900 text-xs">
              {isEditMode ? "Ubah Pengaturan Video" : "Sisipkan Video Baru"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="p-1.5 rounded-lg text-coral-400 hover:bg-coral-100 hover:text-coral-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Video URL Input */}
          <div className="space-y-1.5">
            <label htmlFor="video-url" className="block text-[10px] font-black text-coral-500 uppercase tracking-wider">
              URL Video / Link YouTube / Link Vimeo
            </label>
            <input
              id="video-url"
              type="text"
              placeholder="https://example.com/video.mp4 atau link YouTube/Vimeo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4.5 py-2.5 bg-coral-50 border border-coral-200 rounded-xl text-xs font-semibold text-coral-950 placeholder-coral-300 focus:outline-none focus:border-coral-500 transition-colors"
              required
              autoFocus
            />
            <p className="text-[10px] text-coral-400">
              * Mendukung file direct video (.mp4, .webm) atau tautan standar YouTube dan Vimeo.
            </p>
          </div>

          {/* Width Selection */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-coral-500 uppercase tracking-wider">
              Lebar Bingkai Video
            </label>
            <div className="grid grid-cols-5 gap-1 bg-coral-50 p-1 rounded-xl border border-coral-200">
              {["25%", "50%", "75%", "100%", "custom"].map((p) => {
                const isActive = preset === p;
                const label = p === "custom" ? "Kst" : p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? "bg-coral-800 text-white shadow-sm"
                        : "text-coral-600 hover:bg-coral-200/50 hover:text-coral-800"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {preset === "custom" && (
              <input
                type="text"
                placeholder="e.g. 60%, 450px"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-3 py-2 bg-coral-50 border border-coral-200 rounded-xl text-xs font-semibold text-coral-950 placeholder-coral-300 focus:outline-none focus:border-coral-500 transition-colors mt-1"
              />
            )}
          </div>

          {/* Frame Style Selector */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-coral-500 uppercase tracking-wider flex items-center gap-1">
              <Layout className="w-3.5 h-3.5 text-coral-400" />
              <span>Gaya Bingkai (Borders & Background)</span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-coral-50 p-1 rounded-xl border border-coral-200">
              {[
                { value: "none", label: "Tanpa Bingkai (Transparan)" },
                { value: "styled", label: "Bingkai Modern (Border & Gelap/Muda)" },
              ].map((styleOpt) => {
                const isActive = frame === styleOpt.value;
                return (
                  <button
                    key={styleOpt.value}
                    type="button"
                    onClick={() => setFrame(styleOpt.value as "none" | "styled")}
                    className={`py-2 px-3 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer text-center ${
                      isActive
                        ? "bg-coral-800 text-white shadow-sm"
                        : "text-coral-600 hover:bg-coral-200/50 hover:text-coral-800"
                    }`}
                  >
                    {styleOpt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontal Alignment */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-coral-500 uppercase tracking-wider flex items-center gap-1">
              <Move className="w-3.5 h-3.5 text-coral-400" />
              <span>Posisi Letak Horizontal</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-coral-50 p-1 rounded-xl border border-coral-200">
              {[
                { value: "left", label: "Kiri", icon: AlignLeft },
                { value: "center", label: "Tengah", icon: AlignCenter },
                { value: "right", label: "Kanan", icon: AlignRight },
              ].map((item) => {
                const isActive = alignH === item.value;
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setAlignH(item.value as "left" | "center" | "right")}
                    className={`py-2 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isActive
                        ? "bg-coral-800 text-white shadow-sm"
                        : "text-coral-600 hover:bg-coral-200/50 hover:text-coral-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-coral-100 bg-coral-50/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-coral-500 hover:bg-coral-100 rounded-xl transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-coral-800 hover:bg-coral-900 rounded-xl transition-all shadow-sm shadow-coral-800/10 cursor-pointer"
          >
            {isEditMode ? "Perbarui" : "Sisipkan"}
          </button>
        </div>
      </form>
    </div>
  );
}
