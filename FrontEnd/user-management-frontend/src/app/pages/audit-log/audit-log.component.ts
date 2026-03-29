import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuditLogService } from '../../services/audit-log.service';
import { AuditLog } from '../../models/audit-log.model';

@Component({
    selector: 'app-audit-log',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './audit-log.component.html',
})
export class AuditLogComponent implements OnInit {
    logs: AuditLog[] = [];
    errorMessage = '';
    highlightMessage = '';

    constructor(
        private auditLogService: AuditLogService,
        private cdr: ChangeDetectorRef
    ) {
        // message passed from Admin Dashboard
        this.highlightMessage = history.state?.highlightMessage || '';
    }

    ngOnInit(): void {
        this.loadLogs();
    }

    loadLogs(): void {
        this.auditLogService.getAuditLogs().subscribe({
            next: (data) => {
                this.logs = [...data].sort(
                    (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                );
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.errorMessage = err?.error || 'Failed to load audit logs';
                this.cdr.detectChanges();
            },
        });
    }
}
