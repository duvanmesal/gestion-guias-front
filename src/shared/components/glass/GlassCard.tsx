import type { ReactNode } from "react";

export type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export function GlassCard({
  children,
  className = "",
  hover = false,
  onClick,
  ...rest
}: GlassCardProps) {
  const hoverClass = hover ? "glass-hover cursor-pointer" : "";
  const clickableClass = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`glass p-6 ${hoverClass} ${clickableClass} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
}

export type GlassCardHeaderProps = React.HTMLAttributes<HTMLDivElement>

export function GlassCardHeader({
  children,
  className = "",
  ...rest
}: GlassCardHeaderProps) {
  return <div className={`mb-4 ${className}`}  {...rest}>{children}</div>;
}

export type GlassCardTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export function GlassCardTitle({
  children,
  className = "",
  ...rest 
}: GlassCardTitleProps) {
  return (
    <h3
      className={`text-lg font-semibold text-[rgb(var(--color-fg))] ${className}`} {...rest}
    >
      {children}
    </h3>
  );
}

export type GlassCardContentProps = React.HTMLAttributes<HTMLDivElement>

export function GlassCardContent({
  children,
  className = "",
  ...rest
}: GlassCardContentProps) {
  return (
    <div className={`text-[rgb(var(--color-fg)/0.8)] ${className}`} {...rest}>
      {children}
    </div>
  );
}
