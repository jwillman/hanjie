export function getHanjieHints(line: boolean[]): number[] {
    const hints: number[] = [];
    let count = 0;
    for (let i = 0; i < line.length; i++) {
        if (line[i]) {
            count++;
        } else {
            if (count > 0) {
                hints.push(count);
                count = 0;
            }
        }
    }
    if (count > 0) hints.push(count);
    return hints;
}
