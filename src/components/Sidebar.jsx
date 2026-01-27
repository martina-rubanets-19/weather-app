import { useEffect, useRef, useState } from "react";
import { searchLocations } from "../api/weather";

export default function Sidebar({
  cities,
  selectedCityId,
  onSelectCity,
  onAddCity,
  onSelectGeo,
}) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const abortRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = inputValue.trim();
    if (!value) return;

    onAddCity(value); // додасть тільки якщо локація існує
    setInputValue("");
    setIsOpen(false);
    setSuggestions([]);
  };

  // автокомпліт (debounce + abort)
  useEffect(() => {
    const q = inputValue.trim();

    if (q.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        const res = await searchLocations(q, ctrl.signal);
        setSuggestions(res);
        setIsOpen(true);
      } catch {
        // ignore abort/errors
      }
    }, 350);

    return () => clearTimeout(t);
  }, [inputValue]);

  function pickSuggestion(item) {
    // додаємо по lat,lon (найнадійніше + без дублів)
    const q = `${item.lat},${item.lon}`;
    onAddCity(q);

    setInputValue("");
    setIsOpen(false);
    setSuggestions([]);
  }

  return (
    <aside className="sidebar">
      <div className="sidebarHeader">
        <h1 className="appTitle">Weather</h1>
      </div>

      <form onSubmit={handleSubmit} className="searchForm" autoComplete="off">
        <div className="searchWrapper">
          <span className="searchIcon">🔍</span>
          <input
            type="text"
            className="searchInput"
            placeholder="Пошук міста..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              if (suggestions.length) setIsOpen(true);
            }}
            onBlur={() => {
              // щоб встигнути клікнути по підказці
              setTimeout(() => setIsOpen(false), 120);
            }}
          />
        </div>

        {isOpen && suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((s) => (
              <button
                key={`${s.lat},${s.lon}`}
                type="button"
                className="suggestionItem"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickSuggestion(s)}
              >
                <div className="suggestionTitle">{s.name}</div>
                <div className="suggestionMeta">
                  {[s.region, s.country].filter(Boolean).join(", ")}
                </div>
              </button>
            ))}
          </div>
        )}
      </form>

      <div className="sidebarSectionTitle">Швидко</div>

      <ul className="cityList" style={{ marginBottom: 14 }}>
        <li>
          <button
            type="button"
            className={`cityItem ${selectedCityId === "__geo__" ? "active" : ""}`}
            onClick={onSelectGeo}
          >
            <span className="cityName">📍 Моя поточна геопозиція</span>
            <span className="cityMeta">GPS</span>
          </button>
        </li>
      </ul>

      <div className="sidebarSectionTitle">Міста</div>

      <ul className="cityList">
        {cities.map((c) => {
          const isActive = c.id === selectedCityId;

          return (
            <li key={c.id}>
              <button
                type="button"
                className={`cityItem ${isActive ? "active" : ""}`}
                onClick={() => onSelectCity(c.id)}
              >
                <span className="cityName">{c.name}</span>
                <span className="cityMeta">{c.country}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
