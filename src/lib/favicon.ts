import { browser } from "$app/environment";

/**
 * Updates the favicon with the current theme's primary color
 */
export function updateFavicon() {
    if (!browser) return;

    // Get actual color values from CSS variables
    const computedStyle = getComputedStyle(document.documentElement);
    const colorBase100 = computedStyle.getPropertyValue("--color-base-100").trim();
    const colorBaseContent = computedStyle.getPropertyValue("--color-base-content").trim();

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
            <rect width="24" height="24" fill="${colorBase100}" rx="6" ry="6" />
            <g transform="translate(1.2, 1.2) scale(0.9)">
                <path
                    fill="${colorBaseContent}"
                    d="M9 3V1h6v2zm2 11h2V8h-2zm1 8q-1.85 0-3.488-.712T5.65 19.35t-1.937-2.863T3 13t.713-3.488T5.65 6.65t2.863-1.937T12 4q1.55 0 2.975.5t2.675 1.45l1.4-1.4l1.4 1.4l-1.4 1.4Q20 8.6 20.5 10.025T21 13q0 1.85-.713 3.488T18.35 19.35t-2.863 1.938T12 22"
                />
            </g>
        </svg>
    `;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    // Update favicon
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
    }
    favicon.href = url;
}
