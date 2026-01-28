const BASE = "https://api.weatherapi.com/v1";
const KEY = import.meta.env.VITE_WEATHER_API_KEY;

async function request(path, params = {}, signal) {
  const url = new URL(`${BASE}/${path}`);
  url.searchParams.set("key", KEY);

  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url, { signal });
  const data = await res.json();

  if (!res.ok || data?.error) {
    throw new Error(data?.error?.message || `Request failed (${res.status})`);
  }

  return data;
}

export async function searchLocations(q, signal) {
  const query = q.trim();
  if (query.length < 2) return [];
  return request("search.json", { q: query }, signal);
}

export async function getCurrent(q, lang = "uk", signal) {
  return request("current.json", { q, lang }, signal);
}
