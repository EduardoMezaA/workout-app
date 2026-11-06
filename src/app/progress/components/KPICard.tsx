type KPICardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
};

export default function KPICard({ title, value, subtitle, icon }: KPICardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
          {title}
        </span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
