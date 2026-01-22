export default function WeatherDisplay({ weather }) {

if (!weather) {

return (

<div className="card">

<h2 className="cardTitle">Немає даних</h2>

<p className="muted">Обери місто , щоб побачити погоду.</p>

</div>

);

}



return (

<div className="content">

<header className="topBar">

<div>

<div className="location">

{weather.city} <span className="muted">· {weather.country}</span>

</div>

<div className="updated">{weather.updatedAt}</div>

</div>



<div className="pill">{weather.conditionText}</div>

</header>



<section className="card hero">

<div className="tempRow">

<div className="icon" aria-hidden="true">

{weather.icon}

</div>



<div>

<div className="temp">{weather.tempC}°C</div>

<div className="muted">Відчувається як {weather.feelsLikeC}°C</div>

</div>

</div>



<div className="statGrid">

<Stat label="Вологість" value={`${weather.humidity}%`} />

<Stat label="Вітер" value={`${weather.windKph} км/год`} />

<Stat label="Тиск" value={`${weather.pressureMb} mb`} />

<Stat label="Стан" value={weather.conditionText} />

</div>

</section>

</div>

);

}



function Stat({ label, value }) {

return (

<div className="stat">

<div className="statLabel">{label}</div>

<div className="statValue">{value}</div>

</div>

);

}