export function Progress({ value }: { value: number }) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
      <div
        className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-300 transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
