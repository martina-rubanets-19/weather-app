export default function ThemeToggle({ value, onChange }) {
  return (
    <div className="themeToggle" role="group" aria-label="Theme">
      <button
        type="button"
        className={`themeBtn ${value === "light" ? "active" : ""}`}
        aria-pressed={value === "light"}
        onClick={() => onChange("light")}
      >
        Light
      </button>

      <button
        type="button"
        className={`themeBtn ${value === "system" ? "active" : ""}`}
        aria-pressed={value === "system"}
        onClick={() => onChange("system")}
      >
        System
      </button>

      <button
        type="button"
        className={`themeBtn ${value === "dark" ? "active" : ""}`}
        aria-pressed={value === "dark"}
        onClick={() => onChange("dark")}
      >
        Dark
      </button>
    </div>
  );
}
