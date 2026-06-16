import React, { useEffect, useRef } from "react";
import { X, Columns } from "lucide-react";

interface LayoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: "cols-2" | "cols-3" | "cols-30-70") => void;
}

export default function LayoutDialog({
  isOpen,
  onClose,
  onConfirm,
}: LayoutDialogProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-coral-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content Box */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="layout-dialog-title"
        className="relative w-full max-w-md bg-white border border-coral-200 rounded-2xl shadow-xl overflow-hidden animate-slide-up z-10 font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-coral-100 bg-coral-50/50">
          <div className="flex items-center gap-2">
            <Columns className="w-4 h-4 text-coral-600" />
            <h3 id="layout-dialog-title" className="font-bold text-coral-900 text-xs">
              Sisipkan Layout Kolom Baru
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="p-1.5 rounded-lg text-coral-400 hover:bg-coral-100 hover:text-coral-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-coral-500 mb-2">
            Pilih jenis tata letak kolom yang ingin Anda sisipkan ke dokumen. Kolom ini akan tampil berdampingan di komputer desktop dan otomatis menumpuk di handphone (responsif).
          </p>

          <div className="space-y-2.5">
            {/* 2 Columns */}
            <button
              type="button"
              onClick={() => onConfirm("cols-2")}
              className="w-full text-left p-3.5 border border-coral-200 rounded-xl hover:border-coral-500 hover:bg-coral-50/50 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-coral-900 group-hover:text-coral-950">2 Kolom Seimbang (50% / 50%)</span>
                <span className="block text-[10px] text-coral-400">Cocok untuk perbandingan sisi-ke-sisi atau teks & gambar.</span>
              </div>
              <div className="flex gap-1 w-16 h-8 bg-coral-100 p-1 rounded border border-coral-200 flex-shrink-0">
                <div className="flex-1 bg-white rounded border border-coral-300" />
                <div className="flex-1 bg-white rounded border border-coral-300" />
              </div>
            </button>

            {/* 3 Columns */}
            <button
              type="button"
              onClick={() => onConfirm("cols-3")}
              className="w-full text-left p-3.5 border border-coral-200 rounded-xl hover:border-coral-500 hover:bg-coral-50/50 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-coral-900 group-hover:text-coral-950">3 Kolom Seimbang (33% / 33% / 33%)</span>
                <span className="block text-[10px] text-coral-400">Cocok untuk membagi 3 fitur utama atau poin ringkasan.</span>
              </div>
              <div className="flex gap-1 w-16 h-8 bg-coral-100 p-1 rounded border border-coral-200 flex-shrink-0">
                <div className="flex-1 bg-white rounded border border-coral-300" />
                <div className="flex-1 bg-white rounded border border-coral-300" />
                <div className="flex-1 bg-white rounded border border-coral-300" />
              </div>
            </button>

            {/* Asymmetrical 30/70 Column */}
            <button
              type="button"
              onClick={() => onConfirm("cols-30-70")}
              className="w-full text-left p-3.5 border border-coral-200 rounded-xl hover:border-coral-500 hover:bg-coral-50/50 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-coral-900 group-hover:text-coral-950">Kolom Asimetris (30% / 70%)</span>
                <span className="block text-[10px] text-coral-400">Bagus untuk layout sidebar-materi atau key-value penjelasan.</span>
              </div>
              <div className="flex gap-1 w-16 h-8 bg-coral-100 p-1 rounded border border-coral-200 flex-shrink-0">
                <div className="w-[30%] bg-white rounded border border-coral-300" />
                <div className="w-[70%] bg-white rounded border border-coral-300" />
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-coral-100 bg-coral-50/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-coral-500 hover:bg-coral-100 rounded-xl transition-all"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
