import React from "react";

type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export default function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className = "",
  ...rest
}: AvatarProps) {
  const initials =
    fallback ||
    alt
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("");

  const classes = `inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white ${sizeClasses[size]} ${className}`.trim();

  if (src) {
    return <img src={src} alt={alt} className={classes} {...rest} />;
  }

  return (
    <span className={classes} {...rest}>
      {initials || "U"}
    </span>
  );
}
