import { useState, useEffect } from "preact/hooks";
import { themes } from "../lib/themes";

export default function ThemeSelector() {
  // null while we don't know the theme (prevents SSR/localStorage access)
  const [theme, setTheme] = useState(null);

  // Read saved theme on mount (client only)
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const defaultTheme = "warmVintage";
    const initial = saved || defaultTheme;

    // Apply to document (in case inline loader didn't)
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", initial);
    }

    setTheme(initial);
  }, []);

  // Handler updates data-theme + localStorage
  const handleChange = (e) => {
    const next = e.target.value;
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", next);
    }
    setTheme(next);
  };

  // Don't render until we know the theme (avoids SSR issues and flash)
  if (!theme) return null;

  return (
    <select
      value={theme}
      onChange={handleChange}
      className="px-3 py-1 rounded text-sm font-medium outline-none hover:shadow-md focus:shadow-lg border"
      style={{
        backgroundColor: "hsl(var(--card))",
        color: "hsl(var(--card-foreground))",
        borderColor: "hsl(var(--border))",
        cursor: "pointer",
        appearance: "none",
        paddingRight: "1.5rem",
        minWidth: "140px",
      }}
    >
      {themes.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
