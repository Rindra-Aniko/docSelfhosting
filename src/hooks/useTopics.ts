import { useState, useEffect, useCallback, useRef } from "react";
import { Topic } from "../types";

export function useTopics(
  activeDocId: string | null,
  token: string | null,
  authHeaders: any,
  onError?: (msg: string) => void
) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const activeTopicIdRef = useRef(activeTopicId);
  useEffect(() => {
    activeTopicIdRef.current = activeTopicId;
  }, [activeTopicId]);

  const fetchTopics = useCallback(
    async (docId: string) => {
      setLoadingTopics(true);
      try {
        const res = await fetch(`/api/documentations/${docId}/topics`);
        if (!res.ok) throw new Error("Gagal mengambil menu sidebar topics");
        const data = await res.json();
        setTopics(data);

        // Select the first parent topic if one exists and current activeTopicId is not valid
        if (data.length > 0) {
          const currentActiveExists = data.some((t) => t.id === activeTopicIdRef.current);
          if (!currentActiveExists) {
            const sorted = [...data].sort((a, b) => a.sort_order - b.sort_order);
            const first = sorted.find((t) => t.parent_id === null) || sorted[0];
            setActiveTopicId(first.id);
          }
        } else {
          setActiveTopicId(null);
        }
      } catch (err: any) {
        console.error(err);
        if (onError) {
          onError("Koneksi gagal saat meload bagan topik");
        }
      } finally {
        setLoadingTopics(false);
      }
    },
    [onError]
  );

  // Fetch topics whenever active documentation project changes
  useEffect(() => {
    if (activeDocId) {
      fetchTopics(activeDocId);
    } else {
      setTopics([]);
      setActiveTopicId(null);
    }
  }, [activeDocId, fetchTopics]);

  const handleAddTopic = async (title: string, parentId: string | null) => {
    if (!activeDocId) return;
    if (!token) return alert("Anda harus login.");

    // Auto-generate safe slug
    const slug =
      title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 6);

    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          documentation_id: activeDocId,
          title,
          slug,
          parent_id: parentId,
          content: `<h2>${title}</h2><p>Mulai menulis dokumentasi di sini menggunakan editor...</p>`,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyisipkan bab struktur");
      const newTopic = await res.json();
      setTopics((prev) => [...prev, newTopic]);
      setActiveTopicId(newTopic.id);
      return newTopic;
    } catch (err: any) {
      alert(err.message || "Gagal menambah topik");
      throw err;
    }
  };

  const handleUpdateTopic = async (id: string, updates: Partial<Topic>) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/topics/${id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Gagal sinkron data perbaikan topik");
      const updated = await res.json();
      setTopics((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const handleSaveTopicContent = async (updatedContent: string) => {
    if (!activeTopicId || !token) return;
    await handleUpdateTopic(activeTopicId, { content: updatedContent });
  };

  const handleDeleteTopic = async (id: string) => {
    if (!token) return alert("Akses ditolak.");
    try {
      const res = await fetch(`/api/topics/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Gagal menghapus materi");

      // Reload topics for this documentation to ensure cascade state matches
      if (activeDocId) {
        await fetchTopics(activeDocId);
      }
    } catch (err: any) {
      alert(err.message || "Gagal melenyapkan materi bab");
      throw err;
    }
  };

  const handleReorderTopics = async (updatedItems: { id: string; sort_order: number }[]) => {
    if (!token) return;
    // 1. Optimistic UI update
    const updatedMap = new Map(updatedItems.map((item) => [item.id, item.sort_order]));
    const optimisticTopics = topics.map((t) => {
      if (updatedMap.has(t.id)) {
        return { ...t, sort_order: updatedMap.get(t.id)! };
      }
      return t;
    });
    setTopics(optimisticTopics);

    // 2. Submit to server
    try {
      const res = await fetch("/api/topics-batch/reorder", {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ topics: updatedItems }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui urutan ke server");
    } catch (err) {
      console.error("Reorder fail, reverting states:", err);
      if (activeDocId) fetchTopics(activeDocId);
    }
  };

  return {
    topics,
    setTopics,
    activeTopicId,
    setActiveTopicId,
    loadingTopics,
    fetchTopics,
    handleAddTopic,
    handleUpdateTopic,
    handleSaveTopicContent,
    handleDeleteTopic,
    handleReorderTopics,
  };
}
