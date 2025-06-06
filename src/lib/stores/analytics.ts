import { writable } from "svelte/store";
import { page } from "$app/state";
import { dev } from "$app/environment";

declare global {
    interface Window {
        umami?: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            track: (event: string | ((props: any) => any), data?: Record<string, any>) => void;
        };
    }
}

export const isAnalyticsReady = writable(false);

export function loadScript() {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://a.chuggs.net/x";
    script.setAttribute("data-website-id", "99e60e55-f598-439d-bffd-c858cd1c7309");
    script.setAttribute("data-auto-track", "false");
    document.body.appendChild(script);
}

export function checkIfReady() {
    const interval = setInterval(() => {
        if (window.umami) {
            isAnalyticsReady.set(true);
            clearInterval(interval);
        }
    }, 100);

    return () => clearInterval(interval);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trackEvent(eventName: string, eventData: Record<string, any> = {}) {
    if (dev || !window.umami) {
        return;
    }

    window.umami.track(eventName, eventData);
}

export function trackPageView() {
    if (dev || !window.umami) {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.umami.track((props: any) => ({
        ...props,
        url: page.url.pathname,
    }));
}
