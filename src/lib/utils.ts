/**
 * Formats milliseconds into MM:SS.ss format.
 * @param {number} ms - The total elapsed time in milliseconds.
 * @returns {string} The formatted time string.
 */
export function formatTime(ms: number): string {
    const totalSeconds = ms / 1000;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((seconds * 100) % 100);

    const formattedHours = String(hours);
    const formattedMinutesShort = String(minutes);
    const formattedMinutesLong = String(minutes).padStart(2, "0");
    const formattedSecondsShort = String(Math.floor(seconds));
    const formattedSecondsLong = String(Math.floor(seconds)).padStart(2, "0");
    const formattedHundredths = String(hundredths).padStart(2, "0");

    if (hours > 0) {
        return `${formattedHours}:${formattedMinutesLong}:${formattedSecondsLong}.${formattedHundredths}`;
    } else if (minutes > 0) {
        return `${formattedMinutesShort}:${formattedSecondsLong}.${formattedHundredths}`;
    } else {
        return `${formattedSecondsShort}.${formattedHundredths}`;
    }
}

/**
 * Formats a timestamp relative to the current time
 * @param ms - The timestamp in milliseconds to format
 * @param now - The timestamp of right now, in milliseconds
 * @param locale - Optional locale string for date formatting (e.g., 'en-US', 'en-GB', 'de-DE')
 * @returns A human-readable string representing the relative time
 */
export function formatTimeStampRelativeToNow(
    ms: number,
    now: number = new Date().getTime(),
    locale?: string
): string {
    const totalSeconds = (now - ms) / 1000;
    const date = new Date(ms);

    // Less than 60 seconds
    if (totalSeconds < 60) {
        return "just now";
    }
    // Less than 60 minutes
    else if (totalSeconds < 60 * 60) {
        const minutes = Math.floor(totalSeconds / 60);
        return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
    }
    // Today (between start of today and now)
    else if (new Date(ms).setHours(0, 0, 0, 0) === new Date(now).setHours(0, 0, 0, 0)) {
        const hours = Math.floor(totalSeconds / 3600);
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
    // Within the last 7 days
    else if (totalSeconds < 60 * 60 * 24 * 7) {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

        const startOfYesterday = new Date(now).setHours(0, 0, 0, 0) - 86400000;
        const startOfTimestampDay = new Date(ms).setHours(0, 0, 0, 0);
        const isYesterday = startOfYesterday === startOfTimestampDay;

        const dayName = isYesterday ? "yesterday" : days[date.getDay()];
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "pm" : "am";
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${formattedHours}:${formattedMinutes}${ampm} ${dayName}`;
    }
    // Older than a week
    else {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "pm" : "am";
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        // Get locale-aware date parts without leading zeros
        const formatter = new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        });
        const parts = formatter.formatToParts(date);

        // Extract parts and remove leading zeros
        const day = parseInt(parts.find((p) => p.type === "day")?.value || "1");
        const month = parseInt(parts.find((p) => p.type === "month")?.value || "1");
        const year = parts.find((p) => p.type === "year")?.value;
        const separator = parts.find((p) => p.type === "literal")?.value || "/";

        // Determine order based on locale
        const monthIndex = parts.findIndex((p) => p.type === "month");
        const dayIndex = parts.findIndex((p) => p.type === "day");
        const isMonthFirst = monthIndex < dayIndex;

        const formattedDate = isMonthFirst
            ? `${month}${separator}${day}${separator}${year}`
            : `${day}${separator}${month}${separator}${year}`;

        return `${formattedHours}:${formattedMinutes}${ampm} ${formattedDate}`;
    }
}
