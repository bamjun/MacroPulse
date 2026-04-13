import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import { streamGemini } from "../utils/api";

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

const PRESET_QUESTIONS = [
  {
    label: "금리 전망",
    icon: "trending_up",
    question: "한국과 미국의 기준금리 향후 전망을 분석해주세요.",
  },
  {
    label: "환율 분석",
    icon: "currency_exchange",
    question: "현재 USD/KRW 환율 수준과 향후 방향성을 분석해주세요.",
  },
  {
    label: "스프레드 영향",
    icon: "compare_arrows",
    question: "한미 금리 스프레드가 원달러 환율에 미치는 영향을 설명해주세요.",
  },
  {
    label: "투자 시사점",
    icon: "insights",
    question: "현재 매크로 환경에서의 자산배분 시사점을 분석해주세요.",
  },
];

export default function GeminiChat({ ratesSummary, exchangeSummary }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isStreaming) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Build context from current data
    const context = {
      rates: ratesSummary,
      exchange: exchangeSummary,
    };

    // Build history for Gemini
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Add AI message placeholder
    const aiMsgIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      let fullText = "";
      for await (const chunk of streamGemini(text, history, context)) {
        fullText += chunk;
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[aiMsgIndex] = { role: "assistant", content: fullText };
          return newMsgs;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[aiMsgIndex] = {
          role: "assistant",
          content: `⚠️ 오류가 발생했습니다: ${err.message}`,
        };
        return newMsgs;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <section
      id="gemini"
      className="py-24 md:py-32 px-8 md:px-20 bg-surface-container"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <span className="font-label text-[0.75rem] uppercase tracking-widest text-secondary font-bold">
              AI Economist
            </span>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold mt-3 tracking-tighter text-primary">
              Gemini Insight
            </h2>
            <p className="text-on-surface-variant mt-2 max-w-md">
              실시간 금리·환율 데이터를 기반으로 AI 거시경제 분석을 받아보세요.
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={chatContainerRef} className="bg-surface rounded-xl p-6 min-h-[200px] max-h-[600px] overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <div>
              {/* Preset Questions - inside container to prevent layout shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {PRESET_QUESTIONS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => sendMessage(preset.question)}
                    disabled={isStreaming}
                    className="flex items-center gap-4 p-5 bg-surface-container-low rounded-xl
                      hover:bg-surface-container-high transition-all text-left group cursor-pointer
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full
                      bg-primary/5 text-primary group-hover:bg-primary group-hover:text-on-primary
                      transition-all">
                      <span className="material-symbols-outlined text-lg">{preset.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-sm text-primary">{preset.label}</h4>
                      <p className="text-[0.75rem] text-on-surface-variant mt-0.5 line-clamp-1">
                        {preset.question}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex flex-col items-center justify-center h-24 opacity-40">
                <span
                  className="material-symbols-outlined text-4xl text-primary mb-3"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
                >
                  psychology
                </span>
                <p className="font-label text-sm text-on-surface-variant">
                  질문을 입력하거나 프리셋을 선택하세요
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] px-5 py-3.5 ${
                      msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : msg.content ? (
                      <div
                        className="ai-response text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: marked.parse(msg.content),
                        }}
                      />
                    ) : (
                      <div className="flex gap-1.5 py-1">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="거시경제에 대해 질문하세요..."
            disabled={isStreaming}
            className="flex-1 px-6 py-4 bg-surface-container-low rounded-xl font-body text-sm
              text-on-surface placeholder:text-outline-variant focus:outline-none
              focus:ring-2 focus:ring-primary/20 transition-all
              disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="px-6 py-4 bg-primary text-on-primary rounded-xl font-bold font-headline text-sm
              hover:bg-tertiary-container transition-all cursor-pointer
              disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">send</span>
            <span className="hide-mobile">전송</span>
          </button>
        </form>
      </div>
    </section>
  );
}
