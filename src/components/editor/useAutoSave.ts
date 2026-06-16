import React, { useState, useEffect, useRef } from "react";
import { Topic } from "../../types";

export function useAutoSave(
  activeTopic: Topic,
  onSave: (content: string) => void,
  isSourceMode: boolean,
  editorRef: React.RefObject<HTMLDivElement | null>
) {
  const [saveStatus, setSaveStatus] = useState<"clean" | "dirty" | "saving" | "saved">("clean");
  const [sourceCode, setSourceCode] = useState(activeTopic.content || "");

  const lastSavedContentRef = useRef<string>(activeTopic.content || "");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTopicIdRef = useRef<string>(activeTopic.id);

  // Sync content when topic changes
  useEffect(() => {
    if (currentTopicIdRef.current !== activeTopic.id) {
      setSourceCode(activeTopic.content || "");
      lastSavedContentRef.current = activeTopic.content || "";
      currentTopicIdRef.current = activeTopic.id;
      setSaveStatus("clean");
    }
  }, [activeTopic.id, activeTopic.content]);

  // Debounced auto-save trigger
  const triggerAutoSave = (content: string) => {
    setSaveStatus("dirty");
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (content === lastSavedContentRef.current) {
        setSaveStatus("clean");
        return;
      }

      setSaveStatus("saving");
      try {
        await onSave(content);
        lastSavedContentRef.current = content;
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("clean"), 3000);
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("dirty");
      }
    }, 2000);
  };

  const manualSave = async () => {
    const content = isSourceMode ? sourceCode : editorRef.current?.innerHTML || "";
    setSaveStatus("saving");
    try {
      await onSave(content);
      lastSavedContentRef.current = content;
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("clean"), 3000);
    } catch (err) {
      console.error("Manual save failed:", err);
      setSaveStatus("dirty");
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    setSaveStatus,
    sourceCode,
    setSourceCode,
    triggerAutoSave,
    manualSave,
    lastSavedContentRef,
  };
}
