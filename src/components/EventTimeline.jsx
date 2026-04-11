const EVENTS = [
  {
    date: "2026-04-17",
    label: "APR 17",
    title: "한국은행 금통위",
    description: "기준금리 결정",
    highlight: false,
  },
  {
    date: "2026-05-07",
    label: "MAY 07",
    title: "FOMC 회의",
    description: "연준 금리 결정",
    highlight: true,
  },
  {
    date: "2026-05-15",
    label: "MAY 15",
    title: "한국 GDP",
    description: "1분기 GDP 속보치",
    highlight: false,
  },
  {
    date: "2026-05-29",
    label: "MAY 29",
    title: "한국은행 금통위",
    description: "기준금리 결정",
    highlight: false,
  },
  {
    date: "2026-06-11",
    label: "JUN 11",
    title: "미국 CPI",
    description: "소비자물가지수",
    highlight: false,
  },
  {
    date: "2026-06-18",
    label: "JUN 18",
    title: "FOMC 회의",
    description: "연준 금리 결정 + 점도표",
    highlight: true,
  },
  {
    date: "2026-06-26",
    label: "JUN 26",
    title: "PCE 물가",
    description: "개인소비지출 물가",
    highlight: false,
  },
  {
    date: "2026-07-09",
    label: "JUL 09",
    title: "한국은행 금통위",
    description: "기준금리 결정",
    highlight: false,
  },
];

export default function EventTimeline() {
  const now = new Date();

  return (
    <section id="events" className="py-24 md:py-32 px-8 md:px-20 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="bg-surface-container-highest rounded-xl p-8 md:p-12 data-specimen border border-dashed border-outline-variant/40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <span className="font-label text-[0.75rem] uppercase tracking-widest text-secondary font-bold">
              Protocol Scheduler
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold mt-2 text-primary tracking-tighter">
              Event Trajectory
            </h2>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EVENTS.map((event, idx) => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < now;

            return (
              <div
                key={idx}
                className={`p-5 rounded-lg transition-all magnetic-hover ${
                  event.highlight
                    ? "bg-primary text-on-primary shadow-xl ring-4 ring-primary/5"
                    : isPast
                    ? "bg-surface-container-lowest/60 opacity-60"
                    : "bg-surface-container-lowest shadow-sm border border-outline/5"
                }`}
              >
                <span
                  className={`font-label text-xs font-bold ${
                    event.highlight
                      ? "text-on-primary-container"
                      : "text-outline"
                  }`}
                >
                  {event.label}
                </span>
                <h4
                  className={`font-headline font-bold mt-2 ${
                    event.highlight ? "text-on-primary" : "text-primary"
                  }`}
                >
                  {event.title}
                </h4>
                <p
                  className={`text-sm mt-1 ${
                    event.highlight
                      ? "text-on-primary-container opacity-80"
                      : "text-on-surface-variant opacity-70"
                  }`}
                >
                  {event.description}
                </p>
                {isPast && !event.highlight && (
                  <span className="font-label text-[0.6rem] text-outline mt-2 block uppercase">
                    완료
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
