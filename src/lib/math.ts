export function add(a: number, b: number): number {
  return a + b
}

export function subtract(a: number, b: number): number {
  return a - b
}

export function multiply(a: number, b: number): number {
  return a * b
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('division by zero')
  }
  return a / b
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
