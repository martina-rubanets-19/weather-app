import { useState } from "react";

const GEO_ID = "__geo__";

export default function Sidebar({
  cities,
  selectedCityId,
  onSelectCity,
  onAddCity,
  onSelectGeo,
  themeMode,
  onThemeChange,
}) {
  const [q, setQ] = useState("");

  function submit(e) {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    onAddCity(v);
    setQ("");
  }

  return (
    <aside className="sidebar">
      <div className="brandRow">
        <div className="brandText">OUR Wea:)ther</div>

        <div className="themeToggle">
          <button
            className={`themeBtn ${themeMode === "light" ? "active" : ""}`}
            onClick={() => onThemeChange("light")}
            type="button"
          >
            Light
          </button>
          <button
            className={`themeBtn ${themeMode === "system" ? "active" : ""}`}
            onClick={() => onThemeChange("system")}
            type="button"
          >
            System
          </button>
          <button
            className={`themeBtn ${themeMode === "dark" ? "active" : ""}`}
            onClick={() => onThemeChange("dark")}
            type="button"
          >
            Dark
          </button>
        </div>
      </div>

      <form className="searchForm" onSubmit={submit}>
        <div className="searchPill">
          <div className="searchIcon">⌕</div>
          <input
            className="searchInput"
            placeholder="Пошук міста ..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </form>

      <div className="sidebarGlass">
        <div className="cityList">
          
          <button
            className={`cityPill ${selectedCityId === GEO_ID ? "isActive" : ""}`}
            onClick={onSelectGeo}
            type="button"
          >
            <div className="pillMeta">
              <div className="pillCountry">GEO</div>
              <div className="pillName">Моя геолокація</div>
            </div>
            <span className="gpsMark" />
          </button>

          {cities.map((c) => (
            <button
              key={c.id}
              className={`cityPill ${selectedCityId === c.id ? "isActive" : ""}`}
              onClick={() => onSelectCity(c.id)}
              type="button"
            >
              <div className="pillMeta">
                <div className="pillCountry">{c.country}</div>
                <div className="pillName">{c.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
