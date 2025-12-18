import { useState, useEffect } from "react";
import { Contract, formatUnits } from "ethers";
import { useEthersSigner } from "../utils/ethersAdapter";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../data/contractConfig";
import Card from "../components/ui/Card";
import {
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Settings,
} from "lucide-react";

export default function FeeConfiguration() {
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [config, setConfig] = useState({
    usdcFee: "0",
    usdcMinStake: "0",
    minDuration: "0",
    maxDuration: "0",
    gracePeriod: "0",
    lockMultiplier: "0",
    minPenaltyPercentage: "0",
    pendingFeeUpdate: null,
  });

  const [forms, setForms] = useState({
    newFee: "",
    newMinStake: "",
    minDuration: "",
    maxDuration: "",
    gracePeriod: "",
    lockMultiplier: "",
    minPenaltyPercentage: "",
  });

  useEffect(() => {
    const fetchConfig = async () => {
      if (!signer) return;

      try {
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const [
          usdcFee,
          usdcMinStake,
          minDuration,
          maxDuration,
          gracePeriod,
          lockMultiplier,
          minPenaltyPercentage,
        ] = await Promise.all([
          contract.usdcFee(),
          contract.usdcMinStake(),
          contract.MIN_DURATION(),
          contract.MAX_DURATION(),
          contract.GRACE_PERIOD(),
          contract.LOCK_MULTIPLIER(),
          contract.MIN_PENALTY_PERCENTAGE(),
        ]);

        // Check pending fee update
        let pendingFeeUpdate = null;
        try {
          const pending = await contract.pendingUSDCFeeUpdate();
          if (pending.isPending) {
            pendingFeeUpdate = {
              newFee: formatUnits(pending.newFee, 6),
              effectiveTime: Number(pending.effectiveTime) * 1000,
              canExecute: Date.now() >= Number(pending.effectiveTime) * 1000,
            };
          }
        } catch {
          // No pending update
        }

        setConfig({
          usdcFee: formatUnits(usdcFee, 6),
          usdcMinStake: formatUnits(usdcMinStake, 6),
          minDuration: (Number(minDuration) / 60).toString(), // To minutes
          maxDuration: (Number(maxDuration) / 86400).toString(), // To days
          gracePeriod: (Number(gracePeriod) / 86400).toString(), // To days
          lockMultiplier: lockMultiplier.toString(),
          minPenaltyPercentage: minPenaltyPercentage.toString(),
          pendingFeeUpdate,
        });
      } catch (error) {
        console.error("Error fetching config:", error);
        setError("Failed to fetch configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [signer]);

  const handleScheduleFee = async () => {
    if (!forms.newFee) return;
    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.scheduleUSDCFeeUpdate(parseFloat(forms.newFee));
      await tx.wait();
      setSuccess(`Fee update scheduled to $${forms.newFee}`);
      setForms({ ...forms, newFee: "" });
      // Refresh
      window.location.reload();
    } catch (error) {
      setError(error.reason || "Failed to schedule fee update");
    } finally {
      setProcessing(false);
    }
  };

  const handleExecuteFee = async () => {
    setProcessing(true);
    setError("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.executeUSDCFeeUpdate();
      await tx.wait();
      setSuccess("Fee update executed successfully!");
      window.location.reload();
    } catch (error) {
      setError(error.reason || "Failed to execute fee update");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelFee = async () => {
    setProcessing(true);
    setError("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.cancelUSDCFeeUpdate();
      await tx.wait();
      setSuccess("Fee update cancelled");
      window.location.reload();
    } catch (error) {
      setError(error.reason || "Failed to cancel fee update");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateMinStake = async () => {
    if (!forms.newMinStake) return;
    setProcessing(true);
    setError("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.setUSDCMinStake(parseFloat(forms.newMinStake));
      await tx.wait();
      setSuccess(`Minimum stake updated to $${forms.newMinStake}`);
      window.location.reload();
    } catch (error) {
      setError(error.reason || "Failed to update minimum stake");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateDurations = async () => {
    if (!forms.minDuration || !forms.maxDuration) return;
    setProcessing(true);
    setError("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.updateDurationBounds(
        parseInt(forms.minDuration),
        parseInt(forms.maxDuration)
      );
      await tx.wait();
      setSuccess("Duration bounds updated");
      window.location.reload();
    } catch (error) {
      setError(error.reason || "Failed to update duration bounds");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateGracePeriod = async () => {
    if (!forms.gracePeriod) return;
    setProcessing(true);
    setError("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.setGracePeriod(parseInt(forms.gracePeriod));
      await tx.wait();
      setSuccess("Grace period updated");
      window.location.reload();
    } catch (error) {
      setError(error.reason || "Failed to update grace period");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateLockMultiplier = async () => {
    if (!forms.lockMultiplier) return;
    setProcessing(true);
    setError("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.setLockMultiplier(
        parseInt(forms.lockMultiplier)
      );
      await tx.wait();
      setSuccess("Lock multiplier updated");
      window.location.reload();
    } catch (error) {
      setError(error.reason || "Failed to update lock multiplier");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateMinPenalty = async () => {
    if (!forms.minPenaltyPercentage) return;
    setProcessing(true);
    setError("");

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.setMinPenaltyPercentage(
        parseInt(forms.minPenaltyPercentage)
      );
      await tx.wait();
      setSuccess("Minimum penalty percentage updated");
      window.location.reload();
    } catch (error) {
      setError(error.reason || "Failed to update minimum penalty");
    } finally {
      setProcessing(false);
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
        {/* Fee Settings */}
        <Card title="Fee Settings">
          <div className="mb-4">
            <div className="text-muted mb-1">Current Fee</div>
            <div className="font-bold" style={{ fontSize: "1.5rem" }}>
              ${parseFloat(config.usdcFee).toFixed(2)}
            </div>
          </div>

          {config.pendingFeeUpdate && (
            <div className="alert warning mb-4">
              <Clock size={18} />
              <div>
                <div className="alert-title">Pending Update</div>
                <div className="alert-message">
                  New fee: ${config.pendingFeeUpdate.newFee}
                  <br />
                  Effective:{" "}
                  {new Date(
                    config.pendingFeeUpdate.effectiveTime
                  ).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {config.pendingFeeUpdate ? (
            <div className="flex gap-2">
              {config.pendingFeeUpdate.canExecute && (
                <button
                  className="btn btn-primary"
                  onClick={handleExecuteFee}
                  disabled={processing}
                >
                  Execute Update
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={handleCancelFee}
                disabled={processing}
              >
                Cancel Update
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                className="form-input"
                placeholder="New fee (e.g., 1.00)"
                value={forms.newFee}
                onChange={(e) => setForms({ ...forms, newFee: e.target.value })}
                step="0.01"
                min="0.1"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={handleScheduleFee}
                disabled={processing || !forms.newFee}
              >
                Schedule
              </button>
            </div>
          )}
        </Card>

        {/* Min Stake */}
        <Card title="Minimum Stake">
          <div className="mb-4">
            <div className="text-muted mb-1">Current Min Stake</div>
            <div className="font-bold" style={{ fontSize: "1.5rem" }}>
              ${parseFloat(config.usdcMinStake).toFixed(2)}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              className="form-input"
              placeholder="New min stake (e.g., 5.00)"
              value={forms.newMinStake}
              onChange={(e) =>
                setForms({ ...forms, newMinStake: e.target.value })
              }
              step="0.01"
              min="0.1"
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-primary"
              onClick={handleUpdateMinStake}
              disabled={processing || !forms.newMinStake}
            >
              Update
            </button>
          </div>
        </Card>

        {/* Duration Bounds */}
        <Card title="Duration Bounds">
          <div
            className="mb-4"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <div className="text-muted mb-1">Min Duration</div>
              <div className="font-bold">{config.minDuration} min</div>
            </div>
            <div>
              <div className="text-muted mb-1">Max Duration</div>
              <div className="font-bold">{config.maxDuration} days</div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
            }}
          >
            <input
              type="number"
              className="form-input"
              placeholder="Min (minutes)"
              value={forms.minDuration}
              onChange={(e) =>
                setForms({ ...forms, minDuration: e.target.value })
              }
            />
            <input
              type="number"
              className="form-input"
              placeholder="Max (days)"
              value={forms.maxDuration}
              onChange={(e) =>
                setForms({ ...forms, maxDuration: e.target.value })
              }
            />
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={handleUpdateDurations}
            disabled={processing || !forms.minDuration || !forms.maxDuration}
            style={{ width: "100%", marginTop: "0.75rem" }}
          >
            Update Bounds
          </button>
        </Card>

        {/* Other Parameters */}
        <Card title="Other Parameters">
          <div className="form-group">
            <label className="form-label">
              Grace Period (current: {config.gracePeriod} days)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                className="form-input"
                placeholder="Days"
                value={forms.gracePeriod}
                onChange={(e) =>
                  setForms({ ...forms, gracePeriod: e.target.value })
                }
                min="1"
                max="30"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-secondary"
                onClick={handleUpdateGracePeriod}
                disabled={processing || !forms.gracePeriod}
              >
                Update
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Lock Multiplier (current: {config.lockMultiplier}x)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                className="form-input"
                placeholder="Multiplier"
                value={forms.lockMultiplier}
                onChange={(e) =>
                  setForms({ ...forms, lockMultiplier: e.target.value })
                }
                min="3"
                max="15"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-secondary"
                onClick={handleUpdateLockMultiplier}
                disabled={processing || !forms.lockMultiplier}
              >
                Update
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Min Penalty % (current: {config.minPenaltyPercentage}%)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                className="form-input"
                placeholder="Percentage"
                value={forms.minPenaltyPercentage}
                onChange={(e) =>
                  setForms({ ...forms, minPenaltyPercentage: e.target.value })
                }
                min="5"
                max="50"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-secondary"
                onClick={handleUpdateMinPenalty}
                disabled={processing || !forms.minPenaltyPercentage}
              >
                Update
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
