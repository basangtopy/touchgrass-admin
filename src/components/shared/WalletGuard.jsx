import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isAdmin } from "../../data/adminWallets";
import { ShieldX, Wallet } from "lucide-react";

/**
 * Wrapper component that guards routes for admin-only access
 */
export default function WalletGuard({ children }) {
  const { isConnected, address } = useAccount();

  // Not connected - show connect screen
  if (!isConnected) {
    return (
      <div className="connect-screen">
        <div className="connect-card">
          <div className="connect-icon">
            <Wallet size={28} />
          </div>
          <h1 className="connect-title">TouchGrass Admin</h1>
          <p className="connect-subtitle">
            Connect your wallet to access the admin dashboard
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  // Connected but not admin - show unauthorized
  if (!isAdmin(address)) {
    return (
      <div className="unauthorized-screen">
        <div className="unauthorized-card">
          <div className="unauthorized-icon">
            <ShieldX size={28} />
          </div>
          <h1 className="connect-title">Unauthorized</h1>
          <p className="connect-subtitle">
            Your wallet ({address?.slice(0, 6)}...{address?.slice(-4)}) is not
            authorized to access this dashboard.
          </p>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              marginTop: "1rem",
            }}
          >
            Contact the contract owner to request access.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  // Authorized - render children
  return children;
}
