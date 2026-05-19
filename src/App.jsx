import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import WeatherDisplay from "./components/WeatherDisplay";
import ErrorBoundary from "./components/ErrorBoundary";
import Auth from "./components/Auth";
import { getCurrent, getForecast } from "./api/weather";
import { auth, onAuthStateChanged } from "./firebase";

const GEO_ID = "__geo__";
const CITIES_KEY = "weather-app-cities";
const THEME_KEY = "weather-app-theme";

const DEFAULT_CITIES = [
  { id: "kyiv", name: "Київ", country: "Ukraine", q: "Kyiv" },
  { id: "lviv", name: "Львів", country: "Ukraine", q: "Lviv" },
  { id: "odesa", name: "Одеса", country: "Ukraine", q: "Odesa" },
  { id: "kharkiv", name: "Харків", country: "Ukraine", q: "Kharkiv" },
  { id: "london", name: "Лондон", country: "UK", q: "London" },
  { id: "paris", name: "Париж", country: "France", q: "Paris" },
  { id: "ny", name: "Нью-Йорк", country: "USA", q: "New York" },
  { id: "tokyo", name: "Токіо", country: "Japan", q: "Tokyo" },
];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function getCitiesKey(user) {
  return user?.uid ? `${CITIES_KEY}-${user.uid}` : CITIES_KEY;
}

function loadSavedCities(user) {
  try {
    const saved = localStorage.getItem(getCitiesKey(user));
    return saved ? JSON.parse(saved) : DEFAULT_CITIES;
  } catch {
    return DEFAULT_CITIES;
  }
}

function getSavedTheme() {
  return localStorage.getItem(THEME_KEY) || "system";
}

function getResolvedTheme(themeMode) {
  if (themeMode === "light" || themeMode === "dark") return themeMode;

  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function detectThemeClass(data) {
  const text = (data?.current?.condition?.text || "").toLowerCase();
  const code = data?.current?.condition?.code;

  if (
    text.includes("сніг") ||
    text.includes("snow") ||
    [1066, 1114, 1117].includes(code)
  ) {
    return "snowy-theme";
  }

  if (
    text.includes("дощ") ||
    text.includes("rain") ||
    [1183, 1186, 1189, 1192, 1195].includes(code)
  ) {
    return "rainy-theme";
  }

  if (
    text.includes("хмар") ||
    text.includes("cloud") ||
    [1006, 1009].includes(code)
  ) {
    return "cloudy-theme";
  }

  if (
    text.includes("ясно") ||
    text.includes("sun") ||
    [1000].includes(code)
  ) {
    return "sunny-theme";
  }

  return "";
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [themeMode, setThemeMode] = useState(getSavedTheme);
  const [cities, setCities] = useState(DEFAULT_CITIES);

  const [selectedCityId, setSelectedCityId] = useState(null);
  const [geoCoords, setGeoCoords] = useState(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCities(loadSavedCities(currentUser));
      setSelectedCityId(null);
      setGeoCoords(null);
      setData(null);
      setError("");
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    localStorage.setItem(getCitiesKey(user), JSON.stringify(cities));
  }, [cities, user, authReady]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeMode);
  }, [themeMode]);

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

  function onSelectCity(id) {
    setSelectedCityId(id);
    setGeoCoords(null);
    setData(null);
    setError("");
  }

  function onRemoveCity(id) {
    setCities((prev) => prev.filter((city) => city.id !== id));

    if (selectedCityId === id) {
      setSelectedCityId(null);
      setGeoCoords(null);
      setData(null);
      setError("");
    }
  }

  function onSelectGeo() {
    if (!navigator.geolocation) {
      setSelectedCityId(null);
      setGeoCoords(null);
      setData(null);
      setError("Геолокація недоступна в цьому браузері");
      return;
    }

    setSelectedCityId(GEO_ID);
    setGeoCoords(null);
    setData(null);
    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lon = Number(pos.coords.longitude.toFixed(5));
        setGeoCoords({ lat, lon });
      },
      (geoError) => {
        setSelectedCityId(null);
        setGeoCoords(null);
        setData(null);
        setLoading(false);

        if (geoError.code === 1) {
          setError("Доступ до геолокації заборонено. Дозволь Location для Chrome.");
          return;
        }

        if (geoError.code === 2) {
          setError("Не вдалося визначити місцезнаходження. Спробуй ще раз.");
          return;
        }

        if (geoError.code === 3) {
          setError("Геолокація занадто довго визначалась. Спробуй ще раз.");
          return;
        }

        setError("Не вдалося отримати геопозицію.");
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  }

  async function onAddCity(q) {
    const value = q.trim();

    if (!value) return;

    const existing = cities.find(
      (city) =>
        city.name.toLowerCase() === value.toLowerCase() ||
        city.q.toLowerCase() === value.toLowerCase()
    );

    if (existing) {
      onSelectCity(existing.id);
      return;
    }

    try {
      setLoading(true);
      setError("");

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
      setGeoCoords(null);
      setData(null);
    } catch (e) {
      setSelectedCityId(null);
      setGeoCoords(null);
      setData(null);
      setError(e?.message || "Не вдалося додати місто");
    } finally {
      setLoading(false);
    }
  }

  const selectedQ = useMemo(() => {
    if (selectedCityId === GEO_ID) {
      if (!geoCoords) return null;
      return `${geoCoords.lat},${geoCoords.lon}`;
    }

    const city = cities.find((item) => item.id === selectedCityId);
    return city?.q || null;
  }, [selectedCityId, cities, geoCoords]);

  useEffect(() => {
    abortRef.current?.abort();
    setError("");

    if (!selectedQ) {
      setData(null);
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    async function loadWeather() {
      try {
        setLoading(true);
        const forecast = await getForecast(selectedQ, 5, ctrl.signal);
        setData(forecast);
      } catch (e) {
        if (e?.name === "AbortError") return;

        setError(e?.message || "Помилка завантаження погоди");
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    loadWeather();

    return () => ctrl.abort();
  }, [selectedQ]);

  const themeClass = useMemo(() => detectThemeClass(data), [data]);

  return (
    <div className={`app ${themeClass}`}>
      <Auth user={user} />

      <Sidebar
        cities={cities}
        selectedCityId={selectedCityId}
        onSelectCity={onSelectCity}
        onAddCity={onAddCity}
        onSelectGeo={onSelectGeo}
        onRemoveCity={onRemoveCity}
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
