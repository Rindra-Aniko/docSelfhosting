import React from "react";
import { X } from "lucide-react";

interface TableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gridHoverRow: number;
  setGridHoverRow: (r: number) => void;
  gridHoverCol: number;
  setGridHoverCol: (c: number) => void;
  manualRows: number;
  setManualRows: (r: number) => void;
  manualCols: number;
  setManualCols: (c: number) => void;
  onInsertTable: (rows: number, cols: number) => void;
}

export default function TableDialog({
  isOpen,
  onClose,
  gridHoverRow,
  setGridHoverRow,
  gridHoverCol,
  setGridHoverCol,
  manualRows,
  setManualRows,
  manualCols,
  setManualCols,
  onInsertTable,
}: TableDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="doca-table-dialog-overlay" onClick={onClose}>
      <div className="doca-table-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="doca-table-dialog-header">
          <h3>Sisipkan Tabel</h3>
          <button type="button" onClick={onClose} className="doca-table-dialog-close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="doca-table-dialog-body">
          <div className="doca-table-grid-label">
            {gridHoverRow > 0 && gridHoverCol > 0
              ? `${gridHoverRow} × ${gridHoverCol}`
              : "Pilih ukuran tabel"}
          </div>
          <div
            className="doca-table-grid-picker"
            onMouseLeave={() => {
              setGridHoverRow(0);
              setGridHoverCol(0);
            }}
          >
            {Array.from({ length: 8 }, (_, r) => (
              <div key={r} className="doca-table-grid-row">
                {Array.from({ length: 8 }, (_, c) => (
                  <div
                    key={c}
                    className={`doca-table-grid-cell ${
                      r < gridHoverRow && c < gridHoverCol ? "active" : ""
                    }`}
                    onMouseEnter={() => {
                      setGridHoverRow(r + 1);
                      setGridHoverCol(c + 1);
                    }}
                    onClick={() => onInsertTable(r + 1, c + 1)}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="doca-table-manual-separator">
            <span>atau input manual</span>
          </div>
          <div className="doca-table-manual-input">
            <div className="doca-table-manual-field">
              <label>Baris</label>
              <input
                type="number"
                min={1}
                max={50}
                value={manualRows}
                onChange={(e) => setManualRows(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <span className="doca-table-manual-x">×</span>
            <div className="doca-table-manual-field">
              <label>Kolom</label>
              <input
                type="number"
                min={1}
                max={20}
                value={manualCols}
                onChange={(e) => setManualCols(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <button
              type="button"
              className="doca-table-manual-btn"
              onClick={() => onInsertTable(manualRows, manualCols)}
            >
              Sisipkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
