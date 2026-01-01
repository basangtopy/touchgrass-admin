import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isAdmin } from "./data/adminWallets";
import Layout from "./components/layout/Layout";
import { ToastProvider } from "./contexts/ToastContext";
import ToastContainer from "./components/ui/ToastContainer";
import { Leaf, ShieldX } from "lucide-react";

// Lazy load page components for better initial bundle size
const Overview = lazy(() => import("./pages/Overview"));
const TokenManagement = lazy(() => import("./pages/TokenManagement"));
const FeeConfiguration = lazy(() => import("./pages/FeeConfiguration"));
const FundRecovery = lazy(() => import("./pages/FundRecovery"));
const Challenges = lazy(() => import("./pages/Challenges"));
const WalletSettings = lazy(() => import("./pages/WalletSettings"));
const Ownership = lazy(() => import("./pages/Ownership"));

// Loading fallback component
function PageLoader() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "50vh" }}
    >
      <div className="loading-spinner" />
    </div>
  );
}

function App() {
  const { isConnected, address } = useAccount();

  // Not connected - show connect screen
  if (!isConnected) {
    return (
      <div className="connect-screen">
        <div className="connect-card">
          <div className="connect-glow" />
          <div className="connect-icon">
            <Leaf size={32} />
          </div>
          <h1 className="connect-title">TouchGrass Admin</h1>
          <p className="connect-subtitle">
            Manage your contract, tokens, and challenges from one powerful
            dashboard.
          </p>
          <p className="connect-hint">Connect your admin wallet to continue</p>
          <div className="connect-button-wrapper">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  // Connected but not admin - show unauthorized
  if (!isAdmin(address)) {
    return (
      <div className="unauthorized-screen">
        <div className="unauthorized-card">
          <div className="unauthorized-glow" />
          <div className="unauthorized-icon">
            <ShieldX size={32} />
          </div>
          <h1 className="unauthorized-title">Access Restricted</h1>
          <p className="unauthorized-subtitle">
            This dashboard is only accessible by the contract owner.
          </p>
          <div className="unauthorized-wallet-info">
            <span className="unauthorized-label">Connected wallet</span>
            <code className="unauthorized-address">
              {address?.slice(0, 10)}...{address?.slice(-8)}
            </code>
          </div>
          <p className="unauthorized-hint">
            Switch to an authorized wallet or disconnect
          </p>
          <div className="connect-button-wrapper">
            <ConnectButton showBalance={false} />
          </div>
        </div>
      </div>
    );
  }

  // Authorized - show dashboard with lazy loaded routes
  return (
    <ToastProvider>
      <ToastContainer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="tokens" element={<TokenManagement />} />
            <Route path="fees" element={<FeeConfiguration />} />
            <Route path="recovery" element={<FundRecovery />} />
            <Route path="challenges" element={<Challenges />} />
            <Route path="wallets" element={<WalletSettings />} />
            <Route path="ownership" element={<Ownership />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}

export default App;
