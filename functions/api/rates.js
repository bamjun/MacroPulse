// GET /api/rates?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
// Fetches Korean (BOK) and US (FED) base rates, merges by date.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

async function fetchBOKRate(apiKey, startDate, endDate) {
  const start = startDate.replace(/-/g, "").slice(0, 6);
  const end = endDate.replace(/-/g, "").slice(0, 6);

  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${apiKey}/json/kr/1/1000/722Y001/M/${start}/${end}/0101000`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.StatisticSearch || !data.StatisticSearch.row) {
      console.error("BOK API response:", JSON.stringify(data));
      return [];
    }

    return data.StatisticSearch.row.map((item) => ({
      date: `${item.TIME.slice(0, 4)}-${item.TIME.slice(4, 6)}`,
      value: parseFloat(item.DATA_VALUE),
    }));
  } catch (err) {
    console.error("BOK API error:", err);
    return [];
  }
}

async function fetchFEDRate(apiKey, startDate, endDate) {
  const params = new URLSearchParams({
    series_id: "FEDFUNDS",
    api_key: apiKey,
    file_type: "json",
    observation_start: startDate,
    observation_end: endDate,
    frequency: "m",
    sort_order: "asc",
  });

  const url = `https://api.stlouisfed.org/fred/series/observations?${params}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.observations) {
      console.error("FRED API response:", JSON.stringify(data));
      return [];
    }

    return data.observations
      .filter((obs) => obs.value !== ".")
      .map((obs) => ({
        date: obs.date.slice(0, 7),
        value: parseFloat(obs.value),
      }));
  } catch (err) {
    console.error("FRED API error:", err);
    return [];
  }
}

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);

  const now = new Date();
  const twoYearsAgo = new Date(now);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const startDate = searchParams.get("start_date") || twoYearsAgo.toISOString().slice(0, 10);
  const endDate = searchParams.get("end_date") || now.toISOString().slice(0, 10);

  const ecosKey = context.env.ECOS_API_KEY;
  const fredKey = context.env.FRED_API_KEY;

  if (!ecosKey || !fredKey) {
    return new Response(
      JSON.stringify({ error: "API keys not configured" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  const [bokRates, fedRates] = await Promise.all([
    fetchBOKRate(ecosKey, startDate, endDate),
    fetchFEDRate(fredKey, startDate, endDate),
  ]);

  // Merge by date (YYYY-MM)
  const dateMap = new Map();

  bokRates.forEach((item) => {
    dateMap.set(item.date, { date: item.date, bok: item.value, fed: null, spread: null });
  });

  fedRates.forEach((item) => {
    if (dateMap.has(item.date)) {
      const entry = dateMap.get(item.date);
      entry.fed = item.value;
      entry.spread = parseFloat((entry.bok - item.value).toFixed(2));
    } else {
      dateMap.set(item.date, {
        date: item.date,
        bok: null,
        fed: item.value,
        spread: null,
      });
    }
  });

  const merged = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Get latest values for summary cards
  const latestBok = bokRates.length > 0 ? bokRates[bokRates.length - 1] : null;
  const latestFed = fedRates.length > 0 ? fedRates[fedRates.length - 1] : null;
  const prevBok = bokRates.length > 1 ? bokRates[bokRates.length - 2] : null;
  const prevFed = fedRates.length > 1 ? fedRates[fedRates.length - 2] : null;

  const summary = {
    bok: latestBok
      ? {
          current: latestBok.value,
          previous: prevBok ? prevBok.value : null,
          change: prevBok ? parseFloat((latestBok.value - prevBok.value).toFixed(2)) : null,
          date: latestBok.date,
        }
      : null,
    fed: latestFed
      ? {
          current: latestFed.value,
          previous: prevFed ? prevFed.value : null,
          change: prevFed ? parseFloat((latestFed.value - prevFed.value).toFixed(2)) : null,
          date: latestFed.date,
        }
      : null,
    spread:
      latestBok && latestFed
        ? parseFloat((latestBok.value - latestFed.value).toFixed(2))
        : null,
  };

  return new Response(
    JSON.stringify({
      data: merged,
      summary,
      meta: { startDate, endDate, bokCount: bokRates.length, fedCount: fedRates.length },
    }),
    { headers: CORS_HEADERS }
  );
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}
