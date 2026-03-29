import {
    Component,
    AfterViewInit,
    ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';

import { UserService } from '../../services/user.service';
import { AuditLogService } from '../../services/audit-log.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { AuditLog } from '../../models/audit-log.model';
import { SignupRequest } from '../../models/signup-request.model';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements AfterViewInit {
    users: User[] = [];
    logs: AuditLog[] = [];

    selectedUser: User | null = null;
    editForm: FormGroup;

    // Add User form (admin creates user)
    showAddUserForm = false;
    addUserForm: FormGroup;

    // Search form: by userId & username
    searchForm: FormGroup;

    showAddUserPassword = false;

    toggleAddUserPassword(): void {
        this.showAddUserPassword = !this.showAddUserPassword;
    }

    constructor(
        private userService: UserService,
        private auditLogService: AuditLogService,
        private authService: AuthService,
        private fb: FormBuilder,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        // Edit form 
        this.editForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            active: [true, Validators.required],
        });

        // Add user form with validations
        this.addUserForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(4)]], // 4 chars
            fullName: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            adminSecret: [''],
        });

        // Search form
        this.searchForm = this.fb.group({
            userId: [''],
            username: [''],
        });
    }

    // Run only in browser
    ngAfterViewInit(): void {
        this.loadUsers();
        this.loadLogs();
    }

    get currentAdminUsername(): string {
        return this.authService.getCurrentUserSync()?.username ?? '';
    }

    // SEARCH: computed list to display
    get usersToDisplay(): User[] {
        const { userId, username } = this.searchForm.value;
        let result = this.users;

        if (userId) {
            const idNum = Number(userId);
            if (!isNaN(idNum)) {
                result = result.filter((u) => u.id === idNum);
            } else {
                result = [];
            }
        }

        if (username) {
            const uname = String(username).toLowerCase();
            result = result.filter((u) =>
                u.username.toLowerCase().includes(uname)
            );
        }

        return result;
    }

    clearSearch(): void {
        this.searchForm.reset();
        this.cdr.detectChanges();
    }

    // ADD USER (ADMIN)
    toggleAddUserForm(): void {
        this.showAddUserForm = !this.showAddUserForm;
    }

    submitAddUser(): void {
        if (this.addUserForm.invalid) {
            this.addUserForm.markAllAsTouched();
            return;
        }

        const payload: SignupRequest = this.addUserForm.value;
        const performedBy = this.currentAdminUsername;

        // setAsCurrentUser = false (keep admin logged in)
        this.authService.signup(payload, false, performedBy).subscribe({
            next: (newUser) => {
                alert(`User "${newUser.username}" created successfully`);
                this.users.push(newUser);
                this.addUserForm.reset();
                this.showAddUserForm = false;
                this.cdr.detectChanges();
                this.loadLogs(); // update audit summary

                const msg = `Admin ${performedBy} has created user ${newUser.username}`;
                this.goToAuditPageWithMessage(msg);
            },
            error: (err) => {
                console.error('Error creating user', err);
                alert(err?.error || 'Failed to create user');
            },
        });
    }

    // Helper for Add User validation messages
    hasAddUserError(controlName: string, error: string): boolean {
        const control = this.addUserForm.get(controlName);
        return !!control && control.touched && control.hasError(error);
    }

    // USERS LIST / EDIT
    loadUsers(): void {
        this.userService.getAllUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading users', err);
            },
        });
    }

    startEdit(user: User): void {
        this.selectedUser = user;
        this.editForm.patchValue({
            fullName: user.fullName,
            email: user.email,
            active: user.active,
        });
    }

    cancelEdit(): void {
        this.selectedUser = null;
        this.editForm.reset();
        this.cdr.detectChanges();
    }

    saveEdit(): void {
        if (!this.selectedUser) return;
        if (this.editForm.invalid) {
            this.editForm.markAllAsTouched();
            return;
        }

        const performedBy = this.currentAdminUsername;
        const beforeUsername = this.selectedUser.username;

        this.userService
            .updateUser(this.selectedUser.id, this.editForm.value, performedBy)
            .subscribe({
                next: (updated) => {
                    const idx = this.users.findIndex((u) => u.id === updated.id);
                    if (idx > -1) {
                        this.users[idx] = updated;
                    }
                    alert('User updated successfully');
                    this.cancelEdit();
                    this.loadLogs(); // refresh audit summary

                    const msg = `Admin ${performedBy} has updated user ${beforeUsername}`;
                    this.goToAuditPageWithMessage(msg);
                },
                error: (err) => {
                    console.error('Error updating user', err);
                    alert(err?.error || 'Failed to update user');
                },
            });
    }

    deleteUser(user: User): void {
        const performedBy = this.currentAdminUsername;
        if (!performedBy) {
            alert('You are not logged in');
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to delete user "${user.username}"?`
        );
        if (!confirmed) return;

        this.userService.deleteUser(user.id, performedBy).subscribe({
            next: () => {
                alert('User deleted successfully');
                this.users = this.users.filter((u) => u.id !== user.id);
                if (this.selectedUser?.id === user.id) {
                    this.cancelEdit();
                }
                this.cdr.detectChanges();
                this.loadLogs();

                const msg = `Admin ${performedBy} has deleted user ${user.username}`;
                this.goToAuditPageWithMessage(msg);
            },
            error: (err) => {
                console.error('Error deleting user', err);
                alert(err?.error || 'Failed to delete user');
            },
        });
    }

    promoteToAdmin(user: User): void {
        const performedBy = this.currentAdminUsername;
        if (!performedBy) {
            alert('You are not logged in');
            return;
        }

        this.userService.promoteToAdmin(user.id, performedBy).subscribe({
            next: (updated) => {
                alert(`User "${updated.username}" promoted to ADMIN`);
                const idx = this.users.findIndex((u) => u.id === updated.id);
                if (idx > -1) {
                    this.users[idx] = updated;
                }
                this.cdr.detectChanges();
                this.loadLogs();

                const msg = `Admin ${performedBy} has promoted user ${updated.username} to ADMIN`;
                this.goToAuditPageWithMessage(msg);
            },
            error: (err) => {
                console.error('Error promoting user', err);
                alert(err?.error || 'Failed to promote user');
            },
        });
    }

    // AUDIT LOGS
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
                console.error('Error loading audit logs', err);
            },
        });
    }

    goToAuditPage(): void {
        this.router.navigate(['/admin/audit-logs']);
    }

    goToAuditPageWithMessage(message: string): void {
        this.router.navigate(['/admin/audit-logs'], {
            state: { highlightMessage: message },
        });
    }
}

