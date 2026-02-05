import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import WeatherDisplay from "./components/WeatherDisplay";
import ErrorBoundary from "./components/ErrorBoundary";
import { getCurrent, getForecast } from "./api/weather";

const GEO_ID = "__geo__";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function getResolvedTheme(themeMode) {
  if (themeMode === "light" || themeMode === "dark") return themeMode;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function detectThemeClass(data) {
  const text = (data?.current?.condition?.text || "").toLowerCase();
  const code = data?.current?.condition?.code;

  if (text.includes("сніг") || text.includes("snow") || [1066, 1114, 1117].includes(code)) return "snowy-theme";
  if (text.includes("дощ") || text.includes("rain") || [1183, 1186, 1189, 1192, 1195].includes(code)) return "rainy-theme";
  if (text.includes("хмар") || text.includes("cloud") || [1006, 1009].includes(code)) return "cloudy-theme";
  if (text.includes("ясно") || text.includes("sun") || [1000].includes(code)) return "sunny-theme";
  return "";
}

export default function App() {
  const [themeMode, setThemeMode] = useState("system");

  const [cities, setCities] = useState(() => [
    { id: "kyiv", name: "Київ", country: "Ukraine", q: "Kyiv" },
    { id: "lviv", name: "Львів", country: "Ukraine", q: "Lviv" },
    { id: "odesa", name: "Одеса", country: "Ukraine", q: "Odesa" },
    { id: "kharkiv", name: "Харків", country: "Ukraine", q: "Kharkiv" },
    { id: "london", name: "Лондон", country: "UK", q: "London" },
    { id: "paris", name: "Париж", country: "France", q: "Paris" },
    { id: "ny", name: "Нью-Йорк", country: "USA", q: "New York" },
    { id: "tokyo", name: "Токіо", country: "Japan", q: "Tokyo" },
  ]);

  const [selectedCityId, setSelectedCityId] = useState("ny");
  const [geoCoords, setGeoCoords] = useState(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef(null);

  useEffect(() => {
    const html = document.documentElement;

    const apply = () => {
      const resolved = getResolvedTheme(themeMode);
      html.setAttribute("data-theme-mode", themeMode);
      html.setAttribute("data-theme", resolved);
    };

    apply();

    let mql = null;
    const onChange = () => apply();

    if (themeMode === "system" && window.matchMedia) {
      mql = window.matchMedia("(prefers-color-scheme: dark)");
      if (mql.addEventListener) mql.addEventListener("change", onChange);
      else mql.addListener(onChange);
    }

    return () => {
      if (mql) {
        if (mql.removeEventListener) mql.removeEventListener("change", onChange);
        else mql.removeListener(onChange);
      }
    };
  }, [themeMode]);

  async function onSelectGeo() {
    setSelectedCityId(GEO_ID);

    if (!navigator.geolocation) {
      setError("Геолокація недоступна в цьому браузері");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setLoading(false);
        setError("Не вдалося отримати геопозицію.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function onAddCity(q) {
    const value = q.trim();
    if (!value) return;

    const existing = cities.find((c) => c.q.toLowerCase() === value.toLowerCase());
    if (existing) {
      setSelectedCityId(existing.id);
      return;
    }

    try {
      const ctrl = new AbortController();
      const cur = await getCurrent(value, ctrl.signal);

      const newCity = {
        id: uid(),
        name: cur.location?.name || value,
        country: cur.location?.country || "",
        q: `${cur.location?.lat},${cur.location?.lon}`,
      };

      setCities((prev) => [newCity, ...prev]);
      setSelectedCityId(newCity.id);
    } catch (e) {
      setError(e?.message || "Не вдалося додати місто");
    }
  }

  const selectedQ = useMemo(() => {
    if (selectedCityId === GEO_ID) {
      if (!geoCoords) return null;
      return `${geoCoords.lat},${geoCoords.lon}`;
    }
    const c = cities.find((x) => x.id === selectedCityId);
    return c?.q || null;
  }, [selectedCityId, cities, geoCoords]);

  useEffect(() => {
    abortRef.current?.abort();
    setError("");

    if (!selectedQ) return;

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      try {
        setLoading(true);
        const f = await getForecast(selectedQ, 5, ctrl.signal);
        setData(f);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Помилка завантаження погоди");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [selectedQ]);

  const themeClass = useMemo(() => detectThemeClass(data), [data]);

  return (
    <div className={`app ${themeClass}`}>
      <Sidebar
        cities={cities}
        selectedCityId={selectedCityId}
        onSelectCity={setSelectedCityId}
        onAddCity={onAddCity}
        onSelectGeo={onSelectGeo}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
      />

      <main className="main">
        <ErrorBoundary>
          <WeatherDisplay data={data} loading={loading} error={error} />
        </ErrorBoundary>
      </main>
    </div>
  );
}
