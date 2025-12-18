import { useState, useEffect } from "react";
import { Contract, formatUnits } from "ethers";
import { useEthersSigner } from "../utils/ethersAdapter";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../data/contractConfig";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import VerifierHealthCard from "../components/ui/VerifierHealthCard";
import { useMultiWalletBalances } from "../hooks/useWalletBalances";
import { formatAddress } from "../utils/helpers";
import {
  DollarSign,
  Users,
  AlertTriangle,
  Shield,
  Clock,
  Coins,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

export default function Overview() {
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    challengeCount: 0,
    isPaused: false,
    owner: "",
    verifier: "",
    charityWallet: "",
    treasuryWallet: "",
    usdcFee: "0",
    usdcMinStake: "0",
    totalProtectedUSD: "0",
    totalRecoverableUSD: "0",
    pendingFeeUpdate: null,
    supportedTokens: [],
  });

  // Fetch wallet balances
  const { walletBalances } = useMultiWalletBalances([
    { name: "charity", address: stats.charityWallet },
    { name: "treasury", address: stats.treasuryWallet },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!signer) {
        setLoading(false);
        return;
      }

      try {
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Fetch basic stats one by one for better error handling
        let challengeCount = 0;
        let isPaused = false;
        let owner = "";
        let verifier = "";
        let charityWallet = "";
        let treasuryWallet = "";
        let usdcFee = "0";
        let usdcMinStake = "0";
        let supportedTokens = [];

        try {
          challengeCount = Number(await contract.challengeCount());
        } catch (e) {
          console.error("Error fetching challengeCount:", e);
        }

        try {
          isPaused = await contract.paused();
        } catch (e) {
          console.error("Error fetching paused:", e);
        }

        try {
          owner = await contract.owner();
        } catch (e) {
          console.error("Error fetching owner:", e);
        }

        try {
          verifier = await contract.verifier();
        } catch (e) {
          console.error("Error fetching verifier:", e);
        }

        try {
          charityWallet = await contract.charityWallet();
        } catch (e) {
          console.error("Error fetching charityWallet:", e);
        }

        try {
          treasuryWallet = await contract.treasuryWallet();
        } catch (e) {
          console.error("Error fetching treasuryWallet:", e);
        }

        try {
          const fee = await contract.usdcFee();
          usdcFee = formatUnits(fee, 6);
        } catch (e) {
          console.error("Error fetching usdcFee:", e);
        }

        try {
          const minStake = await contract.usdcMinStake();
          usdcMinStake = formatUnits(minStake, 6);
        } catch (e) {
          console.error("Error fetching usdcMinStake:", e);
        }

        try {
          supportedTokens = await contract.getAllSupportedTokens();
        } catch (e) {
          console.error("Error fetching supportedTokens:", e);
        }

        // Fetch pending fee update
        let pendingFeeUpdate = null;
        try {
          const pending = await contract.pendingUSDCFeeUpdate();
          if (pending.isPending) {
            pendingFeeUpdate = {
              newFee: formatUnits(pending.newFee, 6),
              effectiveTime: Number(pending.effectiveTime) * 1000,
            };
          }
        } catch {
          // No pending update
        }

        // Fetch protection summary if available
        let totalProtectedUSD = "0";
        let totalRecoverableUSD = "0";
        try {
          const summary = await contract.getGlobalProtectionSummary();
          totalProtectedUSD = formatUnits(summary.totalProtectedUSD, 18);
          totalRecoverableUSD = formatUnits(summary.totalRecoverableUSD, 18);
        } catch {
          // Function might not exist or fail
        }

        setStats({
          challengeCount,
          isPaused,
          owner,
          verifier,
          charityWallet,
          treasuryWallet,
          usdcFee,
          usdcMinStake,
          totalProtectedUSD,
          totalRecoverableUSD,
          pendingFeeUpdate,
          supportedTokens,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Failed to fetch contract data. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [signer]);

  const formatAddress = (addr) => {
    if (!addr) return "—";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatUSD = (value) => {
    const num = parseFloat(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "50vh" }}
      >
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <div className="alert danger mb-4">
          <AlertTriangle size={20} />
          <div>
            <div className="alert-title">Error</div>
            <div className="alert-message">{error}</div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {stats.isPaused && (
        <div className="alert danger mb-4">
          <AlertTriangle size={20} />
          <div>
            <div className="alert-title">Contract Paused</div>
            <div className="alert-message">
              New challenge creation is disabled. Withdrawals still work.
            </div>
          </div>
        </div>
      )}

      {parseFloat(stats.totalRecoverableUSD) > 0 && (
        <div className="alert warning mb-4">
          <RefreshCw size={20} />
          <div>
            <div className="alert-title">Recoverable Funds Available</div>
            <div className="alert-message">
              {formatUSD(stats.totalRecoverableUSD)} in excess funds can be
              recovered.
            </div>
          </div>
        </div>
      )}

      {stats.pendingFeeUpdate && (
        <div className="alert info mb-4">
          <Clock size={20} />
          <div>
            <div className="alert-title">Pending Fee Update</div>
            <div className="alert-message">
              Fee changing to ${stats.pendingFeeUpdate.newFee} on{" "}
              {new Date(stats.pendingFeeUpdate.effectiveTime).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stat-grid">
        <StatCard
          label="Total Challenges"
          value={stats.challengeCount.toLocaleString()}
          subtitle="All-time created"
          icon={Users}
          variant="info"
        />
        <StatCard
          label="Protected Value"
          value={formatUSD(stats.totalProtectedUSD)}
          subtitle="Locked in challenges"
          icon={Shield}
          variant="success"
        />
        <StatCard
          label="Current Fee"
          value={`$${parseFloat(stats.usdcFee).toFixed(2)}`}
          subtitle="Per challenge"
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          label="Min Stake"
          value={`$${parseFloat(stats.usdcMinStake).toFixed(2)}`}
          subtitle="Minimum commitment"
          icon={TrendingUp}
          variant="info"
        />
      </div>

      {/* Wallet Balances */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
      >
        <Card title="Charity Wallet">
          <div
            className="font-mono text-muted mb-3"
            style={{ fontSize: "0.8125rem" }}
          >
            {stats.charityWallet
              ? formatAddress(stats.charityWallet, 8)
              : "Loading..."}
          </div>
          {walletBalances.charity && walletBalances.charity.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {walletBalances.charity.map((b) => (
                <div
                  key={b.symbol}
                  className="flex justify-between"
                  style={{ fontSize: "0.875rem" }}
                >
                  <span className="font-bold">{b.symbol}</span>
                  <span className="font-mono">
                    {parseFloat(b.balance).toFixed(b.decimals <= 6 ? 2 : 6)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
              Loading balances...
            </div>
          )}
        </Card>
        <Card title="Treasury Wallet">
          <div
            className="font-mono text-muted mb-3"
            style={{ fontSize: "0.8125rem" }}
          >
            {stats.treasuryWallet
              ? formatAddress(stats.treasuryWallet, 8)
              : "Loading..."}
          </div>
          {walletBalances.treasury && walletBalances.treasury.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {walletBalances.treasury.map((b) => (
                <div
                  key={b.symbol}
                  className="flex justify-between"
                  style={{ fontSize: "0.875rem" }}
                >
                  <span className="font-bold">{b.symbol}</span>
                  <span className="font-mono">
                    {parseFloat(b.balance).toFixed(b.decimals <= 6 ? 2 : 6)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
              Loading balances...
            </div>
          )}
        </Card>
      </div>

      {/* Contract Status Card */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <Card title="Contract Status">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <div className="flex justify-between items-center">
              <span className="text-muted">Status</span>
              <StatusBadge
                status={stats.isPaused ? "paused" : "active"}
                label={stats.isPaused ? "Paused" : "Active"}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Owner</span>
              <span className="font-mono">{formatAddress(stats.owner)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Verifier</span>
              <span className="font-mono">{formatAddress(stats.verifier)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Charity Wallet</span>
              <span className="font-mono">
                {formatAddress(stats.charityWallet)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Treasury Wallet</span>
              <span className="font-mono">
                {formatAddress(stats.treasuryWallet)}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Supported Tokens">
          {stats.supportedTokens.length === 0 ? (
            <div className="empty-state">
              <Coins size={32} className="empty-state-icon" />
              <div className="empty-state-title">No tokens configured</div>
              <div className="empty-state-message">
                Add tokens in Token Management
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {stats.supportedTokens.map((token) => (
                <span
                  key={token}
                  style={{
                    background: "var(--bg-tertiary)",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {token}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Verifier Server Health */}
        <VerifierHealthCard />
      </div>
    </div>
  );
}
