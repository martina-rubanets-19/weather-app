import { useEffect, useMemo, useState } from "react";

function iconUrl(raw) {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return raw;
}

function roundTemp(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "–";
  return Math.round(Number(v));
}

function formatDayShort(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  const days = ["нд", "пн", "вт", "ср", "чт", "пт", "сб"];
  const months = [
    "січ.",
    "лют.",
    "бер.",
    "квіт.",
    "трав.",
    "черв.",
    "лип.",
    "серп.",
    "вер.",
    "жовт.",
    "лист.",
    "груд.",
  ];
  const dd = String(d.getDate()).padStart(2, "0");
  return `${days[d.getDay()]}, ${dd} ${months[d.getMonth()]}`;
}

function buildChartPoints(values, w, h, padX = 28, padY = 20) {
  const nums = values.filter((x) => Number.isFinite(x));
  if (!nums.length) return { pts: [], path: "", area: "" };

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;

  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const pts = values.map((v, i) => {
    const vv = Number.isFinite(v) ? v : min;
    const x = padX + (innerW * i) / (values.length - 1 || 1);
    const y = padY + innerH - ((vv - min) / span) * innerH;
    return { x, y, v: vv, i };
  });

  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const area =
    `M ${pts[0].x.toFixed(2)} ${(h - padY).toFixed(2)} ` +
    pts.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ") +
    ` L ${pts[pts.length - 1].x.toFixed(2)} ${(h - padY).toFixed(2)} Z`;

  return { pts, path, area };
}

export default function WeatherDisplay({ data, loading, error }) {
  const forecastDays = data?.forecast?.forecastday ?? [];
  const daysCount = forecastDays.length;

  const [activeIndex, setActiveIndex] = useState(0);

  
  useEffect(() => {
    if (!daysCount) {
      setActiveIndex(0);
      return;
    }
    setActiveIndex((i) => Math.min(Math.max(i, 0), daysCount - 1));
  }, [daysCount]);

  const safeActiveIndex = Math.min(Math.max(activeIndex, 0), Math.max(daysCount - 1, 0));
  const activeDay = forecastDays[safeActiveIndex];

  const stats = useMemo(() => {
    return {
      feels: roundTemp(data?.current?.feelslike_c),
      hum: data?.current?.humidity ?? "–",
      wind: data?.current?.wind_kph ?? "–",
      press: data?.current?.pressure_mb ?? "–",
    };
  }, [data]);

  const chart = useMemo(() => {
    const values = forecastDays.map((d) => {
      const v = d?.day?.maxtemp_c;
      return Number.isFinite(Number(v)) ? Number(v) : NaN;
    });
    const w = 760;
    const h = 220;
    return { ...buildChartPoints(values, w, h), w, h };
  }, [forecastDays]);

  if (loading) {
    return (
      <div className="content">
        <div className="emptyCenter">
          <div className="emptyCard">
            <h2>Завантаження…</h2>
            <p className="muted">Зачекай секундочку ✨</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <div className="emptyCenter">
          <div className="emptyCard">
            <h2>Помилка</h2>
            <p className="muted">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="content">
        <div className="emptyCenter">
          <div className="emptyCard">
            <h2>Обери місто</h2>
            <p className="muted">Зліва натисни на місто або геолокацію 📍</p>
          </div>
        </div>
      </div>
    );
  }

  const cur = data.current;
  const loc = data.location;

  const currentIcon = iconUrl(cur?.condition?.icon);
  const currentText = cur?.condition?.text || "";

  const avg = daysCount
    ? roundTemp(forecastDays.reduce((s, d) => s + (d?.day?.avgtemp_c ?? 0), 0) / daysCount)
    : "–";

  const min = daysCount ? roundTemp(Math.min(...forecastDays.map((d) => d?.day?.mintemp_c ?? 999))) : "–";
  const max = daysCount ? roundTemp(Math.max(...forecastDays.map((d) => d?.day?.maxtemp_c ?? -999))) : "–";

  const activeIcon = iconUrl(activeDay?.day?.condition?.icon);
  const activeText = activeDay?.day?.condition?.text || "";

  return (
    <div className="content">
      <div className="topBar">
        <div>
          <div className="location">
            {loc?.name || "—"}
            <span className="mutedCaps">{loc?.country || ""}</span>
          </div>
          <div className="condLine muted">{currentText}</div>
        </div>
      </div>

      <div className="centerBlock">
        {currentIcon ? <img className="currentIcon" src={currentIcon} alt={currentText || "Погода"} /> : null}
        <div className="temp">{roundTemp(cur?.temp_c)}°</div>

        <div className="statGridFig">
          <div className="statFig">
            <div className="statLabel">Відчувається</div>
            <div className="statValue">{stats.feels}°</div>
          </div>
          <div className="statFig">
            <div className="statLabel">Вологість</div>
            <div className="statValue">{stats.hum}%</div>
          </div>
          <div className="statFig">
            <div className="statLabel">Вітер</div>
            <div className="statValue">{stats.wind} km/h</div>
          </div>
          <div className="statFig">
            <div className="statLabel">Тиск</div>
            <div className="statValue">{stats.press} mb</div>
          </div>
        </div>

        <div className="forecastBlock">
          <div className="forecastTop">
            <div className="forecastTitle">
              Прогноз на {daysCount} днів — <b>Вибрано: {formatDayShort(activeDay?.date)}</b>
            </div>

            <div className="forecastMeta">
              <div className="forecastBadge">Середня: {avg}°</div>
              <div className="forecastBadge">Мін: {min}°</div>
              <div className="forecastBadge">Макс: {max}°</div>
            </div>
          </div>

          <div className="dayPicker">
            {forecastDays.map((d, idx) => {
              const label = formatDayShort(d?.date);
              const lo = roundTemp(d?.day?.mintemp_c);
              const hi = roundTemp(d?.day?.maxtemp_c);
              const ic = iconUrl(d?.day?.condition?.icon);
              const tt = d?.day?.condition?.text || "Погода";

              return (
                <button
                  key={d?.date || idx}
                  className={`dayBtn ${idx === safeActiveIndex ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                >
                  <div className="dayBtnText">
                    <div className="dayBtnTop">{label}</div>
                    <div className="dayBtnBottom">
                      {lo}°—{hi}°
                    </div>
                  </div>
                  {ic ? <img className="dayTinyIcon" src={ic} alt={tt} /> : null}
                </button>
              );
            })}
          </div>

          <div className="chartCard">
            <svg className="tempChart" viewBox={`0 0 ${chart.w} ${chart.h}`} role="img" aria-label="Temperature chart">
              <path className="chartArea" d={chart.area} />
              <path className="chartLine" d={chart.path} />

              {chart.pts.map((p) => (
                <g key={p.i} style={{ cursor: "pointer" }} onClick={() => setActiveIndex(p.i)}>
                  <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
                  <circle className={`chartDot ${p.i === safeActiveIndex ? "active" : ""}`} cx={p.x} cy={p.y} r={7} />
                  <text
                    className={`chartValue ${p.i === safeActiveIndex ? "active" : ""}`}
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                  >
                    {p.v}°
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="dayDetails">
            <div>
              <div className="muted">{formatDayShort(activeDay?.date)}</div>
              <div className="muted">{activeText}</div>
            </div>
            {activeIcon ? <img className="dayIcon" src={activeIcon} alt={activeText || "Погода"} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
