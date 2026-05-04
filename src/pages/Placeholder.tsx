export function Placeholder({ title, description }: { title: string, description?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <h2 className="text-3xl font-bold tracking-tight text-slate-300">{title}</h2>
      <p className="text-slate-500 max-w-md text-center">
        {description || "This module is currently under construction. Check back soon for updates."}
      </p>
    </div>
  );
}
