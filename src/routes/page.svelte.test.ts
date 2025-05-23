import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import TimerPage from "./+page.svelte";

describe("Timer Component", () => {
    beforeEach(() => {
        // Mock ResizeObserver
        Object.defineProperty(window, "ResizeObserver", {
            value: vi.fn().mockImplementation(() => ({
                observe: vi.fn(),
                unobserve: vi.fn(),
                disconnect: vi.fn(),
            })),
            writable: true,
        });

        // Mock Date.now to control time
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2023, 0, 1, 0, 0, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        Object.defineProperty(window, "ResizeObserver", {
            value: undefined,
            writable: true,
        });
    });

    it("should initialize with zeroed timer display", () => {
        render(TimerPage);
        expect(screen.getByText("0.00")).toBeInTheDocument();
    });
});
