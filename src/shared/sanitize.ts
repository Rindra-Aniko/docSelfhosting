import DOMPurify from "dompurify";

// Configure DOMPurify hooks
// We add a hook to restrict iframes only to YouTube and Vimeo domains
DOMPurify.addHook("uponSanitizeElement", (node, data) => {
  if (data.tagName === "iframe" && node instanceof Element) {
    const src = node.getAttribute("src") || "";
    // Allow YouTube and Vimeo embed domains only
    const isYouTube = src.startsWith("https://www.youtube.com/") || src.startsWith("https://youtube.com/");
    const isVimeo = src.startsWith("https://player.vimeo.com/") || src.startsWith("https://vimeo.com/");
    
    if (!isYouTube && !isVimeo) {
      node.remove();
    }
  }
});

/**
 * Sanitizes an HTML string to prevent XSS attacks while preserving
 * allowed tags and attributes for the DocaCMS editor and public view.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow", 
      "allowfullscreen", 
      "frameborder", 
      "scrolling", 
      "contenteditable", 
      "data-video-url", 
      "data-video-width", 
      "data-video-height", 
      "data-video-align-h",
      "data-video-frame",
      "data-audio-url", 
      "data-resolved-url",
      "data-audio-width",
      "data-audio-align-h",
      "data-audio-frame",
      "data-img-url",
      "data-img-width",
      "data-img-align",
      "data-img-height",
      "data-img-align-h",
      "data-img-align-v",
      "data-img-frame"
    ],
  });
}
