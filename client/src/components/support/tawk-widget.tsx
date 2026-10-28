import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Tawk.to live chat.
 * - Loaded lazily after the page is idle (keeps first paint / iPhone memory light).
 * - Never loaded on /admin; if it was already loaded, it is hidden there and shown again on leaving.
 * - Hidden on small screens while an input is focused so it never covers form fields.
 * Colour, greeting/bubble text and "Powered by" branding live in the Tawk dashboard.
 */
const TAWK_SRC = "https://embed.tawk.to/6ae21873b0d2d8346dfc08b7/1k61iv12s";
const SCRIPT_ID = "tawk-embed-script";
const OFF_ATTR = "data-tawk-off";

type TawkApi = {
	onLoad?: () => void;
	customStyle?: unknown;
	hideWidget?: () => void;
	showWidget?: () => void;
	minimize?: () => void;
	setAttributes?: (attrs: Record<string, string>, cb?: (err?: unknown) => void) => void;
	visitor?: { name?: string; email?: string };
};

declare global {
	interface Window {
		Tawk_API?: TawkApi;
		Tawk_LoadStart?: Date;
	}
}

const isAdminPath = (p: string) => p === "/admin" || p.startsWith("/admin/");

function ensureStyles() {
	if (document.getElementById("tawk-overrides")) return;
	const style = document.createElement("style");
	style.id = "tawk-overrides";
	// Outer containers only (iframe contents can't be styled from here).
	style.textContent = `
body[${OFF_ATTR}] .widget-visible,
body[${OFF_ATTR}] iframe[title*="chat" i],
body[${OFF_ATTR}] div[id^="tawk"] { display: none !important; visibility: hidden !important; }
`;
	document.head.appendChild(style);
}

function onIdle(cb: () => void) {
	const run = () => {
		const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
		if (w.requestIdleCallback) w.requestIdleCallback(cb, { timeout: 5000 });
		else setTimeout(cb, 2500);
	};
	if (document.readyState === "complete") setTimeout(run, 2500);
	else window.addEventListener("load", () => setTimeout(run, 2500), { once: true });
}

export function TawkWidget() {
	const { pathname } = useLocation();
	const { user } = useAuth();
	const loaded = useRef(false);
	const admin = isAdminPath(pathname);

	// Load once, on first non-admin route, after idle.
	useEffect(() => {
		if (admin || loaded.current || document.getElementById(SCRIPT_ID)) return;
		loaded.current = true;
		let cancelled = false;
		onIdle(() => {
			if (cancelled || isAdminPath(window.location.pathname)) {
				loaded.current = false;
				return;
			}
			ensureStyles();
			const api: TawkApi = (window.Tawk_API = window.Tawk_API || {});
			window.Tawk_LoadStart = new Date();
			api.customStyle = {
				visibility: {
					desktop: { position: "br", xOffset: 20, yOffset: 20 },
					mobile: { position: "br", xOffset: 12, yOffset: 80 },
					bubble: { rotate: "0deg", xOffset: -1000, yOffset: -1000 },
				},
			};
			api.onLoad = () => {
				if (isAdminPath(window.location.pathname)) api.hideWidget?.();
				api.minimize?.();
			};
			const s = document.createElement("script");
			s.id = SCRIPT_ID;
			s.async = true;
			s.src = TAWK_SRC;
			s.charset = "UTF-8";
			s.setAttribute("crossorigin", "*");
			document.body.appendChild(s);
		});
		return () => {
			cancelled = true;
		};
	}, [admin]);

	// Hide on admin routes, show elsewhere (SPA navigation).
	useEffect(() => {
		ensureStyles();
		if (admin) {
			document.body.setAttribute(OFF_ATTR, "");
			window.Tawk_API?.hideWidget?.();
		} else {
			document.body.removeAttribute(OFF_ATTR);
			window.Tawk_API?.showWidget?.();
		}
	}, [admin]);

	// Identify logged-in users to support agents.
	useEffect(() => {
		if (!user?.email) return;
		const name =
			user.name?.full || [user.firstName ?? user.name?.first, user.lastName ?? user.name?.last].filter(Boolean).join(" ") || user.email;
		const apply = () => window.Tawk_API?.setAttributes?.({ name, email: user.email }, () => undefined);
		const api = window.Tawk_API;
		if (api?.setAttributes) apply();
		else if (api) {
			api.visitor = { name, email: user.email };
			const prev = api.onLoad;
			api.onLoad = () => {
				prev?.();
				apply();
			};
		}
	}, [user?.email, loaded.current]);

	// On phones, get out of the way while typing.
	useEffect(() => {
		const mobile = () => window.matchMedia("(max-width: 767px)").matches;
		const isField = (t: EventTarget | null) =>
			t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
		const onIn = (e: FocusEvent) => {
			if (mobile() && isField(e.target)) window.Tawk_API?.hideWidget?.();
		};
		const onOut = (e: FocusEvent) => {
			if (mobile() && isField(e.target) && !isAdminPath(window.location.pathname)) window.Tawk_API?.showWidget?.();
		};
		document.addEventListener("focusin", onIn);
		document.addEventListener("focusout", onOut);
		return () => {
			document.removeEventListener("focusin", onIn);
			document.removeEventListener("focusout", onOut);
		};
	}, []);

	return null;
}
