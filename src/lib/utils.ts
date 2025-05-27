/**
 * Formats milliseconds into MM:SS.ss format.
 * @param {number} ms - The total elapsed time in milliseconds.
 * @returns {string} The formatted time string.
 */
export function formatTime(ms: number): string {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((seconds * 100) % 100);

    const formattedMinutes = String(minutes);
    const formattedSecondsShort = String(Math.floor(seconds));
    const formattedSecondsLong = String(Math.floor(seconds)).padStart(2, "0");
    const formattedHundredths = String(hundredths).padStart(2, "0");

    if (minutes > 0) {
        return `${formattedMinutes}:${formattedSecondsLong}.${formattedHundredths}`;
    }
    return `${formattedSecondsShort}.${formattedHundredths}`;
}
