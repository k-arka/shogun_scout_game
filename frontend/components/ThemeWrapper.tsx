"use client";
/**
 * ThemeWrapper — reads ?theme from URL via nuqs,
 * applies the correct CSS class to the body element.
 */
import { useEffect, useState } from "react";
import { useQueryState } from "nuqs";

const VALID_THEMES = [
  "nature-mist",
  "lantern-dusk",
  "cyber-smoke",
  "castle-shadows",
] as const;

type Theme = (typeof VALID_THEMES)[number];

const THEME_CLASSES = VALID_THEMES.map((t) => `theme-${t}`);

export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme] = useQueryState("theme");
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

  const resolvedTheme: Theme = (
    previewTheme || (VALID_THEMES.includes(theme as Theme) ? theme : "lantern-dusk")
  ) as Theme;

  useEffect(() => {
    // Listen for theme preview events from pages (e.g. War Room hover)
    const handlePreview = (e: any) => setPreviewTheme(e.detail);
    window.addEventListener("shogun-theme-preview" as any, handlePreview);
    return () => window.removeEventListener("shogun-theme-preview" as any, handlePreview);
  }, []);

  useEffect(() => {
    const body = document.body;
    // Remove any existing theme classes
    THEME_CLASSES.forEach((cls) => body.classList.remove(cls));
    // Apply the current one
    body.classList.add(`theme-${resolvedTheme}`);
  }, [resolvedTheme]);

  return <>{children}</>;
}
