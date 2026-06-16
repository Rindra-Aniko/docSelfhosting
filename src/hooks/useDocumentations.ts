import { useState, useEffect } from "react";
import { Documentation } from "../types";

export function useDocumentations(token: string | null, authHeaders: any) {
  const [documentations, setDocumentations] = useState<Documentation[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDocumentations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documentations");
      if (!res.ok) throw new Error("Gagal mengambil daftar dokumentasi");
      const data = await res.json();
      setDocumentations(data);
      if (data.length > 0) {
        setActiveDocId(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal terkoneksi ke backend CMS");
      setLoading(false);
    }
  };

  // Fetch initial documentations from server API
  useEffect(() => {
    fetchDocumentations();
  }, []);

  const handleCreateDoc = async (title: string, description: string) => {
    if (!token) return alert("Anda harus login untuk membuat proyek.");
    try {
      const res = await fetch("/api/documentations", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error("Database error saat mengunggah proyek");
      const newDoc = await res.json();
      setDocumentations((prev) => [...prev, newDoc]);
      setActiveDocId(newDoc.id);
      return newDoc;
    } catch (err: any) {
      alert(err.message || "Gagal membuat proyek");
      throw err;
    }
  };

  const handleUpdateDoc = async (id: string, title: string, description: string) => {
    if (!token) return alert("Akses ditolak.");
    try {
      const res = await fetch(`/api/documentations/${id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error("Gagal sinkron file perbaikan");
      const updated = await res.json();
      setDocumentations((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui judul proyek");
      throw err;
    }
  };

  const handleDeleteDoc = async (id: string, onDeleteSuccess?: () => void) => {
    if (!token) return alert("Akses ditolak.");
    try {
      const res = await fetch(`/api/documentations/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Gagal eliminasi data di database server");

      const filtered = documentations.filter((d) => d.id !== id);
      setDocumentations(filtered);
      if (filtered.length > 0) {
        setActiveDocId(filtered[0].id);
      } else {
        setActiveDocId(null);
      }
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err: any) {
      alert(err.message || "Gagal menghapus proyek pengantar");
      throw err;
    }
  };

  return {
    documentations,
    setDocumentations,
    activeDocId,
    setActiveDocId,
    loading,
    setLoading,
    errorMsg,
    setErrorMsg,
    fetchDocumentations,
    handleCreateDoc,
    handleUpdateDoc,
    handleDeleteDoc,
  };
}
