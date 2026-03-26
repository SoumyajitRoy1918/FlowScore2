interface ResponsePanelProps {
  data: unknown;
  emptyMessage: string;
}

export function ResponsePanel({ data, emptyMessage }: ResponsePanelProps) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <pre className="max-h-[28rem] overflow-auto rounded-2xl border border-white/10 bg-black/55 px-4 py-5 text-xs leading-6 text-slate-100">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
