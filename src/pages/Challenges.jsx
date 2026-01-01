import { useState, useEffect } from "react";
import { Contract, formatUnits } from "ethers";
import { useEthersSigner } from "../utils/ethersAdapter";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../data/contractConfig";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import StatusBadge from "../components/ui/StatusBadge";
import { formatAddress, formatDuration } from "../utils/helpers";
import { useToast } from "../contexts/ToastContext";
import { parseContractError } from "../utils/errorParser";
import {
  ListChecks,
  AlertCircle,
  Trash2,
  Search,
  Info,
  Wallet,
  Clock,
} from "lucide-react";

export default function Challenges() {
  const signer = useEthersSigner();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [challengeCount, setChallengeCount] = useState(0);
  const [searchId, setSearchId] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryInfo, setRecoveryInfo] = useState(null);

  // Pending withdrawals
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!signer) return;

      try {
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const count = await contract.challengeCount();
        setChallengeCount(Number(count));
      } catch (error) {
        console.error("Error fetching challenge count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [signer]);

  // Fetch pending withdrawals across all tokens
  const fetchPendingWithdrawals = async () => {
    if (!signer) return;

    setLoadingWithdrawals(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tokens = await contract.getAllSupportedTokens();

      // Known token decimals fallback
      const knownDecimals = {
        ETH: 18,
        WETH: 18,
        USDC: 6,
        USDT: 6,
        DAI: 18,
      };

      const withdrawals = [];
      for (const symbol of tokens) {
        try {
          const pending = await contract.getTotalPendingWithdrawals(symbol);
          if (pending > 0) {
            const decimals = knownDecimals[symbol] || 18;
            withdrawals.push({
              symbol,
              amount: formatUnits(pending, decimals),
              decimals,
            });
          }
        } catch {
          // Skip if function doesn't exist or fails
        }
      }

      setPendingWithdrawals(withdrawals);
    } catch (error) {
      console.error("Error fetching pending withdrawals:", error);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  useEffect(() => {
    fetchPendingWithdrawals();
  }, [signer]);

  const searchChallenge = async () => {
    if (!searchId) return;

    setLoading(true);
    setChallenge(null);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const c = await contract.challenges(searchId);

      // Get token symbol
      const tokenSymbol = await contract.tokenSymbols(c.tokenId);

      // Known token decimals fallback
      const knownDecimals = {
        ETH: 18,
        WETH: 18,
        USDC: 6,
        USDT: 6,
        DAI: 18,
      };
      const decimals = knownDecimals[tokenSymbol] || 18;

      setChallenge({
        id: searchId,
        staker: c.staker,
        tokenSymbol,
        tokenId: c.tokenId,
        stakeAmount: formatUnits(c.stakeAmount, decimals),
        startTime: new Date(Number(c.startTime) * 1000),
        duration: Number(c.duration),
        penaltyType: ["Charity", "Dev", "Lock", "Burn"][Number(c.penaltyType)],
        penaltyPercent: Number(c.penaltyPercent),
        isSuccess: c.isSuccess,
        isWithdrawn: c.isWithdrawn,
        gracePeriodSnapshot: Number(c.gracePeriodSnapshot),
        decimals,
      });
    } catch (error) {
      console.error("Search error:", error);
      showToast({
        type: "error",
        title: "Not Found",
        message: "Challenge not found",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSweepPenalty = (challengeId) => {
    setConfirmModal({
      isOpen: true,
      title: "Sweep Penalty",
      message:
        "Are you sure you want to sweep this penalty? This action cannot be undone and will distribute the penalty to the designated destination.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setProcessing(true);

        try {
          const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          const tx = await contract.sweepPenalty(challengeId);
          await tx.wait();
          showToast({
            type: "success",
            title: "Success",
            message: "Penalty swept successfully",
          });
          searchChallenge();
        } catch (error) {
          console.error("Sweep error:", error);
          showToast({ type: "error", ...parseContractError(error) });
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const fetchRecoveryInfo = async (challengeId) => {
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const info = await contract.getChallengeRecoveryInfo(challengeId);

      setRecoveryInfo({
        staker: info.staker,
        tokenId: info.tokenId,
        tokenSymbol: info.tokenSymbol,
        stakeAmount: formatUnits(info.stakeAmount, 18),
        isWithdrawn: info.isWithdrawn,
        isSuccess: info.isSuccess,
        unlockTime: new Date(Number(info.unlockTime) * 1000),
      });
      setShowRecoveryModal(true);
    } catch (error) {
      console.error("Recovery info error:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch recovery info",
      });
    }
  };

  const getExpirationTime = (startTime, duration) => {
    return new Date(startTime.getTime() + duration * 1000);
  };

  const canSweep = (challenge) => {
    if (!challenge) return false;
    if (challenge.isWithdrawn || challenge.isSuccess) return false;

    const expiration = getExpirationTime(
      challenge.startTime,
      challenge.duration
    );
    const gracePeriodEnd = new Date(
      expiration.getTime() + challenge.gracePeriodSnapshot * 1000
    );
    const now = Date.now();

    return now > gracePeriodEnd.getTime() && challenge.penaltyType !== "Lock";
  };

  if (loading && !searchId) {
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        {/* Stats */}
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div className="text-muted">Total Challenges Created</div>
              <div className="font-bold" style={{ fontSize: "2rem" }}>
                {challengeCount.toLocaleString()}
              </div>
            </div>
            <ListChecks
              size={48}
              className="text-muted"
              style={{ opacity: 0.3 }}
            />
          </div>
        </Card>

        {/* Pending Withdrawals Summary */}
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div className="text-muted">Pending Withdrawals</div>
              <div className="font-bold" style={{ fontSize: "2rem" }}>
                {pendingWithdrawals.length}
              </div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                Tokens with failed transfers
              </div>
            </div>
            <Wallet size={48} className="text-muted" style={{ opacity: 0.3 }} />
          </div>
        </Card>
      </div>

      {/* Pending Withdrawals Table */}
      {pendingWithdrawals.length > 0 && (
        <Card title="Pending Withdrawals" className="mb-4">
          <div className="alert warning mb-4">
            <AlertCircle size={18} />
            <div>
              <div className="alert-message">
                These are users who had failed ETH transfers. They can claim
                manually via the contract.
              </div>
            </div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Total Pending</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdrawals.map((w) => (
                  <tr key={w.symbol}>
                    <td className="font-bold">{w.symbol}</td>
                    <td className="font-mono">
                      {parseFloat(w.amount).toFixed(6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Search */}
      <Card title="Challenge Lookup" className="mb-4">
        <div className="flex gap-2">
          <input
            type="number"
            className="form-input"
            placeholder="Enter Challenge ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            min="0"
            style={{ flex: 1 }}
          />
          <Button
            icon={Search}
            onClick={searchChallenge}
            disabled={!searchId || loading}
          >
            Search
          </Button>
        </div>
      </Card>

      {/* Challenge Details */}
      {challenge && (
        <Card title={`Challenge #${challenge.id}`}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
            }}
          >
            <div>
              <div className="form-group">
                <label className="form-label">Staker</label>
                <div
                  className="font-mono"
                  style={{ fontSize: "0.875rem", wordBreak: "break-all" }}
                >
                  {challenge.staker}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Stake</label>
                <div className="font-bold">
                  {parseFloat(challenge.stakeAmount).toFixed(6)}{" "}
                  {challenge.tokenSymbol}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duration</label>
                <div>{formatDuration(challenge.duration)}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Start Time</label>
                <div>{challenge.startTime.toLocaleString()}</div>
              </div>
            </div>

            <div>
              <div className="form-group">
                <label className="form-label">Expiration</label>
                <div>
                  {getExpirationTime(
                    challenge.startTime,
                    challenge.duration
                  ).toLocaleString()}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Penalty</label>
                <div>
                  {challenge.penaltyPercent}% → {challenge.penaltyType}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="flex gap-2">
                  {challenge.isSuccess && (
                    <StatusBadge status="success" label="Verified" />
                  )}
                  {challenge.isWithdrawn && (
                    <StatusBadge status="info" label="Withdrawn" />
                  )}
                  {!challenge.isSuccess && !challenge.isWithdrawn && (
                    <StatusBadge
                      status={
                        Date.now() >
                        getExpirationTime(
                          challenge.startTime,
                          challenge.duration
                        ).getTime()
                          ? "warning"
                          : "active"
                      }
                      label={
                        Date.now() >
                        getExpirationTime(
                          challenge.startTime,
                          challenge.duration
                        ).getTime()
                          ? "Expired"
                          : "Active"
                      }
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  icon={Info}
                  onClick={() => fetchRecoveryInfo(challenge.id)}
                  disabled={processing}
                >
                  Recovery Info
                </Button>
                {canSweep(challenge) && (
                  <Button
                    variant="danger"
                    icon={Trash2}
                    onClick={() => handleSweepPenalty(challenge.id)}
                    disabled={processing}
                  >
                    Sweep Penalty
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recovery Info Modal */}
      <Modal
        isOpen={showRecoveryModal}
        onClose={() => {
          setShowRecoveryModal(false);
          setRecoveryInfo(null);
        }}
        title="Challenge Recovery Info"
      >
        {recoveryInfo && (
          <div>
            <div className="form-group">
              <label className="form-label">Staker</label>
              <div
                className="font-mono"
                style={{ fontSize: "0.8125rem", wordBreak: "break-all" }}
              >
                {recoveryInfo.staker}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Token</label>
              <div>{recoveryInfo.tokenSymbol}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Stake Amount</label>
              <div className="font-mono">
                {parseFloat(recoveryInfo.stakeAmount).toFixed(6)}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="flex gap-2">
                {recoveryInfo.isSuccess && (
                  <StatusBadge status="success" label="Verified" />
                )}
                {recoveryInfo.isWithdrawn && (
                  <StatusBadge status="info" label="Withdrawn" />
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Unlock Time</label>
              <div>
                {recoveryInfo.unlockTime.getTime() > 0
                  ? recoveryInfo.unlockTime.toLocaleString()
                  : "N/A"}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        loading={processing}
      />
    </div>
  );
}
