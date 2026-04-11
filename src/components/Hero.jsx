import WebGLShader from "./WebGLShader";

export default function Hero({ ratesSummary, exchangeSummary }) {
  const bokRate = ratesSummary?.bok?.current ?? "—";
  const fedRate = ratesSummary?.fed?.current ?? "—";
  const spread = ratesSummary?.spread ?? "—";
  const exchangeRate = exchangeSummary?.current
    ? exchangeSummary.current.toLocaleString("ko-KR", { maximumFractionDigits: 2 })
    : "—";

  return (
    <header id="hero" className="relative min-h-screen flex items-end justify-start overflow-hidden pt-32 pb-24 px-8 md:px-20 bg-primary">
      {/* WebGL Shader Background */}
      <div className="absolute inset-0 z-0">
        <WebGLShader />
        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-transparent to-transparent"></div>
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"></div>
        <div className="absolute bottom-40 left-10 w-72 h-72 rounded-full bg-primary-fixed/10 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-5xl w-full">
        <div className="overflow-hidden mb-4">
          <span className="block font-headline text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-primary/80 fade-in-up">
            Macro Intelligence is the
          </span>
        </div>
        <div className="overflow-hidden">
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl italic leading-[0.9] text-primary-fixed fade-in-up">
            New Biology.
          </h1>
        </div>

        <div className="mt-12 max-w-lg fade-in-up">
          <p className="text-base md:text-lg font-body leading-relaxed text-on-primary-container">
            한국과 미국의 기준금리, 환율 데이터를 실시간으로 추적하고
            AI 기반 거시경제 분석을 제공합니다.
          </p>
        </div>

        {/* Live Rate Capsules */}
        <div className="mt-10 flex flex-wrap gap-3 fade-in-up">
          <RateCapsule label="BOK" value={`${bokRate}%`} />
          <RateCapsule label="FED" value={`${fedRate}%`} />
          <RateCapsule label="Spread" value={`${spread}%p`} accent />
          <RateCapsule label="USD/KRW" value={`₩${exchangeRate}`} />
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex gap-4 fade-in-up">
          <a
            href="#dashboard"
            className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-bold tracking-tight hover:scale-105 transition-transform font-headline text-sm"
          >
            View Dashboard
          </a>
          <a
            href="#gemini"
            className="px-8 py-4 rounded-xl font-bold text-on-primary border border-on-primary/20 hover:bg-on-primary/10 transition-all font-headline text-sm"
          >
            AI Analysis
          </a>
        </div>
      </div>
    </header>
  );
}

function RateCapsule({ label, value, accent = false }) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-2.5 rounded-full ${
        accent
          ? "bg-secondary/20 border border-secondary/30"
          : "bg-on-primary/5 border border-on-primary/10"
      }`}
    >
      <span className="font-label text-[0.65rem] uppercase tracking-widest text-on-primary-container font-bold">
        {label}
      </span>
      <span className={`font-label text-lg font-semibold ${accent ? "text-secondary-container" : "text-on-primary"}`}>
        {value}
      </span>
    </div>
  );
}
