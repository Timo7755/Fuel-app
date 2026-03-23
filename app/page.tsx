import SummaryCards from "@/app/compoments/dashboard/SummaryCards";
import {
  getDashboardData,
  type Range,
} from "@/lib/dashboard/get-dashboard-data";
import FillUpTable from "@/app/compoments/dashboard/FillUpTable";
import RangeSelector from "@/app/compoments/dashboard/RangeSelector";

export const dynamic = "force-dynamic";

const VALID_RANGES: Range[] = ["1M", "3M", "1Y"];

type Props = {
  searchParams: Promise<{ range?: string; mode?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const { range: rangeParam, mode: modeParam } = await searchParams;

  const range: Range = VALID_RANGES.includes(rangeParam as Range)
    ? (rangeParam as Range)
    : "1M";

  const mode = modeParam === "calendar" ? "calendar" : "rolling";

  try {
    const { summary, fillUps } = await getDashboardData(range, mode);

    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex justify-end mb-2"></div>
        <SummaryCards summary={summary} />
        <RangeSelector />
        <FillUpTable data={fillUps} />
      </main>
    );
  } catch (error) {
    console.error("Dashboard load error:", error);
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <p className="text-red-600">Failed to load dashboard data.</p>
      </main>
    );
  }
}
