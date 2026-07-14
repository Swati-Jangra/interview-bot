import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ 
  className, 
  variant = "default", 
  size = "default",
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "default" | "primary" | "secondary" | "ghost" | "danger" | "outline" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        {
          "h-10 px-4 py-2 text-sm": size === "default",
          "h-9 px-3 text-xs": size === "sm",
          "h-11 px-8 text-base": size === "lg",
          "h-10 w-10 p-0": size === "icon",
        },
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
          "gradient-bg text-white hover:opacity-90 shadow-lg": variant === "primary",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "danger",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
          "text-primary underline-offset-4 hover:underline": variant === "link",
        },
        className
      )}
      {...props}
    />
  );
}
