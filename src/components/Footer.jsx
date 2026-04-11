export default function Footer() {
  return (
    <footer className="bg-surface-container-low py-12 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center w-full">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8 md:mb-0">
          <div className="text-sm font-bold text-primary uppercase tracking-tighter font-headline">
            MacroPulse
          </div>
          <div className="flex gap-6">
            <a
              className="font-label text-[0.75rem] uppercase text-on-surface-variant hover:text-secondary transition-colors"
              href="#dashboard"
            >
              Dashboard
            </a>
            <a
              className="font-label text-[0.75rem] uppercase text-on-surface-variant hover:text-secondary transition-colors"
              href="#gemini"
            >
              AI Insight
            </a>
            <a
              className="font-label text-[0.75rem] uppercase text-on-surface-variant hover:text-secondary transition-colors"
              href="#events"
            >
              Events
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-3 h-3">
            <div className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 pulse-dot-ring"></div>
            <div className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></div>
          </div>
          <span className="font-label text-[0.7rem] uppercase text-on-surface-variant tracking-widest">
            © {new Date().getFullYear()} MacroPulse — System Operational
          </span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-outline-variant/20">
        <div className="flex flex-wrap gap-4 justify-center">
          <span className="font-label text-[0.6rem] uppercase text-outline tracking-widest">
            한국은행 ECOS API
          </span>
          <span className="text-outline-variant">·</span>
          <span className="font-label text-[0.6rem] uppercase text-outline tracking-widest">
            FRED / St. Louis Fed
          </span>
          <span className="text-outline-variant">·</span>
          <span className="font-label text-[0.6rem] uppercase text-outline tracking-widest">
            Google Gemini 2.5 Flash
          </span>
        </div>
      </div>
    </footer>
  );
}
