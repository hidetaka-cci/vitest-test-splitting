export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runHeavyWork(): Promise<number> {
  let total = 0
  for (let i = 0; i < 500_000; i += 1) {
    total += Math.sqrt(i % 97)
  }
  await sleep(8_000)
  return total
}
