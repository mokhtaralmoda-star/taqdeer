import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

const RELEASE = "20261116-r1";

export default function Home() {
  const [, navigate] = useLocation();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const src = `/original/ar/home.html?v=${RELEASE}`;

  useEffect(() => {
    const prev = { b: document.body.style.overflow, h: document.documentElement.style.overflow };
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev.b;
      document.documentElement.style.overflow = prev.h;
    };
  }, []);

  const handleLoad = () => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    doc.addEventListener("click", (event) => {
      const anchor = (event.target as HTMLElement)?.closest?.("a");
      const href = anchor?.getAttribute("href") || "";
      if (!href || href.startsWith("#") || /^https?:/.test(href)) return;
      event.preventDefault();
      navigate(href.replace(/^\/en(?=\/|$)/, "") || "/");
    });
  };

  return (
    <iframe
      ref={frameRef}
      src={src}
      onLoad={handleLoad}
      title="تقدير"
      sandbox="allow-scripts allow-same-origin allow-popups"
      style={{ display: "block", width: "100%", height: "100dvh", border: 0 }}
    />
  );
}