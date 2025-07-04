import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  btntype?: "btn" | "nav";
  onClick?: () => void;
  className?: string;
  label?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  variant?: "login" | "signup"; // new variant for auth buttons
  padding?: string;
}

export default function Button({
  type = "button",
  btntype = "btn",
  onClick,
  className = "",
  padding = "px-6 py-4",
  label,
  icon,
  fullWidth = false,
  loading = false,
  disabled = false,
  variant,
}: ButtonProps) {
  const baseStyles = clsx(
    "flex items-center justify-center gap-2 rounded-full text-sm font-medium tracking-[-0.28px] transition-colors duration-200 leading-[100%]",
    fullWidth && "w-full",
    padding,
    disabled && "opacity-50 cursor-not-allowed",
    !disabled && "cursor-pointer"
  );

  const variantStyles = clsx({
    "bg-[var(--burger-btn-bg)] text-white hover:bg-[var(--burger-btn-bg-hover)]":
      variant === "login",
    "bg-[var(--color-blue)] text-white hover:bg-[#1f4dfc]":
      variant === "signup",
  });

  const defaultBtnStyles =
    btntype !== "nav" && !variant
      ? "font-medium text-sm leading-[100%] rounded-full text-white bg-[var(--color-blue)] hover:bg-[#1f4dfc]"
      : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(baseStyles, variantStyles || defaultBtnStyles, className)}
    >
      {label}
      {loading ? (
        <Loader2 className="animate-spin w-4 h-4" />
      ) : (
        icon && <span className="">{icon}</span>
      )}
    </button>
  );
}
