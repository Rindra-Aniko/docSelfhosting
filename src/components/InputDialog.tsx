import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface InputDialogProps {
  isOpen: boolean;
  title: string;
  defaultValue: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const InputDialog: React.FC<InputDialogProps> = ({
  isOpen,
  title,
  defaultValue,
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const modalRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length > 0) {
      const inputEl = modalRef.current?.querySelector("input");
      if (inputEl) {
        inputEl.focus();
      } else {
        (focusableElements[0] as HTMLElement).focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key !== "Tab") return;
      if (!modalRef.current) return;

      const elements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (elements.length === 0) return;

      const firstElement = elements[0] as HTMLElement;
      const lastElement = elements[elements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(inputValue);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-coral-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal Box */}
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="input-dialog-title"
        className="relative w-full max-w-md bg-white border border-coral-200 rounded-2xl shadow-xl overflow-hidden animate-slide-up z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-coral-100 bg-coral-50/50">
          <h3 id="input-dialog-title" className="font-bold text-coral-900 text-xs">
            {title}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup dialog"
            className="p-1.5 rounded-lg text-coral-400 hover:bg-coral-100 hover:text-coral-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label={title}
            className="w-full px-4 py-2.5 bg-coral-50 border border-coral-200 rounded-xl text-xs font-semibold text-coral-950 placeholder-coral-300 focus:outline-none focus:border-coral-800 transition-colors"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-coral-100 bg-coral-50/30">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-coral-500 hover:bg-coral-100 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-coral-800 hover:bg-coral-900 rounded-xl transition-all shadow-sm shadow-coral-800/10"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};
