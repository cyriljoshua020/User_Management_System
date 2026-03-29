export interface AuditLog {
    id: number;
    performedBy: string;
    action: string;
    details: string;
    timestamp: string;
}