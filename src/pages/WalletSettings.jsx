import { useState, useEffect } from "react";
import { Contract } from "ethers";
import { useEthersSigner } from "../utils/ethersAdapter";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../data/contractConfig";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import { formatAddress } from "../utils/helpers";
import { useMultiWalletBalances } from "../hooks/useWalletBalances";
import { useToast } from "../contexts/ToastContext";
import { parseContractError } from "../utils/errorParser";
import {
  Wallet,
  Shield,
  Building,
  Heart,
  Plus,
  Trash2,
  Users,
  UserCheck,
} from "lucide-react";

export default function WalletSettings() {
  const signer = useEthersSigner();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [wallets, setWallets] = useState({
    verifier: "",
    charity: "",
    treasury: "",
  });

  // Tracked lists
  const [multiSigs, setMultiSigs] = useState([]);
  const [trustedRecipients, setTrustedRecipients] = useState([]);

  const [forms, setForms] = useState({
    newVerifier: "",
    newCharity: "",
    newTreasury: "",
    newMultiSig: "",
  });

  // Modal states
  const [showMultiSigModal, setShowMultiSigModal] = useState(false);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "warning",
    onConfirm: () => {},
  });

  // Fetch wallet balances
  const { walletBalances } = useMultiWalletBalances([
    { name: "charity", address: wallets.charity },
    { name: "treasury", address: wallets.treasury },
  ]);

  useEffect(() => {
    const fetchWallets = async () => {
      if (!signer) return;

      try {
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const [verifier, charity, treasury] = await Promise.all([
          contract.verifier(),
          contract.charityWallet(),
          contract.treasuryWallet(),
        ]);

        setWallets({ verifier, charity, treasury });

        // Fetch multi-sig whitelist from events
        try {
          const addedFilter = contract.filters.MultiSigWhitelisted();
          const removedFilter = contract.filters.MultiSigRemovedFromWhitelist();

          const [addedEvents, removedEvents] = await Promise.all([
            contract.queryFilter(addedFilter),
            contract.queryFilter(removedFilter),
          ]);

          // Merge and sort events chronologically to handle re-additions correctly
          const allEvents = [
            ...addedEvents.map((e) => ({
              address: e.args.multiSig,
              type: "add",
              blockNumber: e.blockNumber,
              logIndex: e.logIndex,
            })),
            ...removedEvents.map((e) => ({
              address: e.args.multiSig,
              type: "remove",
              blockNumber: e.blockNumber,
              logIndex: e.logIndex,
            })),
          ].sort(
            (a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex
          );

          // Process in order - final state is determined by the last action for each address
          const addressState = new Map();
          allEvents.forEach((event) => {
            addressState.set(event.address, event.type === "add");
          });

          const currentMultiSigs = [...addressState.entries()]
            .filter(([, isActive]) => isActive)
            .map(([address]) => address);
          setMultiSigs(currentMultiSigs);
        } catch (e) {
          console.warn("Could not fetch multi-sig events:", e.message);
        }

        // Fetch trusted recipients from events
        try {
          const addedFilter = contract.filters.TrustedRecipientAdded();
          const removedFilter = contract.filters.TrustedRecipientRemoved();

          const [addedEvents, removedEvents] = await Promise.all([
            contract.queryFilter(addedFilter),
            contract.queryFilter(removedFilter),
          ]);

          // Merge and sort events chronologically to handle re-additions correctly
          const allEvents = [
            ...addedEvents.map((e) => ({
              address: e.args.recipient,
              type: "add",
              blockNumber: e.blockNumber,
              logIndex: e.logIndex,
            })),
            ...removedEvents.map((e) => ({
              address: e.args.recipient,
              type: "remove",
              blockNumber: e.blockNumber,
              logIndex: e.logIndex,
            })),
          ].sort(
            (a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex
          );

          // Process in order - final state is determined by the last action for each address
          const addressState = new Map();
          // Include charity and treasury - they're added in constructor without events
          addressState.set(charity, true);
          addressState.set(treasury, true);
          allEvents.forEach((event) => {
            addressState.set(event.address, event.type === "add");
          });

          const currentRecipients = [...addressState.entries()]
            .filter(([, isActive]) => isActive)
            .map(([address]) => address);
          setTrustedRecipients(currentRecipients);
        } catch (e) {
          console.warn("Could not fetch trusted recipient events:", e.message);
          // Fallback: at minimum, charity and treasury are trusted recipients
          setTrustedRecipients([charity, treasury]);
        }
      } catch (error) {
        console.error("Error fetching wallets:", error);
        showToast({ type: "error", ...parseContractError(error) });
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, [signer]);

  const handleUpdateVerifier = async () => {
    if (!forms.newVerifier) return;
    setProcessing(true);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.setVerifier(forms.newVerifier);
      await tx.wait();
      showToast({
        type: "success",
        title: "Success",
        message: "Verifier updated successfully",
      });
      setForms({ ...forms, newVerifier: "" });
      setWallets({ ...wallets, verifier: forms.newVerifier });
    } catch (error) {
      showToast({ type: "error", ...parseContractError(error) });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateCharity = async () => {
    if (!forms.newCharity) return;
    setProcessing(true);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.setCharityWallet(forms.newCharity);
      await tx.wait();
      showToast({
        type: "success",
        title: "Success",
        message: "Charity wallet updated successfully",
      });
      setForms({ ...forms, newCharity: "" });
      setWallets({ ...wallets, charity: forms.newCharity });
    } catch (error) {
      showToast({ type: "error", ...parseContractError(error) });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateTreasury = async () => {
    if (!forms.newTreasury) return;
    setProcessing(true);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.setTreasuryWallet(forms.newTreasury);
      await tx.wait();
      showToast({
        type: "success",
        title: "Success",
        message: "Treasury wallet updated successfully",
      });
      setForms({ ...forms, newTreasury: "" });
      setWallets({ ...wallets, treasury: forms.newTreasury });
    } catch (error) {
      showToast({ type: "error", ...parseContractError(error) });
    } finally {
      setProcessing(false);
    }
  };

  const handleWhitelistMultiSig = async () => {
    if (!forms.newMultiSig) return;
    setProcessing(true);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.whitelistMultiSig(forms.newMultiSig);
      await tx.wait();
      showToast({
        type: "success",
        title: "Success",
        message: "Multi-sig whitelisted",
      });
      setMultiSigs([...multiSigs, forms.newMultiSig]);
      setForms({ ...forms, newMultiSig: "" });
      setShowMultiSigModal(false);
    } catch (error) {
      showToast({ type: "error", ...parseContractError(error) });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveMultiSig = (address) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Multi-Sig",
      message: `Remove multi-sig ${formatAddress(address)} from whitelist?`,
      variant: "warning",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setProcessing(true);

        try {
          const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          const tx = await contract.removeMultiSigWhitelist(address);
          await tx.wait();
          showToast({
            type: "success",
            title: "Success",
            message: "Multi-sig removed from whitelist",
          });
          setMultiSigs(multiSigs.filter((a) => a !== address));
        } catch (error) {
          showToast({ type: "error", ...parseContractError(error) });
        } finally {
          setProcessing(false);
        }
      },
    });
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
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        {/* Verifier */}
        <Card title="Verifier Address">
          <div className="mb-4">
            <div className="text-muted mb-1">Current Verifier</div>
            <div
              className="font-mono"
              style={{ wordBreak: "break-all", fontSize: "0.875rem" }}
            >
              {wallets.verifier}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="form-input font-mono"
              placeholder="New verifier address"
              value={forms.newVerifier}
              onChange={(e) =>
                setForms({ ...forms, newVerifier: e.target.value })
              }
              style={{ flex: 1 }}
            />
            <Button
              onClick={handleUpdateVerifier}
              disabled={processing || !forms.newVerifier}
            >
              Update
            </Button>
          </div>
        </Card>

        {/* Charity */}
        <Card title="Charity Wallet">
          <div className="mb-4">
            <div className="text-muted mb-1">Current Charity</div>
            <div
              className="font-mono"
              style={{ wordBreak: "break-all", fontSize: "0.875rem" }}
            >
              {wallets.charity}
            </div>
          </div>
          {walletBalances.charity && walletBalances.charity.length > 0 && (
            <div
              className="mb-4"
              style={{
                padding: "0.75rem",
                background: "var(--bg-tertiary)",
                borderRadius: "6px",
              }}
            >
              <div
                className="text-muted mb-2"
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                BALANCES
              </div>
              {walletBalances.charity.map((b) => (
                <div
                  key={b.symbol}
                  className="flex justify-between"
                  style={{ fontSize: "0.8125rem", marginBottom: "0.25rem" }}
                >
                  <span className="text-muted">{b.symbol}</span>
                  <span className="font-mono">
                    {parseFloat(b.balance).toFixed(b.decimals <= 6 ? 2 : 6)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              className="form-input font-mono"
              placeholder="New charity address"
              value={forms.newCharity}
              onChange={(e) =>
                setForms({ ...forms, newCharity: e.target.value })
              }
              style={{ flex: 1 }}
            />
            <Button
              onClick={handleUpdateCharity}
              disabled={processing || !forms.newCharity}
            >
              Update
            </Button>
          </div>
        </Card>

        {/* Treasury */}
        <Card title="Treasury Wallet">
          <div className="mb-4">
            <div className="text-muted mb-1">Current Treasury</div>
            <div
              className="font-mono"
              style={{ wordBreak: "break-all", fontSize: "0.875rem" }}
            >
              {wallets.treasury}
            </div>
          </div>
          {walletBalances.treasury && walletBalances.treasury.length > 0 && (
            <div
              className="mb-4"
              style={{
                padding: "0.75rem",
                background: "var(--bg-tertiary)",
                borderRadius: "6px",
              }}
            >
              <div
                className="text-muted mb-2"
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                BALANCES
              </div>
              {walletBalances.treasury.map((b) => (
                <div
                  key={b.symbol}
                  className="flex justify-between"
                  style={{ fontSize: "0.8125rem", marginBottom: "0.25rem" }}
                >
                  <span className="text-muted">{b.symbol}</span>
                  <span className="font-mono">
                    {parseFloat(b.balance).toFixed(b.decimals <= 6 ? 2 : 6)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              className="form-input font-mono"
              placeholder="New treasury address"
              value={forms.newTreasury}
              onChange={(e) =>
                setForms({ ...forms, newTreasury: e.target.value })
              }
              style={{ flex: 1 }}
            />
            <Button
              onClick={handleUpdateTreasury}
              disabled={processing || !forms.newTreasury}
            >
              Update
            </Button>
          </div>
        </Card>

        {/* Multi-sig Whitelist */}
        <Card
          title="Multi-Sig Whitelist"
          actions={
            <Button
              icon={Plus}
              onClick={() => setShowMultiSigModal(true)}
              disabled={processing}
            >
              Add
            </Button>
          }
        >
          <p className="text-muted mb-3" style={{ fontSize: "0.8125rem" }}>
            Ownership can be transferred to whitelisted multi-sigs for advanced
            security.
          </p>
          {multiSigs.length === 0 ? (
            <div className="empty-state" style={{ padding: "1.5rem" }}>
              <Users size={32} className="empty-state-icon" />
              <div className="empty-state-title">No multi-sigs whitelisted</div>
              <div className="empty-state-message">
                Add multi-sig addresses that can be used as owners
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {multiSigs.map((address) => (
                <div
                  key={address}
                  className="flex items-center justify-between"
                  style={{
                    padding: "0.5rem 0.75rem",
                    background: "var(--bg-tertiary)",
                    borderRadius: "6px",
                  }}
                >
                  <span className="font-mono" style={{ fontSize: "0.8125rem" }}>
                    {formatAddress(address, 8)}
                  </span>
                  <button
                    className="btn btn-ghost"
                    onClick={() => handleRemoveMultiSig(address)}
                    disabled={processing}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Trusted Recipients - Full Width (Read-only - auto-managed via wallet settings) */}
        <Card title="Trusted Recipients" style={{ gridColumn: "1 / -1" }}>
          <p className="text-muted mb-3" style={{ fontSize: "0.8125rem" }}>
            Trusted recipients can receive ETH with unlimited gas (for smart
            wallets like Gnosis Safe). These are automatically set when you
            update the Charity or Treasury wallet addresses.
          </p>
          {trustedRecipients.length === 0 ? (
            <div className="empty-state" style={{ padding: "1.5rem" }}>
              <UserCheck size={32} className="empty-state-icon" />
              <div className="empty-state-title">No trusted recipients</div>
              <div className="empty-state-message">
                Set Charity or Treasury wallets above to add trusted recipients
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {trustedRecipients.map((address) => (
                <div
                  key={address}
                  className="flex items-center gap-2"
                  style={{
                    padding: "0.5rem 0.75rem",
                    background: "var(--bg-tertiary)",
                    borderRadius: "6px",
                  }}
                >
                  <UserCheck size={14} className="text-success" />
                  <span className="font-mono" style={{ fontSize: "0.8125rem" }}>
                    {formatAddress(address, 8)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add Multi-Sig Modal */}
      <Modal
        isOpen={showMultiSigModal}
        onClose={() => setShowMultiSigModal(false)}
        title="Whitelist Multi-Sig"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowMultiSigModal(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWhitelistMultiSig}
              disabled={processing || !forms.newMultiSig}
              loading={processing}
            >
              Whitelist
            </Button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Multi-Sig Address</label>
          <input
            type="text"
            className="form-input font-mono"
            placeholder="0x..."
            value={forms.newMultiSig}
            onChange={(e) =>
              setForms({ ...forms, newMultiSig: e.target.value })
            }
          />
        </div>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        loading={processing}
      />
    </div>
  );
}
