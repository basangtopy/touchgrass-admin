import { useState, useEffect } from "react";
import { Contract, formatUnits } from "ethers";
import { useEthersSigner } from "../utils/ethersAdapter";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  VIEWS_CONTRACT_ADDRESS,
  VIEWS_CONTRACT_ABI,
} from "../data/contractConfig";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Download,
  AlertTriangle,
} from "lucide-react";

export default function FundRecovery() {
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [recovery, setRecovery] = useState({
    tokens: [],
    hasRecoverable: false,
    totalRecoverableUSD: "0",
  });

  const [recipientAddress, setRecipientAddress] = useState("");

  const fetchRecoveryStatus = async () => {
    if (!signer) return;

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // Use Views contract for getAllRecoveryStatus
      const viewsContract = new Contract(
        VIEWS_CONTRACT_ADDRESS,
        VIEWS_CONTRACT_ABI,
        signer
      );
      const status = await viewsContract.getAllRecoveryStatus(0, 100);

      // Known token decimals fallback
      const knownDecimals = {
        ETH: 18,
        WETH: 18,
        USDC: 6,
        USDT: 6,
        DAI: 18,
      };

      // Use a map to deduplicate tokens by symbol
      const tokenMap = new Map();
      for (let i = 0; i < status.symbols.length; i++) {
        const symbol = status.symbols[i];
        // Skip if already processed (avoid duplicates)
        if (tokenMap.has(symbol)) continue;

        const decimals = knownDecimals[symbol] || 18;
        tokenMap.set(symbol, {
          symbol,
          address: status.addresses[i],
          balance: formatUnits(status.contractBalances[i], decimals),
          locked: formatUnits(status.lockedAmounts[i], decimals),
          pending: formatUnits(status.pendingAmounts[i], decimals),
          recoverable: formatUnits(status.recoverableAmounts[i], decimals),
          decimals,
        });
      }

      const tokens = Array.from(tokenMap.values());

      // Check if any recoverable
      let hasRecoverable = false;
      try {
        const result = await viewsContract.hasRecoverableFunds();
        hasRecoverable = result.canRecover;
      } catch {
        hasRecoverable = tokens.some((t) => parseFloat(t.recoverable) > 0);
      }

      // Get total recoverable USD
      let totalRecoverableUSD = "0";
      try {
        const summary = await viewsContract.getGlobalProtectionSummary();
        totalRecoverableUSD = formatUnits(summary.totalRecoverableUSD, 18);
      } catch {
        // Function might not exist
      }

      setRecovery({
        tokens,
        hasRecoverable,
        totalRecoverableUSD,
      });

      // Set default recipient to treasury
      try {
        const treasury = await contract.treasuryWallet();
        setRecipientAddress(treasury);
      } catch {
        // Use connected wallet
        const address = await signer.getAddress();
        setRecipientAddress(address);
      }
    } catch (error) {
      console.error("Error fetching recovery status:", error);
      setError("Failed to fetch recovery status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecoveryStatus();
  }, [signer]);

  const handleRecoverToken = async (symbol) => {
    if (!recipientAddress) {
      setError("Please enter a recipient address");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      let tx;
      if (symbol === "ETH") {
        tx = await contract.recoverETH(recipientAddress);
      } else {
        tx = await contract.recoverERC20BySymbol(symbol, recipientAddress);
      }

      setSuccess(`Recovering ${symbol}... waiting for confirmation`);
      await tx.wait();

      setSuccess(`Successfully recovered ${symbol}!`);
      fetchRecoveryStatus();
    } catch (error) {
      console.error("Recovery error:", error);
      setError(error.reason || "Failed to recover funds");
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchRecover = async () => {
    if (!recipientAddress) {
      setError("Please enter a recipient address");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tokensToRecover = recovery.tokens
        .filter((t) => parseFloat(t.recoverable) > 0)
        .map((t) => t.symbol);

      if (tokensToRecover.length === 0) {
        setError("No tokens to recover");
        return;
      }

      const tx = await contract.batchRecoverTokens(
        tokensToRecover,
        recipientAddress
      );
      setSuccess("Batch recovering... waiting for confirmation");
      await tx.wait();

      setSuccess(`Successfully recovered ${tokensToRecover.length} token(s)!`);
      fetchRecoveryStatus();
    } catch (error) {
      console.error("Batch recovery error:", error);
      setError(error.reason || "Batch recovery failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyAccounting = async (symbol) => {
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const result = await contract.verifyFundAccounting(symbol);

      if (result.isBalanced) {
        setSuccess(`${symbol} accounting verified ✓`);
      } else {
        setError(
          `${symbol} has discrepancy: ${formatUnits(result.discrepancy, 18)}`
        );
      }
    } catch (error) {
      setError(`Failed to verify ${symbol} accounting`);
    }
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

  const recoverableTokens = recovery.tokens.filter(
    (t) => parseFloat(t.recoverable) > 0
  );

  return (
    <div>
      {error && (
        <div className="alert danger mb-4">
          <AlertCircle size={20} />
          <div>
            <div className="alert-title">Error</div>
            <div className="alert-message">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="alert success mb-4">
          <CheckCircle size={20} />
          <div>
            <div className="alert-title">Success</div>
            <div className="alert-message">{success}</div>
          </div>
        </div>
      )}

      {recovery.hasRecoverable && (
        <div className="alert warning mb-4">
          <AlertTriangle size={20} />
          <div>
            <div className="alert-title">Recoverable Funds Available</div>
            <div className="alert-message">
              Approximately $
              {parseFloat(recovery.totalRecoverableUSD).toFixed(2)} in excess
              funds can be recovered.
            </div>
          </div>
        </div>
      )}

      {/* Recovery Controls */}
      <Card title="Recovery Destination" className="mb-4">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Recipient Address</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="form-input font-mono"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              style={{ flex: 1 }}
            />
            {recoverableTokens.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={handleBatchRecover}
                disabled={processing || !recipientAddress}
              >
                <Download size={16} />
                Recover All ({recoverableTokens.length})
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Token Status Table */}
      <Card title="Token Recovery Status">
        {recovery.tokens.length === 0 ? (
          <div className="empty-state">
            <RefreshCw size={48} className="empty-state-icon" />
            <div className="empty-state-title">No tokens found</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Contract Balance</th>
                  <th>Locked</th>
                  <th>Pending</th>
                  <th>Recoverable</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recovery.tokens.map((token) => {
                  const hasRecoverable = parseFloat(token.recoverable) > 0;
                  return (
                    <tr key={token.symbol}>
                      <td>
                        <span className="font-bold">{token.symbol}</span>
                      </td>
                      <td className="font-mono">
                        {parseFloat(token.balance).toFixed(6)}
                      </td>
                      <td className="font-mono">
                        {parseFloat(token.locked).toFixed(6)}
                      </td>
                      <td className="font-mono">
                        {parseFloat(token.pending).toFixed(6)}
                      </td>
                      <td>
                        <span
                          className={`font-mono ${
                            hasRecoverable ? "text-warning font-bold" : ""
                          }`}
                        >
                          {parseFloat(token.recoverable).toFixed(6)}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {hasRecoverable && (
                            <button
                              className="btn btn-primary"
                              onClick={() => handleRecoverToken(token.symbol)}
                              disabled={processing}
                              style={{
                                padding: "0.375rem 0.75rem",
                                fontSize: "0.8125rem",
                              }}
                            >
                              Recover
                            </button>
                          )}
                          <button
                            className="btn btn-ghost"
                            onClick={() => handleVerifyAccounting(token.symbol)}
                            disabled={processing}
                            title="Verify accounting"
                          >
                            <CheckCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
