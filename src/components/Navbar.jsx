import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Determine active section
      const sections = ["hero", "dashboard", "gemini", "events"];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "gemini", label: "AI Insight" },
    { id: "events", label: "Events" },
  ];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full px-6 py-2.5 flex items-center gap-8 transition-all duration-500 ${
        scrolled
          ? "glass shadow-[0_20px_40px_rgba(46,64,54,0.12)] min-w-[380px]"
          : "glass shadow-[0_20px_40px_rgba(46,64,54,0.06)] min-w-[380px]"
      }`}
    >
      <button
        onClick={() => scrollTo("hero")}
        className="text-xl font-bold tracking-tighter text-emerald-50 hover:text-emerald-300 transition-colors cursor-pointer font-headline"
      >
        MacroPulse
      </button>

      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`font-label text-[0.7rem] uppercase tracking-wider transition-all duration-300 magnetic-hover cursor-pointer pb-0.5 ${
              activeSection === item.id
                ? "text-emerald-400 font-bold border-b-2 border-emerald-400"
                : "text-stone-400 font-medium hover:text-emerald-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center w-2.5 h-2.5">
          <div className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 pulse-dot-ring"></div>
          <div className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></div>
        </div>
        <span className="font-label text-[0.6rem] text-stone-500 uppercase tracking-widest hide-mobile">
          Live
        </span>
      </div>
    </nav>
  );
}
