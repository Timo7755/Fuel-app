// Defines the valid range options used across the entire app
export type DashboardRange = "1M" | "3M" | "1Y";

// Rolling = last N days, calendar = from 1st of current month
export type RangeMode = "rolling" | "calendar";

// Safely parses the raw URL range param into a known DashboardRange
// Falls back to "1M" if missing or unrecognized
export function parseRange(input: string | null): DashboardRange {
  if (input === "1M" || input === "3M" || input === "1Y") return input;
  return "1M";
}

// Safely parses the raw URL mode param into a known RangeMode
// Falls back to "rolling" if missing or unrecognized
export function parseMode(input: string | null): RangeMode {
  if (input === "rolling" || input === "calendar") return input;
  return "rolling";
}

// Converts a range + mode into a Date for Prisma's gte filter
export function getFromDate(
  range: DashboardRange,
  mode: RangeMode = "rolling",
): Date {
  const now = new Date();

  if (range === "1M") {
    if (mode === "calendar") {
      // First day of the current calendar month
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    }
    // Rolling: last 30 days
    now.setDate(now.getDate() - 30);
    return now;
  }

  // 3M and 1Y are always rolling
  if (range === "3M") now.setDate(now.getDate() - 90);
  if (range === "1Y") now.setDate(now.getDate() - 365);

  return now;
}
