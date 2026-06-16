import { useState, useEffect } from "react";
import { AlignLeft, ChevronRight, Hash } from "lucide-react";

interface HeadingItem {
  id: string; // generated client-side id
  text: string;
  level: "h2" | "h3";
}

interface SidebarRightProps {
  content: string;
}

export default function SidebarRight({ content }: SidebarRightProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  useEffect(() => {
    // Parse H2 and H3 headings from pure HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content || "", "text/html");
    const headingElements = doc.querySelectorAll("h2, h3");

    const items: HeadingItem[] = [];
    headingElements.forEach((el, index) => {
      const text = el.textContent || "";
      if (text.trim()) {
        items.push({
          id: `heading-link-${index}-${text.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          text: text.trim(),
          level: el.tagName.toLowerCase() as "h2" | "h3",
        });
      }
    });

    setHeadings(items);
  }, [content]);

  const scrollToHeading = (text: string) => {
    // Find all h2 and h3 elements inside the active viewport context (excluding sidebars)
    const container =
      document.getElementById("editor-body") ||
      document.getElementById("public-reading-article") ||
      document.getElementById("main-content");
    if (!container) return;

    const query = container.querySelectorAll("h2, h3");
    let targetElement: Element | null = null;

    for (let i = 0; i < query.length; i++) {
      if (query[i].textContent?.trim() === text) {
        targetElement = query[i];
        break;
      }
    }

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Flash animation on element to highlight
      targetElement.classList.add(
        "ring-4",
        "ring-coral-800/20",
        "rounded-md",
        "transition-all",
        "duration-1000"
      );
      setTimeout(() => {
        targetElement?.classList.remove("ring-4", "ring-coral-800/20");
      }, 1500);
    }
  };

  if (headings.length === 0) {
    return (
      <div
        className="w-full bg-coral-50 border border-coral-200/60 rounded-xl p-5 text-center text-coral-400 font-sans"
        id="outline-empty"
      >
        <AlignLeft className="w-5 h-5 mx-auto mb-2 text-coral-300" />
        <p className="text-xs">Tidak ada sub-pembahasan (H2/H3) di artikel ini.</p>
      </div>
    );
  }

  return (
    <div className="w-full" id="outline-navigation">
      <div className="flex items-center gap-1.5 px-1 mb-4">
        <Hash className="w-4 h-4 text-coral-500" />
        <h4 className="text-xs font-bold text-coral-700 tracking-wider uppercase">On This Page</h4>
      </div>

      <nav className="space-y-1.5 border-l border-coral-200 pl-3">
        {headings.map((h, i) => (
          <button
            key={i}
            onClick={() => scrollToHeading(h.text)}
            className={`w-full text-left text-xs transition-colors hover:text-coral-700 block py-1 font-sans ${
              h.level === "h2"
                ? "text-coral-600 font-medium pl-0"
                : "text-coral-500 pl-3 border-l border-transparent hover:border-coral-600"
            }`}
          >
            <div className="flex items-start gap-1">
              {h.level === "h3" && (
                <ChevronRight className="w-3 h-3 text-coral-300 mt-0.5 flex-shrink-0" />
              )}
              <span className="whitespace-normal break-words leading-tight">{h.text}</span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
}
