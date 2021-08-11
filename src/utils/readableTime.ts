export function readableTime(duration: number): string {
    const SECOND = 1000;
    const MINUTE = SECOND * 60;
    const HOUR = MINUTE * 60;
    const seconds = Math.floor(duration / SECOND) % 60;
    if (duration < MINUTE) return `00:${seconds.toString().padStart(2, "0")}`;
    const minutes = Math.floor(duration / MINUTE) % 60;
    let output = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    if (duration >= HOUR) {
        const hours = Math.floor(duration / HOUR);
        output = `${hours.toString().padStart(2, "0")}:${output}`;
    }
    return output;
}
