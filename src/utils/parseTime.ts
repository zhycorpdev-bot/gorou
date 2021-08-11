export function parseTime(time: string): number {
    const parsed: number[] = [];
    const regex = /(-?\d*\.?\d+(?:e[-+]?\d+)?)\s*([a-zμ]*)/ig;
    // eslint-disable-next-line radix
    time.replace(regex, (match: string, i: string) => String(parsed.push(parseInt(i, 10))));
    let result = 0;
    let quadrive = 1000;
    for (const parse of parsed.reverse()) {
        result += parse * quadrive;
        quadrive *= 60;
    }
    return result;
}
