import React, { useState, useEffect, useRef } from "react";

export function useTableEditor(
  editorRef: React.RefObject<HTMLDivElement | null>,
  isSourceMode: boolean,
  execCommand: (command: string, value?: string) => void,
  handleEditorInput: () => void,
  saveSelection: () => void,
  restoreSelection: () => void
) {
  // Table dialog state
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [gridHoverRow, setGridHoverRow] = useState(0);
  const [gridHoverCol, setGridHoverCol] = useState(0);
  const [manualRows, setManualRows] = useState(3);
  const [manualCols, setManualCols] = useState(3);

  // Table floating toolbar state
  const [showTableToolbar, setShowTableToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [activeCell, setActiveCell] = useState<HTMLTableCellElement | null>(null);
  const [showCellColorPicker, setShowCellColorPicker] = useState(false);
  const [cellColor, setCellColor] = useState("");
  const [colWidthInput, setColWidthInput] = useState("");
  const [rowHeightInput, setRowHeightInput] = useState("");

  // Column drag-resize refs
  const isResizingRef = useRef(false);
  const resizeInfoRef = useRef({
    colIndex: -1,
    table: null as HTMLTableElement | null,
    startX: 0,
    startWidth: 0,
  });

  const openTableDialog = () => {
    if (isSourceMode) return;
    saveSelection();
    setShowTableDialog(true);
    setGridHoverRow(0);
    setGridHoverCol(0);
    setManualRows(3);
    setManualCols(3);
  };

  const insertTableWithSize = (rows: number, cols: number) => {
    if (isSourceMode || rows < 1 || cols < 1) return;

    let headerRow = '<tr class="bg-coral-100">';
    for (let c = 0; c < cols; c++) {
      headerRow += `<th class="border border-coral-200 p-2 text-left" style="min-width:60px;">Header ${c + 1}</th>`;
    }
    headerRow += "</tr>";

    let bodyRows = "";
    const dataRows = Math.max(rows - 1, 1);
    for (let r = 0; r < dataRows; r++) {
      bodyRows += "<tr>";
      for (let c = 0; c < cols; c++) {
        bodyRows += `<td class="border border-coral-200 p-2" style="min-width:60px;">&nbsp;</td>`;
      }
      bodyRows += "</tr>";
    }

    const tableHtml = `<table class="w-full border-collapse border border-coral-200 my-4 text-sm font-sans" contenteditable="true"><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table><p>&nbsp;</p>`;

    restoreSelection();
    execCommand("insertHTML", tableHtml);
    setShowTableDialog(false);
  };

  const getTableInfo = (cell: HTMLTableCellElement) => {
    const row = cell.parentElement as HTMLTableRowElement;
    const table = cell.closest("table") as HTMLTableElement;
    return { row, table, cellIndex: cell.cellIndex, rowIndex: row.rowIndex };
  };

  const addRow = (position: "above" | "below") => {
    if (!activeCell) return;
    const { row, table } = getTableInfo(activeCell);
    const colCount = row.cells.length;

    const newRow = document.createElement("tr");
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement("td");
      td.className = "border border-coral-200 p-2";
      td.style.minWidth = "60px";
      td.innerHTML = "&nbsp;";
      newRow.appendChild(td);
    }

    if (position === "below") {
      row.after(newRow);
    } else {
      if (row.parentElement?.tagName === "THEAD") {
        const tbody = table.querySelector("tbody");
        if (tbody && tbody.firstChild) {
          tbody.insertBefore(newRow, tbody.firstChild);
        } else if (tbody) {
          tbody.appendChild(newRow);
        }
      } else {
        row.before(newRow);
      }
    }
    handleEditorInput();
  };

  const addCol = (position: "left" | "right") => {
    if (!activeCell) return;
    const { table, cellIndex } = getTableInfo(activeCell);

    Array.from(table.rows).forEach((row) => {
      const referenceCell = row.cells[cellIndex];
      if (!referenceCell) return;

      const isHeader = row.parentElement?.tagName === "THEAD";
      const newCell = document.createElement(isHeader ? "th" : "td");
      newCell.className = referenceCell.className;
      newCell.style.minWidth = "60px";
      newCell.innerHTML = isHeader ? "Header" : "&nbsp;";

      if (position === "right") {
        referenceCell.after(newCell);
      } else {
        referenceCell.before(newCell);
      }
    });
    handleEditorInput();
  };

  const deleteRow = () => {
    if (!activeCell) return;
    const { row, table } = getTableInfo(activeCell);
    if (table.rows.length <= 2) return;

    row.remove();
    setShowTableToolbar(false);
    setActiveCell(null);
    handleEditorInput();
  };

  const deleteCol = () => {
    if (!activeCell) return;
    const { table, cellIndex } = getTableInfo(activeCell);
    if (table.rows[0]?.cells.length <= 1) return;

    Array.from(table.rows).forEach((row) => {
      if (row.cells[cellIndex]) {
        row.cells[cellIndex].remove();
      }
    });
    setShowTableToolbar(false);
    setActiveCell(null);
    handleEditorInput();
  };

  const setCellBgColor = (color: string) => {
    if (!activeCell) return;
    activeCell.style.backgroundColor = color;
    setCellColor(color);
    handleEditorInput();
  };

  const applyColumnWidth = () => {
    if (!activeCell || !colWidthInput) return;
    const { table, cellIndex } = getTableInfo(activeCell);
    Array.from(table.rows).forEach((row) => {
      if (row.cells[cellIndex]) {
        row.cells[cellIndex].style.width = colWidthInput;
        row.cells[cellIndex].style.minWidth = colWidthInput;
      }
    });
    handleEditorInput();
  };

  const applyRowHeight = () => {
    if (!activeCell || !rowHeightInput) return;
    const { row } = getTableInfo(activeCell);
    row.style.height = rowHeightInput;
    handleEditorInput();
  };

  // Click handler for Table Cell selection
  useEffect(() => {
    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cell = target.closest("td, th") as HTMLTableCellElement;
      if (cell && editorRef.current?.contains(cell)) {
        const table = cell.closest("table") as HTMLTableElement;
        if (table) {
          setActiveCell(cell);
          setCellColor(cell.style.backgroundColor || "");
          setColWidthInput(cell.style.width || cell.style.minWidth || "");
          const row = cell.parentElement as HTMLTableRowElement;
          setRowHeightInput(row?.style.height || "");

          const tableRect = table.getBoundingClientRect();
          setToolbarPos({
            top: Math.max(8, tableRect.top - 46),
            left: Math.max(8, Math.min(tableRect.left, window.innerWidth - 520)),
          });

          setShowTableToolbar(true);
          setShowCellColorPicker(false);
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
  }, [editorRef, handleEditorInput]);

  // Column drag-resize
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cell = target.closest("td, th") as HTMLTableCellElement;
      if (!cell || !editor.contains(cell)) return;

      const rect = cell.getBoundingClientRect();
      const nearRightBorder = e.clientX > rect.right - 6;

      if (nearRightBorder) {
        e.preventDefault();
        e.stopPropagation();
        const table = cell.closest("table") as HTMLTableElement;

        isResizingRef.current = true;
        resizeInfoRef.current = {
          colIndex: cell.cellIndex,
          table,
          startX: e.clientX,
          startWidth: cell.offsetWidth,
        };
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingRef.current) {
        const { colIndex, table, startX, startWidth } = resizeInfoRef.current;
        if (!table) return;

        const delta = e.clientX - startX;
        const newWidth = Math.max(40, startWidth + delta);

        Array.from(table.rows).forEach((row: HTMLTableRowElement) => {
          if (row.cells[colIndex]) {
            row.cells[colIndex].style.width = newWidth + "px";
            row.cells[colIndex].style.minWidth = newWidth + "px";
          }
        });
        return;
      }

      const target = e.target as HTMLElement;
      const cell = target.closest("td, th") as HTMLTableCellElement;
      if (cell && editor.contains(cell)) {
        const rect = cell.getBoundingClientRect();
        if (e.clientX > rect.right - 6) {
          cell.style.cursor = "col-resize";
        } else {
          cell.style.cursor = "";
        }
      }
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        resizeInfoRef.current = { colIndex: -1, table: null, startX: 0, startWidth: 0 };
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        handleEditorInput();
      }
    };

    editor.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      editor.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [editorRef, handleEditorInput]);

  // Close toolbar when clicking outside
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        showTableToolbar &&
        !target.closest(".doca-table-toolbar") &&
        !target.closest(".doca-table-color-picker-panel") &&
        !target.closest("td") &&
        !target.closest("th")
      ) {
        setShowTableToolbar(false);
        setActiveCell(null);
        setShowCellColorPicker(false);
      }

      if (showTableDialog && !target.closest(".doca-table-dialog")) {
        setShowTableDialog(false);
      }
    };

    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [showTableToolbar, showTableDialog]);

  // Reposition toolbar on scroll
  useEffect(() => {
    const editorBody = document.getElementById("editor-body");
    if (!editorBody || !showTableToolbar || !activeCell) return;

    const updatePos = () => {
      const table = activeCell.closest("table");
      if (!table) {
        setShowTableToolbar(false);
        return;
      }
      const tableRect = table.getBoundingClientRect();
      const bodyRect = editorBody.getBoundingClientRect();

      if (tableRect.bottom < bodyRect.top || tableRect.top > bodyRect.bottom) {
        setShowTableToolbar(false);
        setActiveCell(null);
        return;
      }

      setToolbarPos({
        top: Math.max(8, tableRect.top - 46),
        left: Math.max(8, Math.min(tableRect.left, window.innerWidth - 520)),
      });
    };

    editorBody.addEventListener("scroll", updatePos);
    window.addEventListener("resize", updatePos);
    return () => {
      editorBody.removeEventListener("scroll", updatePos);
      window.removeEventListener("resize", updatePos);
    };
  }, [showTableToolbar, activeCell]);

  return {
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
    setToolbarPos,
    activeCell,
    setActiveCell,
    showCellColorPicker,
    setShowCellColorPicker,
    cellColor,
    setCellColor,
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
  };
}
