export function parseListInput(input: string): string[] {
  return input
    ? input
        .replace(/\n/g, ',')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : []
}
