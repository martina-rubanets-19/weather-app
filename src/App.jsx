import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import WeatherDisplay from "./components/WeatherDisplay";
import "./styles/App.css";
import { getCurrent } from "./api/weather";

const GEO_ID = "__geo__";

function formatUpdatedAt(lastUpdated) {
  const d = new Date(String(lastUpdated).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return `Оновлено: ${lastUpdated}`;

  const fmt = new Intl.DateTimeFormat(["uk-UA", "en-US"], {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `Оновлено: ${fmt.format(d)}`;
}

function toWeatherView(apiData, id) {
  return {
    id,
    city: apiData.location.name,
    country: apiData.location.country,
    updatedAt: formatUpdatedAt(apiData.current.last_updated),
    conditionText: apiData.current.condition.text,
    tempC: Math.round(apiData.current.temp_c),
    feelsLikeC: Math.round(apiData.current.feelslike_c),
    humidity: apiData.current.humidity,
    windKph: apiData.current.wind_kph,
    pressureMb: apiData.current.pressure_mb,
  };
}

function makeCityIdFromApi(apiData) {
  return `${apiData.location.lat},${apiData.location.lon}`;
}

export default function App() {
  const [cities, setCities] = useState([
    { id: "Kyiv", q: "Kyiv", name: "Київ", country: "Ukraine" },
    { id: "Lviv", q: "Lviv", name: "Львів", country: "Ukraine" },
    { id: "Odesa", q: "Odesa", name: "Одеса", country: "Ukraine" },
    { id: "Kharkiv", q: "Kharkiv", name: "Харків", country: "Ukraine" },
    { id: "London", q: "London", name: "Лондон", country: "UK" },
    { id: "Paris", q: "Paris", name: "Париж", country: "France" },
    { id: "New York", q: "New York", name: "Нью-Йорк", country: "USA" },
    { id: "Tokyo", q: "Tokyo", name: "Токіо", country: "Japan" },
  ]);

  const [selectedCityId, setSelectedCityId] = useState(GEO_ID);

  const [weather, setWeather] = useState(null);
  const [geoWeather, setGeoWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCity = useMemo(() => {
    return cities.find((c) => c.id === selectedCityId) || null;
  }, [cities, selectedCityId]);

  async function loadWeatherForCity(city) {
    setIsLoading(true);
    try {
      const data = await getCurrent(city.q, "uk");
      setWeather(toWeatherView(data, city.id));
    } catch (e) {
      console.error(e);
      alert(`Не вдалося отримати погоду: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function addCityByQuery(query) {
    const q = query.trim();
    if (!q) return;

    setIsLoading(true);
    try {
      const data = await getCurrent(q, "uk");

      const id = makeCityIdFromApi(data);
      const name = data.location.name;
      const country = data.location.country;
      const latlon = `${data.location.lat},${data.location.lon}`;

      setCities((prev) => {
        if (prev.some((c) => c.id === id)) return prev;
        return [{ id, q: latlon, name, country }, ...prev];
      });

      setWeather(toWeatherView(data, id));
      setSelectedCityId(id);
    } catch (e) {
      console.error(e);
      alert(`Не знайдено локацію: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectCity(id) {
    setSelectedCityId(id);
  }

  async function selectGeo() {
    if (!navigator.geolocation) {
      alert("Геолокація не підтримується браузером");
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const q = `${pos.coords.latitude},${pos.coords.longitude}`;
          const data = await getCurrent(q, "uk");

          setGeoWeather(toWeatherView(data, GEO_ID));
          setSelectedCityId(GEO_ID);
        } catch (e) {
          console.error(e);
          alert(`Не вдалося отримати погоду по геопозиції: ${e.message}`);
        } finally {
          setIsLoading(false);
        }
      },
      async () => {
        try {
          const data = await getCurrent("Kyiv", "uk");
          setGeoWeather(toWeatherView(data, GEO_ID));
          setSelectedCityId(GEO_ID);
        } catch (e) {
          alert(`Fallback не спрацював: ${e.message}`);
        } finally {
          setIsLoading(false);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
    selectGeo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCityId === GEO_ID) return;
    if (!selectedCity) return;
    if (weather?.id === selectedCityId) return;

    loadWeatherForCity(selectedCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCityId, selectedCity]);

  const shownWeather = selectedCityId === GEO_ID ? geoWeather : weather;

  const getWeatherClass = () => {
    if (!shownWeather) return "";
    const condition = shownWeather.conditionText.toLowerCase();

    if (condition.includes("сонячно") || condition.includes("ясно")) return "sunny-theme";
    if (condition.includes("дощ") || condition.includes("злива")) return "rainy-theme";
    if (
      condition.includes("хмарно") ||
      condition.includes("пасмурно") ||
      condition.includes("мінлива хмарність")
    )
      return "cloudy-theme";
    if (condition.includes("сніг")) return "snowy-theme";

    return "";
  };

  return (
    <div className={`app ${getWeatherClass()}`}>
      <Sidebar
        cities={cities}
        selectedCityId={selectedCityId}
        onSelectCity={handleSelectCity}
        onAddCity={addCityByQuery}
        onSelectGeo={selectGeo}
      />

      <main className="main">
        {isLoading ? (
          <div className="emptyCenter">
            <div className="emptyCard">
              <h2 className="emptyTitle">Завантаження...</h2>
              <p className="emptySub">Трохи магії в хмарах ☁️</p>
            </div>
          </div>
        ) : (
          <WeatherDisplay weather={shownWeather} />
        )}
      </main>
    </div>
  );
}
