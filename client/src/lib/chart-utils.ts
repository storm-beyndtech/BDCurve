export type SeriesPoint = { value: number; time?: number | string };

/** Normalise unix seconds to milliseconds. */
export const toMs = (time: number) => (time > 0 && time < 1e12 ? time * 1000 : time);

/** Price formatting with precision that scales for sub-dollar assets (e.g. PEPE, SHIB). */
export const formatPrice = (value: number) => {
	if (!Number.isFinite(value)) return "--";
	const abs = Math.abs(value);
	const digits = abs >= 1000 ? 2 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : abs >= 0.0001 ? 6 : 8;
	return value.toLocaleString("en-US", { minimumFractionDigits: Math.min(2, digits), maximumFractionDigits: digits });
};

/**
 * Append only live ticks newer than the last historical point (no compounding / duplication),
 * capped so a long-lived socket can never push the history off the chart.
 */
export const mergeLiveSeries = (base: SeriesPoint[], live: SeriesPoint[], maxLive = 30): SeriesPoint[] => {
	if (!live?.length) return base;
	const last = base.at(-1)?.time;
	const lastMs = typeof last === "number" ? toMs(last) : 0;
	const tail = live
		.filter((p) => Number.isFinite(p.value) && p.value > 0)
		.map((p) => ({ value: p.value, time: typeof p.time === "number" ? toMs(p.time) : Date.now() }))
		.filter((p) => !lastMs || (p.time as number) > lastMs)
		.slice(-maxLive);
	return tail.length ? [...base, ...tail] : base;
};
