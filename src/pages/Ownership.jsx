import { useState, useEffect } from "react";
import { Contract } from "ethers";
import { useEthersSigner } from "../utils/ethersAdapter";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../data/contractConfig";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmModal from "../components/ui/ConfirmModal";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Power,
  UserX,
  UserCheck,
} from "lucide-react";

export default function Ownership() {
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [status, setStatus] = useState({
    owner: "",
    isPaused: false,
    pendingOwner: "",
    canAcceptOwnership: false,
    renunciationInitiated: false,
    canExecuteRenunciation: false,
    renunciationTimeRemaining: 0,
  });

  const [newOwner, setNewOwner] = useState("");

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "danger",
    onConfirm: () => {},
  });

  useEffect(() => {
    const fetchStatus = async () => {
      if (!signer) return;

      try {
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const [owner, isPaused] = await Promise.all([
          contract.owner(),
          contract.paused(),
        ]);

        // Get pending ownership info
        let pendingOwner = "";
        let canAcceptOwnership = false;
        try {
          pendingOwner = await contract.pendingOwner();
          if (pendingOwner !== "0x0000000000000000000000000000000000000000") {
            canAcceptOwnership = await contract.canAcceptOwnership();
          }
        } catch {
          // Function might not exist
        }

        // Get renunciation status
        let renunciationInitiated = false;
        let canExecuteRenunciation = false;
        let renunciationTimeRemaining = 0;
        try {
          renunciationInitiated =
            await contract.ownershipRenunciationInitiated();
          if (renunciationInitiated) {
            canExecuteRenunciation = await contract.canExecuteRenunciation();
            renunciationTimeRemaining = Number(
              await contract.renunciationTimeRemaining()
            );
          }
        } catch {
          // Functions might not exist
        }

        setStatus({
          owner,
          isPaused,
          pendingOwner,
          canAcceptOwnership,
          renunciationInitiated,
          canExecuteRenunciation,
          renunciationTimeRemaining,
        });
      } catch (error) {
        console.error("Error fetching status:", error);
        setError("Failed to fetch ownership status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [signer]);

  const closeConfirmModal = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const handlePause = () => {
    setConfirmModal({
      isOpen: true,
      title: "Pause Contract",
      message:
        "Are you sure you want to PAUSE the contract? New challenge creation will be blocked. Existing withdrawals will still work.",
      variant: "warning",
      onConfirm: async () => {
        closeConfirmModal();
        setProcessing(true);
        setError("");

        try {
          const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          const tx = await contract.pause();
          await tx.wait();
          setSuccess("Contract paused");
          window.location.reload();
        } catch (error) {
          setError(error.reason || "Failed to pause contract");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleUnpause = async () => {
    setProcessing(true);
    setError("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.unpause();
      await tx.wait();
      setSuccess("Contract unpaused");
      window.location.reload();
    } catch (error) {
      setError(error.reason || "Failed to unpause contract");
    } finally {
      setProcessing(false);
    }
  };

  const handleTransferOwnership = () => {
    if (!newOwner) return;

    setConfirmModal({
      isOpen: true,
      title: "Transfer Ownership",
      message: `Transfer ownership to ${newOwner.slice(
        0,
        10
      )}...${newOwner.slice(
        -8
      )}? This requires a 48-hour delay before the new owner can accept.`,
      variant: "warning",
      onConfirm: async () => {
        closeConfirmModal();
        setProcessing(true);
        setError("");

        try {
          const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          const tx = await contract.transferOwnership(newOwner);
          await tx.wait();
          setSuccess("Ownership transfer initiated. 48-hour delay started.");
          setNewOwner("");
          window.location.reload();
        } catch (error) {
          setError(error.reason || "Failed to initiate transfer");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleCancelTransfer = async () => {
    setProcessing(true);
    setError("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.cancelOwnershipTransfer();
      await tx.wait();
      setSuccess("Ownership transfer cancelled");
      window.location.reload();
    } catch (error) {
      setError(error.reason || "Failed to cancel transfer");
    } finally {
      setProcessing(false);
    }
  };

  const handleAcceptOwnership = async () => {
    setProcessing(true);
    setError("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.acceptOwnership();
      await tx.wait();
      setSuccess("Ownership accepted! You are now the owner.");
      window.location.reload();
    } catch (error) {
      setError(error.reason || "Failed to accept ownership");
    } finally {
      setProcessing(false);
    }
  };

  const handleScheduleRenunciation = () => {
    setConfirmModal({
      isOpen: true,
      title: "⚠️ Renounce Ownership",
      message:
        "WARNING: Renouncing ownership makes the contract PERMANENTLY ownerless. This action cannot be undone. All admin functions will be locked forever. Are you absolutely sure?",
      variant: "danger",
      onConfirm: async () => {
        closeConfirmModal();
        setProcessing(true);
        setError("");

        try {
          const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          const tx = await contract.renounceOwnership();
          await tx.wait();
          setSuccess("Renunciation scheduled. 7-day delay started.");
          window.location.reload();
        } catch (error) {
          setError(error.reason || "Failed to schedule renunciation");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleExecuteRenunciation = () => {
    setConfirmModal({
      isOpen: true,
      title: "🚨 FINAL WARNING",
      message:
        "This is your LAST CHANCE. Executing this will permanently remove ALL ownership. The contract will be ownerless forever. Proceed?",
      variant: "danger",
      onConfirm: async () => {
        closeConfirmModal();
        setProcessing(true);
        setError("");

        try {
          const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          const tx = await contract.executeOwnershipRenunciation();
          await tx.wait();
          setSuccess("Ownership renounced. The contract is now ownerless.");
          window.location.reload();
        } catch (error) {
          setError(error.reason || "Failed to execute renunciation");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleCancelRenunciation = async () => {
    setProcessing(true);
    setError("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.cancelOwnershipRenunciation();
      await tx.wait();
      setSuccess("Renunciation cancelled");
      window.location.reload();
    } catch (error) {
      setError(error.reason || "Failed to cancel renunciation");
    } finally {
      setProcessing(false);
    }
  };

  const formatTimeRemaining = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
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

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        {/* Contract Status */}
        <Card title="Contract Status">
          <div className="mb-4">
            <div className="text-muted mb-1">Current Owner</div>
            <div
              className="font-mono"
              style={{ wordBreak: "break-all", fontSize: "0.875rem" }}
            >
              {status.owner}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-muted mb-1">Contract State</div>
            <StatusBadge
              status={status.isPaused ? "paused" : "active"}
              label={status.isPaused ? "Paused" : "Active"}
            />
          </div>

          <div className="flex gap-2">
            {status.isPaused ? (
              <Button
                icon={Power}
                onClick={handleUnpause}
                disabled={processing}
              >
                Unpause Contract
              </Button>
            ) : (
              <Button
                variant="danger"
                icon={Power}
                onClick={handlePause}
                disabled={processing}
              >
                Pause Contract
              </Button>
            )}
          </div>
        </Card>

        {/* Ownership Transfer */}
        <Card title="Ownership Transfer">
          {status.pendingOwner &&
          status.pendingOwner !==
            "0x0000000000000000000000000000000000000000" ? (
            <div>
              <div className="alert warning mb-4">
                <AlertTriangle size={18} />
                <div>
                  <div className="alert-title">Transfer Pending</div>
                  <div className="alert-message">
                    New owner: {status.pendingOwner.slice(0, 10)}...
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {status.canAcceptOwnership && (
                  <Button
                    icon={UserCheck}
                    onClick={handleAcceptOwnership}
                    disabled={processing}
                  >
                    Accept Ownership
                  </Button>
                )}
                <Button
                  variant="danger"
                  onClick={handleCancelTransfer}
                  disabled={processing}
                >
                  Cancel Transfer
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="form-group">
                <label className="form-label">New Owner Address</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="0x..."
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                />
              </div>
              <Button
                onClick={handleTransferOwnership}
                disabled={processing || !newOwner}
              >
                Initiate Transfer (48h delay)
              </Button>
            </div>
          )}
        </Card>

        {/* Dangerous Actions */}
        <Card title="Dangerous Actions" className="col-span-2">
          <div className="alert danger mb-4">
            <AlertTriangle size={20} />
            <div>
              <div className="alert-title">Warning: Irreversible Actions</div>
              <div className="alert-message">
                Renouncing ownership permanently locks all admin functions. This
                cannot be undone.
              </div>
            </div>
          </div>

          {status.renunciationInitiated ? (
            <div>
              <div className="mb-4">
                <StatusBadge
                  status={status.canExecuteRenunciation ? "warning" : "pending"}
                  label={
                    status.canExecuteRenunciation
                      ? "Ready to Execute"
                      : `${formatTimeRemaining(
                          status.renunciationTimeRemaining
                        )} remaining`
                  }
                />
              </div>
              <div className="flex gap-2">
                {status.canExecuteRenunciation && (
                  <Button
                    variant="danger"
                    icon={UserX}
                    onClick={handleExecuteRenunciation}
                    disabled={processing}
                  >
                    Execute Renunciation
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={handleCancelRenunciation}
                  disabled={processing}
                >
                  Cancel Renunciation
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="danger"
              icon={UserX}
              onClick={handleScheduleRenunciation}
              disabled={processing}
            >
              Schedule Renunciation (7 day delay)
            </Button>
          )}
        </Card>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        loading={processing}
      />
    </div>
  );
}
