export interface DashboardActivityItem {
    action: string;
    user: string;
    time: string;
    type: string;
}

export interface DashboardSummary {
    userCount?: number;
    documentCount?: number;
    securityAlerts?: number;
    responseTimeMs?: number;
    doctorPatientCount?: number;
    doctorDocumentsSent?: number;
    doctorPending?: number;
    doctorDocumentsViewed?: number;
    patientDocumentCount?: number;
    patientUnread?: number;
    recentActivity?: DashboardActivityItem[];
}
