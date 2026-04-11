import { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Dashboard from "./components/Dashboard";
import GeminiChat from "./components/GeminiChat";
import EventTimeline from "./components/EventTimeline";
import Footer from "./components/Footer";
import { fetchRates, fetchExchange, getDateRange } from "./utils/api";

export default function App() {
  const [ratesData, setRatesData] = useState(null);
  const [ratesSummary, setRatesSummary] = useState(null);
  const [exchangeData, setExchangeData] = useState(null);
  const [exchangeSummary, setExchangeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(24); // months
  const [error, setError] = useState(null);

  const loadData = useCallback(async (months) => {
    setLoading(true);
    setError(null);

    const { startDate, endDate } = getDateRange(months);

    try {
      const [ratesRes, exchangeRes] = await Promise.all([
        fetchRates(startDate, endDate),
        fetchExchange(startDate, endDate),
      ]);

      setRatesData(ratesRes.data);
      setRatesSummary(ratesRes.summary);
      setExchangeData(exchangeRes.data);
      setExchangeSummary(exchangeRes.summary);
    } catch (err) {
      console.error("Data fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(dateRange);
  }, [dateRange, loadData]);

  const handleDateRangeChange = (months) => {
    setDateRange(months);
  };

  return (
    <>
      {/* Grain Overlay */}
      <div className="grain-overlay"></div>

      {/* Navigation */}
      <Navbar />

      {/* Hero */}
      <Hero ratesSummary={ratesSummary} exchangeSummary={exchangeSummary} />

      {/* Error Banner */}
      {error && (
        <div className="bg-error/10 border border-error/20 text-on-error-container px-8 py-4 mx-8 md:mx-20 mt-8 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <div>
              <p className="font-headline font-bold text-sm">데이터 로드 실패</p>
              <p className="text-sm opacity-70 mt-1">{error}</p>
            </div>
            <button
              onClick={() => loadData(dateRange)}
              className="ml-auto font-label text-xs bg-error/10 hover:bg-error/20 px-4 py-2 rounded-full transition-all cursor-pointer"
            >
              재시도
            </button>
          </div>
        </div>
      )}

      {/* Dashboard */}
      <Dashboard
        ratesData={ratesData}
        ratesSummary={ratesSummary}
        exchangeData={exchangeData}
        exchangeSummary={exchangeSummary}
        loading={loading}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* AI Chat */}
      <GeminiChat ratesSummary={ratesSummary} exchangeSummary={exchangeSummary} />

      {/* Event Timeline */}
      <EventTimeline />

      {/* Footer */}
      <Footer />
    </>
  );
}
