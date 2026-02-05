const BASE = "https://api.weatherapi.com/v1";

function assertKey() {
  const key = import.meta.env.VITE_WEATHER_API_KEY;
  if (!key) {
    throw new Error("Немає VITE_WEATHER_API_KEY у .env (перезапусти Vite після змін)");
  }
  return key;
}

async function fetchJson(url, signal) {
  const res = await fetch(url, { signal });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      (typeof data?.raw === "string" && data.raw.slice(0, 140)) ||
      `HTTP ${res.status} (${res.statusText || "error"})`;
    throw new Error(msg);
  }

  if (data?.error?.message) {
    throw new Error(data.error.message);
  }

  return data;
}

export async function getCurrent(q, signal) {
  const key = assertKey();
  const url =
    `${BASE}/current.json` +
    `?key=${encodeURIComponent(key)}` +
    `&q=${encodeURIComponent(q)}` +
    `&aqi=no` +
    `&lang=uk`;

  return fetchJson(url, signal);
}

export async function getForecast(q, days = 5, signal) {
  const key = assertKey();
  const safeDays = Math.max(1, Math.min(10, Number(days) || 5));

  const url =
    `${BASE}/forecast.json` +
    `?key=${encodeURIComponent(key)}` +
    `&q=${encodeURIComponent(q)}` +
    `&days=${safeDays}` +
    `&aqi=no` +
    `&alerts=no` +
    `&lang=uk`;

  return fetchJson(url, signal);
}
