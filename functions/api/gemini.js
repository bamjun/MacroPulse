// POST /api/gemini
// Body: { "message": "user question", "history": [...], "context": { rates, exchange } }
// Streams Gemini response via Server-Sent Events or returns JSON.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SYSTEM_PROMPT = `당신은 'MacroPulse'라는 거시경제 분석 플랫폼의 전문 AI 이코노미스트입니다.

역할:
- 한국과 미국의 기준금리, USD/KRW 환율, 그리고 거시경제 전반에 대해 분석합니다.
- 한국은행(BOK) 및 미국 연준(FED) 정책을 깊이 이해하고 있습니다.
- 금리 스프레드가 환율에 미치는 영향을 계량적으로 설명할 수 있습니다.

규칙:
- 한국어로 답변합니다.
- 데이터가 제공되면 이를 기반으로 분석합니다.
- 수치와 트렌드를 명확히 제시합니다.
- 답변은 전문적이되 이해하기 쉽게 작성합니다.
- 투자 조언이 아닌 분석임을 명시합니다.
- 마크다운 형식으로 답변합니다.`;

export async function onRequestPost(context) {
  const geminiKey = context.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return new Response(
      JSON.stringify({ error: "Gemini API key not configured" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const { message, history = [], context: dataContext } = body;

  if (!message) {
    return new Response(
      JSON.stringify({ error: "Message is required" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  // Build context string from data
  let contextStr = "";
  if (dataContext) {
    if (dataContext.rates) {
      contextStr += `\n\n[현재 금리 데이터]\n한국 기준금리: ${dataContext.rates.bok?.current ?? "N/A"}%, 미국 기준금리: ${dataContext.rates.fed?.current ?? "N/A"}%, 금리 스프레드: ${dataContext.rates.spread ?? "N/A"}%`;
    }
    if (dataContext.exchange) {
      contextStr += `\n\n[현재 환율 데이터]\nUSD/KRW: ${dataContext.exchange.current ?? "N/A"}원, 변동: ${dataContext.exchange.change ?? "N/A"}원 (${dataContext.exchange.changePercent ?? "N/A"}%), 기간 최고: ${dataContext.exchange.periodHigh ?? "N/A"}원, 기간 최저: ${dataContext.exchange.periodLow ?? "N/A"}원`;
    }
  }

  // Build message history for Gemini
  const contents = [];

  // Add conversation history
  history.forEach((msg) => {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  });

  // Add current message with data context
  const userMessage = contextStr
    ? `${message}\n\n---\n참고 데이터:${contextStr}`
    : message;

  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${geminiKey}`;

  try {
    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return new Response(
        JSON.stringify({ error: "Gemini API error", details: errText }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Stream SSE response through to client
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();

    context.waitUntil(
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              await writer.write(new TextEncoder().encode("data: [DONE]\n\n"));
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim();
                if (!jsonStr || jsonStr === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(jsonStr);
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    const sseMsg = `data: ${JSON.stringify({ text })}\n\n`;
                    await writer.write(new TextEncoder().encode(sseMsg));
                  }
                } catch {
                  // Skip malformed chunks
                }
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          await writer.close();
        }
      })()
    );

    return new Response(readable, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to call Gemini", message: err.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}
