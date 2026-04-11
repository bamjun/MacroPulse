import { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js/auto";
import { getRateChartConfig, getSpreadChartConfig, getExchangeChartConfig } from "../utils/chartConfig";

export default function Dashboard({
  ratesData,
  ratesSummary,
  exchangeData,
  exchangeSummary,
  loading,
  dateRange,
  onDateRangeChange,
}) {
  const dateOptions = [
    { label: "6M", months: 6 },
    { label: "1Y", months: 12 },
    { label: "2Y", months: 24 },
    { label: "5Y", months: 60 },
  ];

  return (
    <section id="dashboard" className="py-24 md:py-32 px-8 md:px-20 max-w-[1440px] mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
        <div>
          <span className="font-label text-[0.75rem] uppercase tracking-widest text-secondary font-bold">
            Live Dashboard
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold mt-3 tracking-tighter text-primary">
            Rate Synchronization
          </h2>
        </div>
        <div className="flex gap-2 mt-6 md:mt-0">
          {dateOptions.map((opt) => (
            <button
              key={opt.months}
              onClick={() => onDateRangeChange(opt.months)}
              className={`font-label text-[0.7rem] uppercase px-4 py-2 rounded-full transition-all cursor-pointer ${
                dateRange === opt.months
                  ? "bg-primary text-on-primary font-bold"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high font-medium"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Rate Summary Cards */}
        <div className="md:col-span-4 grid grid-rows-3 gap-4">
          <RateCard
            label="한국 기준금리"
            code="BOK Base Rate"
            value={ratesSummary?.bok?.current}
            change={ratesSummary?.bok?.change}
            date={ratesSummary?.bok?.date}
            loading={loading}
          />
          <RateCard
            label="미국 기준금리"
            code="FED Target Rate"
            value={ratesSummary?.fed?.current}
            change={ratesSummary?.fed?.change}
            date={ratesSummary?.fed?.date}
            loading={loading}
            accent
          />
          <RateCard
            label="금리 스프레드"
            code="BOK−FED Spread"
            value={ratesSummary?.spread}
            unit="%p"
            loading={loading}
            highlight
          />
        </div>

        {/* Rate Chart */}
        <div className="md:col-span-8 bg-surface-container-low rounded-xl p-6 md:p-8 min-h-[380px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline text-lg font-bold text-primary tracking-tight">
              기준금리 추이
            </h3>
            <span className="font-label text-[0.65rem] text-outline uppercase">
              Monthly • {ratesData?.length ?? 0} pts
            </span>
          </div>
          {loading ? (
            <div className="w-full h-[300px] skeleton"></div>
          ) : (
            <ChartCanvas config={getRateChartConfig(ratesData || [])} height={300} />
          )}
        </div>

        {/* Spread Chart */}
        <div className="md:col-span-6 bg-surface-container-highest rounded-xl p-6 md:p-8 data-specimen border border-dashed border-outline-variant/40 min-h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline text-lg font-bold text-primary tracking-tight">
              금리 스프레드 추이
            </h3>
            <span className="font-label text-[0.65rem] text-secondary font-bold uppercase">
              Area Chart
            </span>
          </div>
          {loading ? (
            <div className="w-full h-[240px] skeleton"></div>
          ) : (
            <ChartCanvas config={getSpreadChartConfig(ratesData || [])} height={240} />
          )}
        </div>

        {/* Exchange Chart */}
        <div className="md:col-span-6 bg-surface-container-low rounded-xl p-6 md:p-8 min-h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-headline text-lg font-bold text-primary tracking-tight">
                USD/KRW 환율
              </h3>
              {exchangeSummary && (
                <div className="flex gap-4 mt-2">
                  <span className="font-label text-[0.6rem] text-outline uppercase">
                    High: ₩{exchangeSummary.periodHigh?.toLocaleString()}
                  </span>
                  <span className="font-label text-[0.6rem] text-outline uppercase">
                    Low: ₩{exchangeSummary.periodLow?.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              {exchangeSummary && (
                <>
                  <div className="font-label text-2xl font-semibold text-primary">
                    ₩{exchangeSummary.current?.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`font-label text-[0.7rem] font-bold ${
                      (exchangeSummary?.change ?? 0) > 0
                        ? "rate-up"
                        : (exchangeSummary?.change ?? 0) < 0
                        ? "rate-down"
                        : "rate-flat"
                    }`}
                  >
                    {(exchangeSummary?.change ?? 0) > 0 ? "▲" : (exchangeSummary?.change ?? 0) < 0 ? "▼" : "—"}{" "}
                    {Math.abs(exchangeSummary?.change ?? 0).toFixed(2)} (
                    {exchangeSummary?.changePercent?.toFixed(2) ?? "0"}%)
                  </div>
                </>
              )}
            </div>
          </div>
          {loading ? (
            <div className="w-full h-[240px] skeleton"></div>
          ) : (
            <ChartCanvas config={getExchangeChartConfig(exchangeData || [])} height={240} />
          )}
        </div>

        {/* Telemetry Feed */}
        <div className="md:col-span-12 bg-tertiary-container text-on-tertiary-container rounded-xl p-8 relative overflow-hidden">
          <span className="font-label text-[0.75rem] uppercase tracking-widest font-bold text-on-primary-container">
            Telemetry Feed
          </span>
          <div className="mt-6 font-label text-sm leading-relaxed space-y-3 opacity-80">
            {ratesSummary?.bok && (
              <p>
                <span className="text-on-primary font-semibold">BOK:</span> 기준금리{" "}
                {ratesSummary.bok.current}% 유지 • 최종변동{" "}
                {ratesSummary.bok.change !== null
                  ? `${ratesSummary.bok.change > 0 ? "+" : ""}${ratesSummary.bok.change}%p`
                  : "N/A"}
              </p>
            )}
            {ratesSummary?.fed && (
              <p>
                <span className="text-on-primary font-semibold">FED:</span> 기준금리{" "}
                {ratesSummary.fed.current}% • 최종변동{" "}
                {ratesSummary.fed.change !== null
                  ? `${ratesSummary.fed.change > 0 ? "+" : ""}${ratesSummary.fed.change}%p`
                  : "N/A"}
              </p>
            )}
            {exchangeSummary && (
              <p>
                <span className="text-on-primary font-semibold">FX:</span> USD/KRW ₩
                {exchangeSummary.current?.toLocaleString()} • 변동{" "}
                {exchangeSummary.change !== null
                  ? `${exchangeSummary.change > 0 ? "+" : ""}${exchangeSummary.change.toFixed(2)}원`
                  : "N/A"}
              </p>
            )}
            <p>
              <span className="text-on-primary font-semibold">SYNC:</span> 데이터 동기화 완료 •{" "}
              {new Date().toLocaleString("ko-KR")}
            </p>
          </div>
          <div className="absolute bottom-[-15%] right-[-5%] opacity-10">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "12rem", fontVariationSettings: "'FILL' 1" }}
            >
              monitoring
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Individual rate card
function RateCard({ label, code, value, change, date, unit = "%", loading, accent, highlight }) {
  let bgClass = "bg-surface-container-low";
  let textClass = "text-primary";
  let labelClass = "text-outline";

  if (accent) {
    bgClass = "bg-secondary/5";
  }
  if (highlight) {
    bgClass = "bg-primary";
    textClass = "text-on-primary";
    labelClass = "text-on-primary-container";
  }

  return (
    <div className={`${bgClass} rounded-xl p-5 flex flex-col justify-between`}>
      <div>
        <span className={`font-label text-[0.6rem] uppercase tracking-widest font-bold ${labelClass}`}>
          {code}
        </span>
        <p className={`font-body text-sm mt-1 ${highlight ? "text-on-primary-container" : "text-on-surface-variant"}`}>
          {label}
        </p>
      </div>
      {loading ? (
        <div className="h-10 w-24 skeleton mt-3"></div>
      ) : (
        <div className="mt-3 flex items-end gap-2">
          <span className={`font-label text-3xl font-semibold ${textClass}`}>
            {value !== null && value !== undefined ? value : "—"}
          </span>
          <span className={`font-label text-sm ${labelClass}`}>{unit}</span>
          {change !== null && change !== undefined && (
            <span
              className={`font-label text-[0.7rem] ml-2 font-bold ${
                change > 0 ? "rate-up" : change < 0 ? "rate-down" : "rate-flat"
              }`}
            >
              {change > 0 ? "▲" : change < 0 ? "▼" : "—"} {Math.abs(change).toFixed(2)}
            </span>
          )}
        </div>
      )}
      {date && (
        <span className={`font-label text-[0.55rem] mt-2 ${labelClass} opacity-60`}>
          as of {date}
        </span>
      )}
    </div>
  );
}

// Chart.js canvas wrapper
function ChartCanvas({ config, height = 300 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [config]);

  return (
    <div className="chart-container" style={{ height }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
