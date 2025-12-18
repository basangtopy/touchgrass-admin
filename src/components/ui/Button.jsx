/**
 * Reusable Button component with variants
 */
export default function Button({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon: Icon,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    ghost: "btn-ghost",
    success: "btn-success",
  };

  const sizes = {
    small: "btn-sm",
    medium: "",
    large: "btn-lg",
  };

  return (
    <button
      type={type}
      className={`btn ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="loading-spinner" style={{ width: 16, height: 16 }} />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
}
