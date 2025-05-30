import { describe, it, expect } from "vitest";
import { formatTime, formatTimeStampRelativeToNow } from "$lib/utils";

describe("formatTime", () => {
    it("formats seconds without minutes", () => {
        expect(formatTime(5000)).toBe("5.00");
        expect(formatTime(30500)).toBe("30.50");
        expect(formatTime(59999)).toBe("59.99");
    });

    it("formats minutes with seconds", () => {
        expect(formatTime(60000)).toBe("1:00.00");
        expect(formatTime(90500)).toBe("1:30.50");
        expect(formatTime(125750)).toBe("2:05.75");
    });

    it("handles edge cases", () => {
        expect(formatTime(0)).toBe("0.00");
        expect(formatTime(100)).toBe("0.10");
        expect(formatTime(999)).toBe("0.99");
    });

    it("handles large values", () => {
        expect(formatTime(600000)).toBe("10:00.00");
        expect(formatTime(3661234)).toBe("61:01.23");
    });
});

describe("formatTimeStampRelativeToNow", () => {
    const NOW = 1748579512760; // Reference timestamp (2:32pm)

    it('returns "just now" for timestamps less than a minute ago', () => {
        const result = formatTimeStampRelativeToNow(NOW - 30 * 1000, NOW);
        expect(result).toBe("just now");
    });

    it('returns "X mins ago" for timestamps less than an hour ago', () => {
        expect(formatTimeStampRelativeToNow(NOW - 5 * 60 * 1000, NOW)).toBe("5 mins ago");
        expect(formatTimeStampRelativeToNow(NOW - 1 * 60 * 1000, NOW)).toBe("1 min ago");
    });

    it('returns "X hours ago" for timestamps from earlier today', () => {
        expect(formatTimeStampRelativeToNow(NOW - 2 * 60 * 60 * 1000, NOW)).toBe("2 hours ago");
        expect(formatTimeStampRelativeToNow(NOW - 1 * 60 * 60 * 1000, NOW)).toBe("1 hour ago");
    });

    it('returns "yesterday" with time for timestamps from yesterday', () => {
        const result = formatTimeStampRelativeToNow(NOW - 24 * 60 * 60 * 1000, NOW);
        expect(result).toContain("yesterday");
    });

    it("returns day of week with time for timestamps within the last week", () => {
        const threeDaysAgo = formatTimeStampRelativeToNow(NOW - 3 * 24 * 60 * 60 * 1000, NOW);

        // Verify format matches day + time (without specifying exact day)
        expect(threeDaysAgo).toMatch(
            /^\d{1,2}:\d{2}(am|pm) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/
        );
    });

    it("returns full date with time for timestamps older than a week", () => {
        const result = formatTimeStampRelativeToNow(NOW - 10 * 24 * 60 * 60 * 1000, NOW);

        // More flexible regex that handles different date separators and formats
        expect(result).toMatch(/^\d{1,2}:\d{2}(am|pm) \d{1,2}[/.-]\d{1,2}[/.-]\d{4}$/);
    });

    it("handles exact boundary conditions", () => {
        // Exactly 60 seconds should be "1 min ago"
        expect(formatTimeStampRelativeToNow(NOW - 60 * 1000, NOW)).toBe("1 min ago");

        // Exactly 60 minutes should be "1 hour ago"
        expect(formatTimeStampRelativeToNow(NOW - 60 * 60 * 1000, NOW)).toBe("1 hour ago");

        // Exactly 24 hours should be yesterday format
        const exactly24HoursAgo = formatTimeStampRelativeToNow(NOW - 24 * 60 * 60 * 1000, NOW);
        expect(exactly24HoursAgo).toContain("yesterday");

        // Exactly 7 days should be full date format
        const exactly7DaysAgo = formatTimeStampRelativeToNow(NOW - 7 * 24 * 60 * 60 * 1000, NOW);
        expect(exactly7DaysAgo).toMatch(/^\d{1,2}:\d{2}(am|pm) \d{1,2}[/.-]\d{1,2}[/.-]\d{4}$/);
    });

    it("handles midnight and noon times correctly", () => {
        // Create timestamps for midnight and noon yesterday
        const nowDate = new Date(NOW);
        const midnight = new Date(
            nowDate.getFullYear(),
            nowDate.getMonth(),
            nowDate.getDate() - 1,
            0,
            0,
            0,
            0
        ).getTime();
        const noon = new Date(
            nowDate.getFullYear(),
            nowDate.getMonth(),
            nowDate.getDate() - 1,
            12,
            0,
            0,
            0
        ).getTime();

        expect(formatTimeStampRelativeToNow(midnight, NOW)).toContain("12:00am yesterday");
        expect(formatTimeStampRelativeToNow(noon, NOW)).toContain("12:00pm yesterday");
    });

    it("handles single-digit minutes with leading zero", () => {
        // Create a timestamp for yesterday at 2:05pm
        const nowDate = new Date(NOW);
        const yesterday205pm = new Date(
            nowDate.getFullYear(),
            nowDate.getMonth(),
            nowDate.getDate() - 1,
            14,
            5,
            0,
            0
        ).getTime();

        const result = formatTimeStampRelativeToNow(yesterday205pm, NOW);
        expect(result).toContain("2:05pm yesterday");
    });

    it("handles cross-midnight date transitions", () => {
        // Create a timestamp for late yesterday (11:30pm)
        const nowDate = new Date(NOW);
        const lateYesterday = new Date(
            nowDate.getFullYear(),
            nowDate.getMonth(),
            nowDate.getDate() - 1,
            23,
            30,
            0,
            0
        ).getTime();

        const result = formatTimeStampRelativeToNow(lateYesterday, NOW);
        expect(result).toContain("11:30pm yesterday");
    });

    it("handles edge cases and invalid inputs", () => {
        // Future timestamp
        const futureResult = formatTimeStampRelativeToNow(NOW + 60 * 1000, NOW);
        expect(futureResult).toBe("just now"); // Negative totalSeconds < 60

        // Zero timestamp
        const zeroResult = formatTimeStampRelativeToNow(0, NOW);
        expect(zeroResult).toMatch(/^\d{1,2}:\d{2}(am|pm) \d{1,2}[/.-]\d{1,2}[/.-]\d{4}$/);
    });

    it("respects different locale date formats", () => {
        const oldTimestamp = NOW - 10 * 24 * 60 * 60 * 1000;

        // US format (M/D/YYYY)
        const usResult = formatTimeStampRelativeToNow(oldTimestamp, NOW, "en-US");
        expect(usResult).toMatch(/^\d{1,2}:\d{2}(am|pm) \d{1,2}\/\d{1,2}\/\d{4}$/);

        // UK format (D/M/YYYY)
        const ukResult = formatTimeStampRelativeToNow(oldTimestamp, NOW, "en-GB");
        expect(ukResult).toMatch(/^\d{1,2}:\d{2}(am|pm) \d{1,2}\/\d{1,2}\/\d{4}$/);

        // German format (D.M.YYYY)
        const deResult = formatTimeStampRelativeToNow(oldTimestamp, NOW, "de-DE");
        expect(deResult).toMatch(/^\d{1,2}:\d{2}(am|pm) \d{1,2}\.\d{1,2}\.\d{4}$/);

        // Verify they're actually different for a date where month/day differ
        const testDate = new Date(2025, 0, 15).getTime(); // Jan 15, 2025
        const usFormat = formatTimeStampRelativeToNow(testDate, NOW, "en-US");
        const ukFormat = formatTimeStampRelativeToNow(testDate, NOW, "en-GB");

        // US should have 1/15, UK should have 15/1
        expect(usFormat).toContain("1/15/2025");
        expect(ukFormat).toContain("15/1/2025");
    });
});
