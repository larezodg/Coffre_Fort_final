type Status = 'success' | 'warning' | 'danger' | 'info' | 'encrypted' | 'active' | 'inactive';

const statusStyles: Record<Status, string> = {
    success: 'medical-badge-success',
    warning: 'medical-badge-warning',
    danger: 'medical-badge-danger',
    info: 'medical-badge-info',
    encrypted: 'medical-badge bg-accent/10 text-accent',
    active: 'medical-badge-success',
    inactive: 'medical-badge bg-muted text-muted-foreground',
};

interface StatusBadgeProps {
    status: Status;
    label: string;
}

const StatusBadge = ({ status, label }: StatusBadgeProps) => (
    <span className={statusStyles[status]} role="status">{label}</span>
);

export default StatusBadge;
