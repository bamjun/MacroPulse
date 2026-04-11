const API_BASE = "";

export async function fetchRates(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const res = await fetch(`${API_BASE}/api/rates?${params}`);
  if (!res.ok) throw new Error(`Rates API error: ${res.status}`);
  return res.json();
}

export async function fetchExchange(startDate, endDate, frequency = "m") {
  const params = new URLSearchParams();
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  params.set("frequency", frequency);

  const res = await fetch(`${API_BASE}/api/exchange?${params}`);
  if (!res.ok) throw new Error(`Exchange API error: ${res.status}`);
  return res.json();
}

export async function* streamGemini(message, history = [], context = null) {
  const res = await fetch(`${API_BASE}/api/gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, context }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Gemini API error: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const dataStr = line.slice(6).trim();
        if (dataStr === "[DONE]") return;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.text) {
            yield parsed.text;
          }
        } catch {
          // skip malformed
        }
      }
    }
  }
}

// Format date as YYYY-MM-DD, n months ago. 0 = MAX (back to 1990)
export function getDateRange(monthsAgo) {
  const end = new Date();
  const start = new Date();

  if (monthsAgo === 0) {
    // MAX range: go back to 1990 for full historical data
    start.setFullYear(1990, 0, 1);
  } else {
    start.setMonth(start.getMonth() - monthsAgo);
  }

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
