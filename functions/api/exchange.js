// GET /api/exchange?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&frequency=m
// Fetches USD/KRW exchange rate from FRED (DEXKOUS series).

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);

  const now = new Date();
  const twoYearsAgo = new Date(now);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const startDate = searchParams.get("start_date") || twoYearsAgo.toISOString().slice(0, 10);
  const endDate = searchParams.get("end_date") || now.toISOString().slice(0, 10);
  const frequency = searchParams.get("frequency") || "m";

  const fredKey = context.env.FRED_API_KEY;

  if (!fredKey) {
    return new Response(
      JSON.stringify({ error: "FRED API key not configured" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  const params = new URLSearchParams({
    series_id: "DEXKOUS",
    api_key: fredKey,
    file_type: "json",
    observation_start: startDate,
    observation_end: endDate,
    frequency: frequency,
    sort_order: "asc",
  });

  try {
    const res = await fetch(`https://api.stlouisfed.org/fred/series/observations?${params}`);
    const data = await res.json();

    if (!data.observations) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch exchange data", details: data }),
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const observations = data.observations
      .filter((obs) => obs.value !== ".")
      .map((obs) => ({
        date: obs.date,
        value: parseFloat(obs.value),
      }));

    // Summary
    const latest = observations.length > 0 ? observations[observations.length - 1] : null;
    const previous = observations.length > 1 ? observations[observations.length - 2] : null;
    const oldest = observations.length > 0 ? observations[0] : null;

    const summary = latest
      ? {
          current: latest.value,
          previous: previous ? previous.value : null,
          change: previous ? parseFloat((latest.value - previous.value).toFixed(2)) : null,
          changePercent: previous
            ? parseFloat((((latest.value - previous.value) / previous.value) * 100).toFixed(2))
            : null,
          periodHigh: Math.max(...observations.map((o) => o.value)),
          periodLow: Math.min(...observations.map((o) => o.value)),
          date: latest.date,
        }
      : null;

    return new Response(
      JSON.stringify({
        data: observations,
        summary,
        meta: { startDate, endDate, frequency, count: observations.length },
      }),
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch exchange rate", message: err.message }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}
