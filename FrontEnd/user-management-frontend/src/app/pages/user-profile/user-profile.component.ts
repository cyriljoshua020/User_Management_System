import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { UpdateUserRequest } from '../../models/update-user-request.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
    private authService = inject(AuthService);
    private userService = inject(UserService);
    private fb = inject(FormBuilder);
    private router = inject(Router);

    form: FormGroup = this.fb.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
    });

    currentUser: User | null = null;
    loading = false;

    ngOnInit(): void {
        const user = this.authService.getCurrentUserSync();
        if (!user) {
            this.router.navigate(['/auth']);
            return;
        }
        this.currentUser = user;
        this.loadUserDetails(user.id);
    }

    loadUserDetails(id: number): void {
        this.loading = true;
        this.userService.getUserById(id).subscribe({
            next: (user) => {
                this.form.patchValue({
                    fullName: user.fullName,
                    email: user.email,
                });
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                alert('Failed to load user details');
            },
        });
    }

    save(): void {
        if (!this.currentUser) return;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const payload: UpdateUserRequest = this.form.value;
        this.userService.updateUser(this.currentUser.id, payload).subscribe({
            next: (updated) => {
                alert('Profile updated successfully');
                const newUser: User = {
                    ...this.currentUser!,
                    fullName: updated.fullName,
                    email: updated.email,
                };
                this.currentUser = newUser;
                this.authService.setCurrentUser(newUser);
            },
            error: (err) => {
                alert(err?.error || 'Failed to update profile');
            },
        });
    }
}