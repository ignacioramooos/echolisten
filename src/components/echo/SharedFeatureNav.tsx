import { Link } from "react-router-dom";

/** Shared feature navigation links — shown on both Seeker and Listener dashboards */
const SharedFeatureNav = () => (
  <nav className="flex flex-wrap gap-2 border-t border-foreground pt-3 mt-3">
    <Link to="/dashboard/room" className="font-body text-[11px] text-foreground underline echo-fade">
      room
    </Link>
    <Link to="/dashboard/journal" className="font-body text-[11px] text-foreground underline echo-fade">
      journal
    </Link>
    <Link to="/dashboard/shelf" className="font-body text-[11px] text-foreground underline echo-fade">
      memory shelf
    </Link>
    <Link to="/dashboard/patterns" className="font-body text-[11px] text-foreground underline echo-fade">
      patterns
    </Link>
    <Link to="/aura" className="font-body text-[11px] text-foreground underline echo-fade">
      aura
    </Link>
  </nav>
);

export default SharedFeatureNav;
