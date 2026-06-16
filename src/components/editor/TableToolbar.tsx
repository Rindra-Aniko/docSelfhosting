import React from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Paintbrush,
  X,
} from "lucide-react";

const CELL_COLOR_PRESETS = [
  { name: "Tanpa Warna", value: "" },
  { name: "Putih", value: "#ffffff" },
  { name: "Abu Muda", value: "#f8f9fa" },
  { name: "Coral 50", value: "#fff5f5" },
  { name: "Kuning Muda", value: "#fefce8" },
  { name: "Hijau Muda", value: "#f0fdf4" },
  { name: "Biru Muda", value: "#eff6ff" },
  { name: "Ungu Muda", value: "#faf5ff" },
  { name: "Pink Muda", value: "#fdf2f8" },
  { name: "Coral 100", value: "#ffebeb" },
  { name: "Amber", value: "#fef3c7" },
  { name: "Emerald", value: "#d1fae5" },
  { name: "Sky", value: "#e0f2fe" },
  { name: "Violet", value: "#ede9fe" },
  { name: "Rose", value: "#fce7f3" },
  { name: "Merah Muda", value: "#fee2e2" },
  { name: "Oranye Muda", value: "#ffedd5" },
  { name: "Coral 200", value: "#ffd6d6" },
  { name: "Kuning", value: "#fde68a" },
  { name: "Hijau", value: "#a7f3d0" },
  { name: "Biru", value: "#bfdbfe" },
];

interface TableToolbarProps {
  showTableToolbar: boolean;
  activeCell: HTMLTableCellElement | null;
  toolbarPos: { top: number; left: number };
  showCellColorPicker: boolean;
  setShowCellColorPicker: (val: boolean) => void;
  cellColor: string;
  colWidthInput: string;
  setColWidthInput: (val: string) => void;
  rowHeightInput: string;
  setRowHeightInput: (val: string) => void;
  addRow: (pos: "above" | "below") => void;
  addCol: (pos: "left" | "right") => void;
  deleteRow: () => void;
  deleteCol: () => void;
  setCellBgColor: (color: string) => void;
  applyColumnWidth: () => void;
  applyRowHeight: () => void;
  onClose: () => void;
}

export default function TableToolbar({
  showTableToolbar,
  activeCell,
  toolbarPos,
  showCellColorPicker,
  setShowCellColorPicker,
  cellColor,
  colWidthInput,
  setColWidthInput,
  rowHeightInput,
  setRowHeightInput,
  addRow,
  addCol,
  deleteRow,
  deleteCol,
  setCellBgColor,
  applyColumnWidth,
  applyRowHeight,
  onClose,
}: TableToolbarProps) {
  if (!showTableToolbar || !activeCell) return null;

  return (
    <div
      className="doca-table-toolbar"
      style={{ top: toolbarPos.top + "px", left: toolbarPos.left + "px" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Row controls */}
      <div className="doca-toolbar-group">
        <button
          type="button"
          onClick={() => addRow("above")}
          title="Tambah Baris di Atas"
          className="doca-toolbar-btn"
        >
          <ArrowUp className="w-3 h-3" />
          <Plus className="w-2.5 h-2.5" />
        </button>
        <button
          type="button"
          onClick={() => addRow("below")}
          title="Tambah Baris di Bawah"
          className="doca-toolbar-btn"
        >
          <ArrowDown className="w-3 h-3" />
          <Plus className="w-2.5 h-2.5" />
        </button>
        <button
          type="button"
          onClick={deleteRow}
          title="Hapus Baris"
          className="doca-toolbar-btn doca-toolbar-btn-danger"
        >
          <Trash2 className="w-3 h-3" />
          <span className="text-[8px] font-semibold">Baris</span>
        </button>
      </div>

      <div className="doca-toolbar-divider" />

      {/* Column controls */}
      <div className="doca-toolbar-group">
        <button
          type="button"
          onClick={() => addCol("left")}
          title="Tambah Kolom di Kiri"
          className="doca-toolbar-btn"
        >
          <ArrowLeft className="w-3 h-3" />
          <Plus className="w-2.5 h-2.5" />
        </button>
        <button
          type="button"
          onClick={() => addCol("right")}
          title="Tambah Kolom di Kanan"
          className="doca-toolbar-btn"
        >
          <ArrowRight className="w-3 h-3" />
          <Plus className="w-2.5 h-2.5" />
        </button>
        <button
          type="button"
          onClick={deleteCol}
          title="Hapus Kolom"
          className="doca-toolbar-btn doca-toolbar-btn-danger"
        >
          <Trash2 className="w-3 h-3" />
          <span className="text-[8px] font-semibold">Kolom</span>
        </button>
      </div>

      <div className="doca-toolbar-divider" />

      {/* Color picker */}
      <div className="doca-toolbar-group relative">
        <button
          type="button"
          onClick={() => setShowCellColorPicker(!showCellColorPicker)}
          title="Warna Cell"
          className="doca-toolbar-btn"
        >
          <Paintbrush className="w-3 h-3" />
          <div
            className="w-3 h-3 rounded border border-coral-300"
            style={{ backgroundColor: cellColor || "#ffffff" }}
          />
        </button>

        {showCellColorPicker && (
          <div className="doca-table-color-picker-panel">
            <div className="doca-color-presets">
              {CELL_COLOR_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.value || "none"}
                  className={`doca-color-swatch ${cellColor === preset.value ? "active" : ""}`}
                  style={{ backgroundColor: preset.value || "#ffffff" }}
                  onClick={() => {
                    setCellBgColor(preset.value);
                    setShowCellColorPicker(false);
                  }}
                  title={preset.name}
                >
                  {!preset.value && <X className="w-2.5 h-2.5 text-coral-400" />}
                </button>
              ))}
            </div>
            <div className="doca-color-custom">
              <label>Custom:</label>
              <input
                type="color"
                value={cellColor || "#ffffff"}
                onChange={(e) => setCellBgColor(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="doca-toolbar-divider" />

      {/* Size controls */}
      <div className="doca-toolbar-group">
        <div className="doca-toolbar-size-input">
          <label>W</label>
          <input
            type="text"
            placeholder="auto"
            value={colWidthInput}
            onChange={(e) => setColWidthInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyColumnWidth();
            }}
          />
          <button
            type="button"
            onClick={applyColumnWidth}
            className="doca-toolbar-size-apply"
            title="Terapkan Lebar Kolom"
          >
            ✓
          </button>
        </div>
        <div className="doca-toolbar-size-input">
          <label>H</label>
          <input
            type="text"
            placeholder="auto"
            value={rowHeightInput}
            onChange={(e) => setRowHeightInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyRowHeight();
            }}
          />
          <button
            type="button"
            onClick={applyRowHeight}
            className="doca-toolbar-size-apply"
            title="Terapkan Tinggi Baris"
          >
            ✓
          </button>
        </div>
      </div>

      {/* Close button */}
      <button type="button" onClick={onClose} className="doca-toolbar-close" title="Tutup">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
