import { useEffect, useMemo, useRef, useState } from "react";
import { searchLocations } from "../api/weather";

const GEO_ID = "__geo__";

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

    onAddCity(value);
    setInputValue("");
    setIsOpen(false);
    setSuggestions([]);
  };

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
        // ignore
      }
    }, 350);

    return () => clearTimeout(t);
  }, [inputValue]);

  function pickSuggestion(item) {
    const q = `${item.lat},${item.lon}`;
    onAddCity(q);

    setInputValue("");
    setIsOpen(false);
    setSuggestions([]);
  }

  // GEO + cities together, selected first
  const orderedItems = useMemo(() => {
    const geoItem = {
      kind: "geo",
      id: GEO_ID,
      name: "Моя поточна геопозиція",
      country: "GPS",
      onClick: onSelectGeo,
    };

    const cityItems = cities.map((c) => ({
      kind: "city",
      id: c.id,
      name: c.name,
      country: c.country,
      onClick: () => onSelectCity(c.id),
    }));

    const all = [geoItem, ...cityItems];

    const selected = all.find((x) => x.id === selectedCityId);
    const rest = all.filter((x) => x.id !== selectedCityId);

    return selected ? [selected, ...rest] : all;
  }, [cities, selectedCityId, onSelectCity, onSelectGeo]);

  return (
    <aside className="sidebar">
      <div className="brandRow">
        <div className="brandText">OUR Wea:)ther</div>
      </div>

      <form onSubmit={handleSubmit} className="searchForm" autoComplete="off">
        <div className="searchPill">
          <span className="searchIcon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="text"
            className="searchInput"
            placeholder="Пошук міста ..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              if (suggestions.length) setIsOpen(true);
            }}
            onBlur={() => {
              setTimeout(() => setIsOpen(false), 120);
            }}
          />
        </div>

        {isOpen && suggestions.length > 0 && (
          <div className="suggestionsGlass">
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

      <div className="sidebarGlass">
        <div className="cityList">
          {orderedItems.map((item) => {
            const active = item.id === selectedCityId;
            const isGeo = item.kind === "geo";

            return (
              <button
                key={item.id}
                type="button"
                className={`cityPill ${active ? "isActive" : ""}`}
                onClick={item.onClick}
              >
                <div className="pillMeta">
                  <span className="pillCountry">
                    {isGeo ? "GPS" : String(item.country || "").toUpperCase()}
                  </span>
                  <span className="pillName">
                    {isGeo ? "📍 " : ""}
                    {item.name}
                  </span>
                </div>

                {isGeo && <span className="gpsMark" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
