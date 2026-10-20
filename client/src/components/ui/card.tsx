import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-lg transition-all duration-300", {
	variants: {
		variant: {
			// Default card (solid with depth shadow)
			default: "bg-card text-card-foreground border border-border shadow-depth",

			// Elevated card (Apple-style elevation)
			elevated: "bg-card text-card-foreground border border-border shadow-elevated hover:shadow-elevated-lg",

			// Glass card (liquid glass, translucent) - bg-glass-card already includes backdrop-blur with webkit prefix
			glass: "bg-glass-card border-glass shadow-glass text-foreground",

			// Ambient card (with gradient background)
			ambient: "bg-card text-card-foreground border border-border shadow-depth relative overflow-hidden",
		},
		padding: {
			none: "",
			sm: "p-4",
			md: "p-4 sm:p-6",
			default: "p-4 sm:p-6",
			lg: "p-4 sm:p-6 lg:p-8",
			xl: "p-5 sm:p-8 lg:p-10",
		},
		hover: {
			none: "",
			lift: "hover:-translate-y-1 hover:shadow-elevated",
			glow: "hover:shadow-glow-purple",
		},
	},
	defaultVariants: {
		variant: "default",
		padding: "default",
		hover: "none",
	},
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, variant, padding, hover, ...props }, ref) => (
		<div ref={ref} className={cn(cardVariants({ variant, padding, hover, className }))} {...props}/>
	),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("flex flex-col space-y-1.5", className)} {...props}/>
	),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h3 ref={ref} className={cn("text-xl font-semibold leading-none tracking-tight", className)} {...props}/>
	),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({ className, ...props }, ref) => (
		<p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props}/>
	),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => <div ref={ref} className={cn("pt-0", className)} {...props}/>,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("flex items-center pt-0", className)} {...props}/>
	),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };


