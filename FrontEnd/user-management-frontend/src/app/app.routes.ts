import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AuthComponent } from './pages/auth/auth.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { AuditLogComponent } from './pages/audit-log/audit-log.component';

export const routes: Routes = [
    { path: '', component: AuthComponent },

    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [authGuard, adminGuard],
    },

    {
        path: 'admin/audit-logs',
        component: AuditLogComponent,
        canActivate: [authGuard, adminGuard],
    },

    {
        path: 'user/profile',
        component: UserProfileComponent,
        canActivate: [authGuard],
    },

    { path: '**', redirectTo: '' },
];