import { useState } from "react";

const GEO_ID = "__geo__";

export default function Sidebar({
  cities,
  selectedCityId,
  onSelectCity,
  onAddCity,
  onSelectGeo,
  onRemoveCity,
  themeMode,
  onThemeChange,
}) {
  const [q, setQ] = useState("");

  function submit(e) {
    e.preventDefault();

    const value = q.trim();
    if (!value) return;

    onAddCity(value);
    setQ("");
  }

  function removeCity(e, id) {
    e.stopPropagation();
    onRemoveCity(id);
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
            className={`cityPill ${
              selectedCityId === GEO_ID ? "isActive" : ""
            }`}
            onClick={onSelectGeo}
            type="button"
          >
            <div className="pillMeta">
              <div className="pillCountry">GEO</div>
              <div className="pillName">Моя геолокація</div>
            </div>

            <span className="gpsMark" />
          </button>

          {cities.map((city) => (
            <button
              key={city.id}
              className={`cityPill ${
                selectedCityId === city.id ? "isActive" : ""
              }`}
              onClick={() => onSelectCity(city.id)}
              type="button"
            >
              <div className="pillMeta">
                <div className="pillCountry">{city.country}</div>
                <div className="pillName">{city.name}</div>
              </div>

              <span
                className="removeCityBtn"
                onClick={(e) => removeCity(e, city.id)}
                role="button"
                tabIndex={0}
                aria-label={`Видалити ${city.name}`}
              >
                ×
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
