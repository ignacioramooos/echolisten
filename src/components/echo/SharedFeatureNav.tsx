import { Link } from "react-router-dom";

/** Shared feature navigation links — shown on both Seeker and Listener dashboards */
const SharedFeatureNav = () => (
  <nav className="border border-foreground p-3">
    <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Your space</p>
    <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(220px,1.4fr)_1fr]">
      <Link
        to="/dashboard/room"
        className="group border border-foreground bg-foreground px-3 py-3 text-background transition-colors duration-150 hover:bg-background hover:text-foreground"
      >
        <p className="font-body text-[12px] uppercase tracking-wider">Open Room</p>
        <p className="font-body text-[11px] leading-relaxed mt-1 text-background/85 group-hover:text-foreground">
          Your main space for expression: write, reflect, track, and hold what matters.
        </p>
      </Link>

      <div className="flex flex-wrap content-start gap-2">
        <Link
          to="/dashboard/journal"
          className="font-body text-[11px] border border-foreground px-2 py-1 text-foreground echo-fade"
        >
          journal
        </Link>
        <Link
          to="/dashboard/shelf"
          className="font-body text-[11px] border border-foreground px-2 py-1 text-foreground echo-fade"
        >
          memory shelf
        </Link>
        <Link
          to="/dashboard/patterns"
          className="font-body text-[11px] border border-foreground px-2 py-1 text-foreground echo-fade"
        >
          patterns
        </Link>
        <Link to="/aura" className="font-body text-[11px] border border-foreground px-2 py-1 text-foreground echo-fade">
          aura
        </Link>
      </div>
    </div>
  </nav>
);

export default SharedFeatureNav;
