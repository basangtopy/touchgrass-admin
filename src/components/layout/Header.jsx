import { useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu } from "lucide-react";

const pageTitles = {
  "/": "Dashboard Overview",
  "/tokens": "Token Management",
  "/fees": "Fee Configuration",
  "/recovery": "Fund Recovery",
  "/challenges": "Challenge Monitoring",
  "/wallets": "Wallet Settings",
  "/ownership": "Ownership & Security",
};

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Admin Dashboard";

  return (
    <header className="header">
      <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
        <button
          className="mobile-menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-actions">
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="address"
        />
      </div>
    </header>
  );
}
