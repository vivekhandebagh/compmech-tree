import { Route, Routes, Link, useLocation } from "react-router-dom";
import { Timeline } from "./pages/Timeline";
import { About } from "./pages/About";
import { Paper } from "./pages/Paper";

export function App() {
  const location = useLocation();
  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-neutral-100">
      <header className="flex shrink-0 items-center justify-between border-b border-neutral-800 px-6 py-3">
        <Link to="/" className="font-mono text-sm tracking-tight text-neutral-100 hover:text-white">
          compmech<span className="text-neutral-500">-tree</span>
        </Link>
        <nav className="flex gap-6 text-xs uppercase tracking-wider text-neutral-400">
          <Link
            to="/"
            className={location.pathname === "/" ? "text-neutral-100" : "hover:text-neutral-200"}
          >
            Timeline
          </Link>
          <Link
            to="/about"
            className={location.pathname === "/about" ? "text-neutral-100" : "hover:text-neutral-200"}
          >
            About
          </Link>
        </nav>
      </header>
      <main className="min-h-0 flex-1">
        <Routes>
          <Route path="/" element={<Timeline />} />
          <Route path="/about" element={<About />} />
          <Route path="/paper/:id" element={<Paper />} />
        </Routes>
      </main>
    </div>
  );
}
