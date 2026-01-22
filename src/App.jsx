 import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import WeatherDisplay from "./components/WeatherDisplay";
import "./styles/App.css";
// update




const API_KEY = "REMOVED";



export default function App() {

const [cities, setCities] = useState([

{ id: "Kyiv", name: "Київ", country: "Ukraine" },

{ id: "Lviv", name: "Львів", country: "Ukraine" },

{ id: "Odesa", name: "Одеса", country: "Ukraine" },

{ id: "Kharkiv", name: "Харків", country: "Ukraine" },

{ id: "London", name: "Лондон", country: "UK" },

{ id: "Paris", name: "Париж", country: "France" },

{ id: "New York", name: "Нью-Йорк", country: "USA" },

{ id: "Tokyo", name: "Токіо", country: "Japan" },

]);



const [selectedCityId, setSelectedCityId] = useState("");

const [weather, setWeather] = useState(null);

const [isLoading, setIsLoading] = useState(false);



const fetchWeather = async (query) => {

if (!query) return;

setIsLoading(true);

try {

const response = await fetch(

`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${query}&lang=uk`

);

if (!response.ok) throw new Error("Місто не знайдено");

const data = await response.json();



setWeather({

city: data.location.name,

country: data.location.country,

updatedAt: data.current.last_updated,

conditionText: data.current.condition.text,

icon: <img src={data.current.condition.icon} alt="icon" />,

tempC: Math.round(data.current.temp_c),

feelsLikeC: Math.round(data.current.feelslike_c),

humidity: data.current.humidity,

windKph: data.current.wind_kph,

pressureMb: data.current.pressure_mb,

});



setCities((prev) =>

prev.map((c) =>

c.id.toLowerCase() === query.toLowerCase() || c.name === data.location.name

? { ...c, country: data.location.country, name: data.location.name }

: c

)

);


setSelectedCityId(data.location.name);

} catch (error) {

console.error(error);

alert("Не вдалося знайти таке місто.");

} finally {

setIsLoading(false);

}

};



useEffect(() => {

if (navigator.geolocation) {

navigator.geolocation.getCurrentPosition(

(position) => {

const { latitude, longitude } = position.coords;

fetchWeather(`${latitude},${longitude}`);

},

() => fetchWeather("Kyiv")

);

} else {

fetchWeather("Kyiv");

}

}, []);



useEffect(() => {

if (selectedCityId && weather?.city !== selectedCityId) {

fetchWeather(selectedCityId);

}

}, [selectedCityId]);



function handleSelectCity(id) {

setSelectedCityId(id);

}



function handleAddCity(cityName) {

const cityExists = cities.find(c => c.id.toLowerCase() === cityName.toLowerCase());

if (!cityExists) {

const newCity = { id: cityName, name: cityName, country: "Оновлення..." };

setCities((prev) => [newCity, ...prev]);

}

setSelectedCityId(cityName);

}



const getWeatherClass = () => {

if (!weather) return "";

const condition = weather.conditionText.toLowerCase();


if (condition.includes("сонячно") || condition.includes("ясно")) return "sunny-theme";

if (condition.includes("дощ") || condition.includes("злива")) return "rainy-theme";

if (condition.includes("хмарно") || condition.includes("пасмурно") || condition.includes("мінлива хмарність")) return "cloudy-theme";

if (condition.includes("сніг")) return "snowy-theme";


return "";

};



return (

<div className={`app ${getWeatherClass()}`}>

<Sidebar

cities={cities}

selectedCityId={selectedCityId}

onSelectCity={handleSelectCity}

onAddCity={handleAddCity}

/>

<main className="main">

{isLoading ? (

<div className="card"><h2>Завантаження...</h2></div>

) : (

<WeatherDisplay weather={weather} />

)}

</main>

</div>

);

} 