import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const cardVariants = {
  default: "bg-white border border-neutral-200",
  elevated: "bg-white shadow-lg border border-neutral-100",
  outlined: "bg-white border-2 border-neutral-300",
};

const cardPadding = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = "default", padding = "md", children, ...props },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "rounded-lg transition-all duration-200",
          cardVariants[variant],
          cardPadding[padding],
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn("flex flex-col space-y-1.5 pb-4", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardHeader.displayName = "CardHeader";

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        className={cn(
          "text-h4 font-semibold leading-none tracking-tight text-neutral-900",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </h3>
    );
  },
);

CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, children, ...props }, ref) => {
  return (
    <p
      className={cn("text-body text-neutral-700", className)}
      ref={ref}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = "CardDescription";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn("pt-0", className)} ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn("flex items-center pt-4", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardFooter.displayName = "CardFooter";
