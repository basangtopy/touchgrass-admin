import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Coins,
  DollarSign,
  RotateCcw,
  ListChecks,
  Shield,
  Wallet,
  Leaf,
  X,
} from "lucide-react";

const navItems = [
  {
    section: "Dashboard",
    items: [{ to: "/", icon: LayoutDashboard, label: "Overview" }],
  },
  {
    section: "Management",
    items: [
      { to: "/tokens", icon: Coins, label: "Token Management" },
      { to: "/fees", icon: DollarSign, label: "Fee Configuration" },
      { to: "/recovery", icon: RotateCcw, label: "Fund Recovery" },
      { to: "/challenges", icon: ListChecks, label: "Challenges" },
    ],
  },
  {
    section: "Settings",
    items: [
      { to: "/wallets", icon: Wallet, label: "Wallet Settings" },
      { to: "/ownership", icon: Shield, label: "Ownership" },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <button
        className="sidebar-close"
        onClick={onClose}
        aria-label="Close menu"
      >
        <X size={18} />
      </button>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Leaf size={24} />
          </div>
          <span>TouchGrass Admin</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                end={item.to === "/"}
                onClick={onClose}
              >
                <item.icon />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div
        style={{ padding: "1rem", borderTop: "1px solid var(--border-light)" }}
      >
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          TouchGrass Admin v1.0
        </div>
      </div>
    </aside>
  );
}
