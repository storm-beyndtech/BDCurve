import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getLogoCandidates, getPlaceholderInitials } from "@/lib/logos";

type AssetType = "stock" | "crypto";

const resolvedLogoCache: Map<string, string> = new Map();

interface AssetLogoProps {
	symbol: string;
	name?: string;
	type?: AssetType;
	size?: number;
	className?: string;
	containerClassName?: string;
}

/**
 * Shared logo renderer with fallback chain and per-symbol caching.
 * Tries primary provider, then secondary, finally falls back to initials.
 */
export function AssetLogo({
	symbol,
	name,
	type = "stock",
	size = 40,
	className,
	containerClassName,
}: AssetLogoProps) {
	const cacheKey = `${type}-${symbol.toUpperCase()}`;
	const [srcIndex, setSrcIndex] = useState(0);
	const [useInitials, setUseInitials] = useState(false);

	const candidates = useMemo(
		() => getLogoCandidates(symbol, name, type),
		[symbol, name, type]
	);

	const currentSrc = useMemo(() => resolvedLogoCache.get(cacheKey) || candidates[srcIndex], [
		cacheKey,
		candidates,
		srcIndex,
	]);

	useEffect(() => {
		// Reset when symbol/type changes
		if (candidates.length === 0) {
			setUseInitials(true);
			return;
		}
		setSrcIndex(0);
		setUseInitials(false);
	}, [cacheKey, candidates.length]);

	const handleError = () => {
		const nextIndex = srcIndex + 1;
		if (nextIndex < candidates.length) {
			setSrcIndex(nextIndex);
			return;
		}
		setUseInitials(true);
	};

	const handleLoad = () => {
		if (currentSrc) {
			resolvedLogoCache.set(cacheKey, currentSrc);
		}
	};

	const initials = getPlaceholderInitials(symbol, name);

	return (
		<div
			className={cn(
				"flex items-center justify-center overflow-hidden border border-border/60 bg-background shadow-sm",
				type === "crypto" ? "rounded-full" : "rounded-lg",
				containerClassName
			)}
			style={{ width: size, height: size }}
		>
			{useInitials ? (
				<div
					className={cn(
						"flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-tight text-muted-foreground",
						type === "crypto" ? "rounded-full bg-muted/60" : "rounded-lg bg-muted/60"
					)}
				>
					{initials}
				</div>
			) : (
				<img
					src={currentSrc}
					alt={`${symbol} logo`}
					onError={handleError}
					onLoad={handleLoad}
					className={cn(
						"h-full w-full object-contain transition-transform duration-200",
						type === "crypto" ? "rounded-full" : "rounded-md",
						className
					)}
				/>
			)}
		</div>
	);
}
