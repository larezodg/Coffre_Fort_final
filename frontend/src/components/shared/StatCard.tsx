import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: { value: string; positive: boolean };
    className?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, className = '' }: StatCardProps) => (
    <div className={`stat-card ${className}`}>
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{title}</span>
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon size={18} className="text-primary" />
            </div>
        </div>
        <p className="text-2xl font-display font-bold text-foreground">{value}</p>
        {trend && (
            <p className={`text-xs font-medium ${trend.positive ? 'text-success' : 'text-destructive'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
        )}
    </div>
);

export default StatCard;
