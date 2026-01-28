export default function WeatherDisplay({ weather }) {
  if (!weather) {
    return (
      <div className="emptyCenter">
        <div className="emptyCard">
          <div className="emptyIcon" aria-hidden="true" />
          <h2 className="emptyTitle">Небо на сьогодні</h2>
          <p className="emptySub">
            Обери місто — і простір зміниться разом із ним.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <header className="topBar">
        <div>
          <div className="location">
            {String(weather.city).toUpperCase()}
            <span className="mutedCaps">
              {String(weather.country).toUpperCase()}
            </span>
          </div>
          <div className="condLine muted">{weather.conditionText}</div>
        </div>

        <div className="updated muted">{weather.updatedAt}</div>
      </header>

      <section className="centerBlock">
        <div className="temp">
          {weather.tempC > 0 ? `+${weather.tempC}` : weather.tempC}°C
        </div>
        <div className="muted">
          Відчувається як{" "}
          {weather.feelsLikeC > 0 ? `+${weather.feelsLikeC}` : weather.feelsLikeC}
          °C
        </div>

        <div className="statGridFig">
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
    <div className="statFig">
      <div className="statLabel">{label}</div>
      <div className="statValue">{value}</div>
    </div>
  );
}
