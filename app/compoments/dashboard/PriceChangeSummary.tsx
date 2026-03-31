type Snapshot = {
  capturedAt: string;
  localP95: number | null;
  localDiesel: number | null;
  localP100: number | null;
  localLpg: number | null;
  motorwayP95: number | null;
  motorwayDiesel: number | null;
  motorwayP100: number | null;
  motorwayLpg: number | null;
};

type Props = {
  latest: Snapshot;
  reference: Snapshot;
};

const LOCAL_FUELS: { key: keyof Snapshot; label: string }[] = [
  { key: "localP95", label: "Petrol 95" },
  { key: "localDiesel", label: "Diesel" },
  { key: "localP100", label: "Petrol 100" },
  { key: "localLpg", label: "LPG" },
];

const MOTORWAY_FUELS: { key: keyof Snapshot; label: string }[] = [
  { key: "motorwayP95", label: "Petrol 95" },
  { key: "motorwayDiesel", label: "Diesel" },
  { key: "motorwayP100", label: "Petrol 100" },
  { key: "motorwayLpg", label: "LPG" },
];

function DiffBadge({ diff }: { diff: number }) {
  if (Math.abs(diff) < 0.001)
    return (
      <span className="text-xs text-muted-foreground font-medium">
        → unchanged
      </span>
    );
  if (diff > 0)
    return (
      <span className="text-xs text-red-500 font-semibold">
        ↑ +€{diff.toFixed(3)}
      </span>
    );
  return (
    <span className="text-xs text-green-500 font-semibold">
      ↓ €{diff.toFixed(3)}
    </span>
  );
}

function FuelGrid({
  fuels,
  latest,
  reference,
}: {
  fuels: { key: keyof Snapshot; label: string }[];
  latest: Snapshot;
  reference: Snapshot;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {fuels.map(({ key, label }) => {
        const latestVal = latest[key] as number | null;
        const refVal = reference[key] as number | null;
        if (latestVal === null || refVal === null) return null;
        const diff = latestVal - refVal;
        return (
          <div key={key} className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <DiffBadge diff={diff} />
          </div>
        );
      })}
    </div>
  );
}

export default function PriceChangeSummary({ latest, reference }: Props) {
  const refDate = new Date(reference.capturedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
      <p className="text-sm font-semibold text-foreground">
        Price changes since {refDate}
      </p>
      <div>
        <p className="text-xs text-muted-foreground mb-2"> Local stations</p>
        <FuelGrid fuels={LOCAL_FUELS} latest={latest} reference={reference} />
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground mb-2"> Motorway stations</p>
        <FuelGrid
          fuels={MOTORWAY_FUELS}
          latest={latest}
          reference={reference}
        />
      </div>
    </div>
  );
}
