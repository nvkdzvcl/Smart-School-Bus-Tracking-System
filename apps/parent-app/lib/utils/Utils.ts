// src/lib/Utils.ts

/**
 * Lightweight clsx/cn without external deps.
 * Usage:
 *  cn("p-4", isActive && "bg-primary", ["rounded", { "opacity-50": disabled }])
 */
export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassDictionary
  | ClassValue[]

export interface ClassDictionary {
  [className: string]: boolean | undefined | null
}

export function clsx(...inputs: ClassValue[]): string {
  const out: string[] = []

  for (const input of inputs) {
    if (!input) continue

    const t = typeof input

    if (t === "string" || t === "number") {
      out.push(String(input))
      continue
    }

    if (Array.isArray(input)) {
      if (input.length) {
        const inner = clsx(...input)
        if (inner) out.push(inner)
      }
      continue
    }

    if (t === "object") {
      for (const key in input as ClassDictionary) {
        if (Object.prototype.hasOwnProperty.call(input, key) && (input as ClassDictionary)[key]) {
          out.push(key)
        }
      }
    }
  }

  return out.join(" ")
}

/**
 * Tailwind-friendly className combiner.
 * (Simple alias for clsx; order-last wins for conflicts.)
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs)
}

/* -------------------------
 * Small generic utilities
 * ------------------------*/

/** No operation function (placeholder callbacks) */
export const noop = () => {}

/** Narrowing helper: filters out null/undefined */
export function isDefined<T>(x: T | null | undefined): x is T {
  return x !== null && x !== undefined
}

/** Truncate string with ellipsis */
export function truncate(text: string, max = 100, ellipsis = "…") {
  if (text.length <= max) return text
  return text.slice(0, Math.max(0, max - ellipsis.length)) + ellipsis
}

/** Simple sleep (ms) */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Safe JSON.parse with fallback */
export function safeParseJSON<T = unknown>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Make an array of numbers: range(1,5) -> [1,2,3,4,5] */
export function range(start: number, end: number) {
  const step = start <= end ? 1 : -1
  const len = Math.abs(end - start) + 1
  return Array.from({ length: len }, (_, i) => start + i * step)
}

/** Exhaustiveness check for switch/case on union types */
export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x as unknown as string}`)
}
