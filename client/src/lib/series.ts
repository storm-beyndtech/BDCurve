/**
 * Build a lightweight random-walk series when historical data is missing.
 * Keeps values within a band derived from current price/change.
 */
export const buildFallbackSeries = (
	currentPrice: number,
	changePercent: number,
	points: number = 30,
	options?: {
		seed?: string;
		minBand?: number;
		spikeChance?: number;
		spikeIntensity?: number;
	}
): { value: number }[] => {
	const createSeededRandom = (seed: string) => {
		let h = 1779033703 ^ seed.length;
		for (let i = 0; i < seed.length; i++) {
			h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
			h = (h << 13) | (h >>> 19);
		}
		return () => {
			h = Math.imul(h ^ (h >>> 16), 2246822507);
			h = Math.imul(h ^ (h >>> 13), 3266489909);
			const t = (h ^= h >>> 16) >>> 0;
			return t / 0xffffffff;
		};
	};

	const rand = options?.seed ? createSeededRandom(options.seed) : Math.random;

	// If no price, seed a reasonable base so we can still draw a curve
	if (!currentPrice || Number.isNaN(currentPrice) || currentPrice <= 0) {
		currentPrice = 50 + Math.random() * 100; // seed between 50–150
	}

	const minBand = options?.minBand ?? 0.2;
	const spikeChance = options?.spikeChance ?? 0.1;
	const spikeIntensity = options?.spikeIntensity ?? 3.5;

	// Ensure at least the configured visual band so lines can reach near the bottom/top of the gradient
	const band = Math.max(Math.abs(changePercent) / 100, minBand);
	const base = currentPrice / (1 + (changePercent || 0) / 100 || 1);
	const maxStep = Math.max(currentPrice * band * 0.6, base * 0.02); // allow big wiggles
	const lowerClamp = Math.min(base, currentPrice) * (1 - band * 1.4);
	const upperClamp = Math.max(base, currentPrice) * (1 + band * 1.1);

	// Start slightly below the base so the line can dip into the gradient
	let value = base * (1 - band * 0.4 + (rand() - 0.5) * band * 0.2);
	const series: { value: number }[] = [];
	for (let i = 0; i < points; i++) {
		// Move from base toward current price with a strong slope and jitter
		const target = base + (currentPrice - base) * (i / Math.max(points - 1, 1));
		// Add occasional larger spikes to mimic bursty moves
		const spike = rand() < spikeChance ? (rand() - 0.2) * spikeIntensity * maxStep : 0;
		const drift = (rand() - 0.5) * 2.4 * maxStep + spike;
		value = value + (target - value) * 0.22 + drift;
		if (value < lowerClamp) value = lowerClamp;
		if (value > upperClamp) value = upperClamp;
		series.push({ value });
	}

	return series;
};
