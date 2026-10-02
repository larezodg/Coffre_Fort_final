export interface SecurityEventDto {
    id: string;
    event: string;
    source: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | string;
    date: string;
    action: string;
}
