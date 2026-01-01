import { useState, useEffect } from "react";
import { Contract, formatUnits, parseEther } from "ethers";
import { useEthersSigner } from "../utils/ethersAdapter";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../data/contractConfig";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useToast } from "../contexts/ToastContext";
import { parseContractError } from "../utils/errorParser";
import {
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  DollarSign,
  AlertCircle,
  Zap,
  ZapOff,
} from "lucide-react";

export default function TokenManagement() {
  const signer = useEthersSigner();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Add token form state
  const [newToken, setNewToken] = useState({
    symbol: "",
    address: "",
    priceFeed: "",
    decimals: "18",
    staleness: "3600",
  });

  // Edit price feed form state
  const [newPriceFeed, setNewPriceFeed] = useState("");

  // Fallback price form state
  const [fallbackPrice, setFallbackPrice] = useState("");

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "warning",
    onConfirm: () => {},
  });

  const fetchTokens = async () => {
    if (!signer) return;

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const symbols = await contract.getAllSupportedTokens();

      const tokenData = await Promise.all(
        symbols.map(async (symbol, index) => {
          try {
            const pricing = await contract.getAllTokenPricing(0, 100);
            const pricingIndex = pricing.tokens.findIndex((t) => t === symbol);

            // Get token config using the actual bytes32 tokenId from contract
            // The supportedTokenIds array stores the actual token IDs
            const tokenId = await contract.supportedTokenIds(index);
            let config = null;

            // Known token decimals fallback
            const knownDecimals = {
              ETH: 18,
              WETH: 18,
              USDC: 6,
              USDT: 6,
              DAI: 18,
            };
            let decimals = knownDecimals[symbol] || 18;

            try {
              config = await contract.tokenConfigs(tokenId);
              // Convert BigInt decimals to Number if available
              const configDecimals = Number(config?.decimals);
              if (configDecimals > 0) {
                decimals = configDecimals;
              } else {
                console.warn(
                  `${symbol}: Using fallback decimals (${decimals}) - config.decimals was ${configDecimals}`
                );
              }
            } catch (e) {
              console.warn(
                `${symbol}: Using fallback decimals (${decimals}) - config fetch failed:`,
                e.message
              );
            }

            // Get raw values
            const priceRaw =
              pricingIndex >= 0 ? pricing.prices[pricingIndex] : 0n;
            const feeRaw = pricingIndex >= 0 ? pricing.fees[pricingIndex] : 0n;
            const minStakeRaw =
              pricingIndex >= 0 ? pricing.minStakes[pricingIndex] : 0n;

            // Format: price is always 18 decimals (USD * 1e18)
            // Fee and minStake are in token native decimals
            const price = formatUnits(priceRaw, 18);
            const fee = formatUnits(feeRaw, decimals);
            const minStake = formatUnits(minStakeRaw, decimals);

            return {
              symbol,
              price,
              fee,
              minStake,
              decimals,
              hasFallback: config?.useFallbackPrice || false,
              fallbackPrice: config?.fallbackPrice
                ? formatUnits(config.fallbackPrice, 18)
                : "0",
              priceFeed: config?.priceFeed || "",
            };
          } catch (error) {
            console.error(`Error fetching token ${symbol}:`, error);
            return {
              symbol,
              price: "0",
              fee: "0",
              minStake: "0",
              decimals: 18,
              hasFallback: false,
              fallbackPrice: "0",
              priceFeed: "",
            };
          }
        })
      );

      setTokens(tokenData);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      showToast({ type: "error", ...parseContractError(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [signer]);

  const handleAddToken = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.addToken(
        newToken.symbol,
        newToken.address || "0x0000000000000000000000000000000000000000",
        newToken.priceFeed,
        parseInt(newToken.decimals),
        parseInt(newToken.staleness)
      );

      showToast({
        type: "info",
        title: "Processing",
        message: `Adding ${newToken.symbol}... waiting for confirmation`,
      });
      await tx.wait();

      showToast({
        type: "success",
        title: "Success",
        message: `Successfully added ${newToken.symbol}!`,
      });
      setShowAddModal(false);
      setNewToken({
        symbol: "",
        address: "",
        priceFeed: "",
        decimals: "18",
        staleness: "3600",
      });
      fetchTokens();
    } catch (error) {
      console.error("Add token error:", error);
      showToast({ type: "error", ...parseContractError(error) });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveToken = (symbol) => {
    setConfirmModal({
      isOpen: true,
      title: `Remove ${symbol}`,
      message: `Are you sure you want to remove ${symbol}? This cannot be undone if there are no locked funds.`,
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setProcessing(true);

        try {
          const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          const tx = await contract.removeToken(symbol);
          await tx.wait();
          showToast({
            type: "success",
            title: "Success",
            message: `Successfully removed ${symbol}`,
          });
          fetchTokens();
        } catch (error) {
          console.error("Remove token error:", error);
          showToast({ type: "error", ...parseContractError(error) });
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleUpdatePriceFeed = async (e) => {
    e.preventDefault();
    if (!selectedToken || !newPriceFeed) return;

    setProcessing(true);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.updatePriceFeed(
        selectedToken.symbol,
        newPriceFeed
      );
      await tx.wait();
      showToast({
        type: "success",
        title: "Success",
        message: `Price feed updated for ${selectedToken.symbol}`,
      });
      setShowEditModal(false);
      setNewPriceFeed("");
      setSelectedToken(null);
      fetchTokens();
    } catch (error) {
      console.error("Update price feed error:", error);
      showToast({ type: "error", ...parseContractError(error) });
    } finally {
      setProcessing(false);
    }
  };

  const handleEnableFallback = async (e) => {
    e.preventDefault();
    if (!selectedToken || !fallbackPrice) return;

    setProcessing(true);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const priceWei = parseEther(fallbackPrice);
      const tx = await contract.enableFallbackPrice(
        selectedToken.symbol,
        priceWei
      );
      await tx.wait();
      showToast({
        type: "success",
        title: "Success",
        message: `Fallback price enabled for ${selectedToken.symbol}`,
      });
      setShowFallbackModal(false);
      setFallbackPrice("");
      setSelectedToken(null);
      fetchTokens();
    } catch (error) {
      console.error("Enable fallback error:", error);
      showToast({ type: "error", ...parseContractError(error) });
    } finally {
      setProcessing(false);
    }
  };

  const handleDisableFallback = (symbol) => {
    setConfirmModal({
      isOpen: true,
      title: `Disable Fallback Price`,
      message: `Disable fallback price for ${symbol}? The oracle price will be used instead.`,
      variant: "warning",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setProcessing(true);

        try {
          const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          const tx = await contract.disableFallbackPrice(symbol);
          await tx.wait();
          showToast({
            type: "success",
            title: "Success",
            message: `Fallback price disabled for ${symbol}`,
          });
          fetchTokens();
        } catch (error) {
          console.error("Disable fallback error:", error);
          showToast({ type: "error", ...parseContractError(error) });
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const openEditModal = (token) => {
    setSelectedToken(token);
    setNewPriceFeed(token.priceFeed || "");
    setShowEditModal(true);
  };

  const openFallbackModal = (token) => {
    setSelectedToken(token);
    setFallbackPrice(token.fallbackPrice !== "0" ? token.fallbackPrice : "");
    setShowFallbackModal(true);
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
      <Card
        title="Supported Tokens"
        actions={
          <Button
            icon={Plus}
            onClick={() => setShowAddModal(true)}
            disabled={processing}
          >
            Add Token
          </Button>
        }
      >
        {tokens.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} className="empty-state-icon" />
            <div className="empty-state-title">No tokens configured</div>
            <div className="empty-state-message">
              Add your first supported token to enable challenge creation.
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Current Price</th>
                  <th>Fee</th>
                  <th>Min Stake</th>
                  <th>Price Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr key={token.symbol}>
                    <td>
                      <span className="font-bold">{token.symbol}</span>
                    </td>
                    <td className="font-mono">
                      $
                      {parseFloat(token.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="font-mono">
                      {parseFloat(token.fee).toFixed(
                        token.decimals <= 6 ? 2 : 6
                      )}{" "}
                      {token.symbol}
                    </td>
                    <td className="font-mono">
                      {parseFloat(token.minStake).toFixed(
                        token.decimals <= 6 ? 2 : 6
                      )}{" "}
                      {token.symbol}
                    </td>
                    <td>
                      {token.hasFallback ? (
                        <span className="status-badge warning">
                          <span className="status-badge-dot" />
                          Fallback (${token.fallbackPrice})
                        </span>
                      ) : (
                        <span className="status-badge success">
                          <span className="status-badge-dot" />
                          Oracle
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost"
                          onClick={() => openEditModal(token)}
                          disabled={processing}
                          title="Update price feed"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() =>
                            token.hasFallback
                              ? handleDisableFallback(token.symbol)
                              : openFallbackModal(token)
                          }
                          disabled={processing}
                          title={
                            token.hasFallback
                              ? "Disable fallback"
                              : "Enable fallback price"
                          }
                        >
                          {token.hasFallback ? (
                            <ZapOff size={16} />
                          ) : (
                            <Zap size={16} />
                          )}
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => handleRemoveToken(token.symbol)}
                          disabled={processing}
                          title="Remove token"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Token Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Token"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToken}
              disabled={processing}
              loading={processing}
            >
              Add Token
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddToken}>
          <div className="form-group">
            <label className="form-label">Symbol *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., ETH, USDC, DAI"
              value={newToken.symbol}
              onChange={(e) =>
                setNewToken({
                  ...newToken,
                  symbol: e.target.value.toUpperCase(),
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Token Address</label>
            <input
              type="text"
              className="form-input font-mono"
              placeholder="0x... (leave empty for native ETH)"
              value={newToken.address}
              onChange={(e) =>
                setNewToken({ ...newToken, address: e.target.value })
              }
            />
            <small className="text-muted">Leave empty for native ETH</small>
          </div>

          <div className="form-group">
            <label className="form-label">Chainlink Price Feed *</label>
            <input
              type="text"
              className="form-input font-mono"
              placeholder="0x..."
              value={newToken.priceFeed}
              onChange={(e) =>
                setNewToken({ ...newToken, priceFeed: e.target.value })
              }
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div className="form-group">
              <label className="form-label">Decimals *</label>
              <input
                type="number"
                className="form-input"
                value={newToken.decimals}
                onChange={(e) =>
                  setNewToken({ ...newToken, decimals: e.target.value })
                }
                min="0"
                max="18"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Staleness (seconds) *</label>
              <input
                type="number"
                className="form-input"
                value={newToken.staleness}
                onChange={(e) =>
                  setNewToken({ ...newToken, staleness: e.target.value })
                }
                min="300"
                required
              />
              <small className="text-muted">3600 = 1 hour</small>
            </div>
          </div>
        </form>
      </Modal>

      {/* Update Price Feed Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedToken(null);
        }}
        title={`Update Price Feed - ${selectedToken?.symbol}`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePriceFeed}
              disabled={processing || !newPriceFeed}
              loading={processing}
            >
              Update
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdatePriceFeed}>
          <div className="form-group">
            <label className="form-label">Current Price Feed</label>
            <div
              className="font-mono text-muted"
              style={{ fontSize: "0.8125rem", wordBreak: "break-all" }}
            >
              {selectedToken?.priceFeed || "Not set"}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">New Price Feed Address *</label>
            <input
              type="text"
              className="form-input font-mono"
              placeholder="0x..."
              value={newPriceFeed}
              onChange={(e) => setNewPriceFeed(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Enable Fallback Price Modal */}
      <Modal
        isOpen={showFallbackModal}
        onClose={() => {
          setShowFallbackModal(false);
          setSelectedToken(null);
        }}
        title={`Set Fallback Price - ${selectedToken?.symbol}`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowFallbackModal(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnableFallback}
              disabled={processing || !fallbackPrice}
              loading={processing}
            >
              Enable Fallback
            </Button>
          </>
        }
      >
        <div className="alert warning mb-4">
          <AlertCircle size={18} />
          <div>
            <div className="alert-title">Warning</div>
            <div className="alert-message">
              Fallback prices don't auto-update. Monitor market conditions and
              update as needed.
            </div>
          </div>
        </div>
        <form onSubmit={handleEnableFallback}>
          <div className="form-group">
            <label className="form-label">Fallback Price (USD) *</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g., 2000 for $2000"
              value={fallbackPrice}
              onChange={(e) => setFallbackPrice(e.target.value)}
              step="0.01"
              min="0"
              required
            />
            <small className="text-muted">
              Enter the USD price for this token
            </small>
          </div>
        </form>
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
