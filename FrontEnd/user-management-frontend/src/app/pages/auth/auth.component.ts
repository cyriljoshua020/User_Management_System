import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/login-request.model';
import { SignupRequest } from '../../models/signup-request.model';

@Component({
    selector: 'app-auth',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    showLoginPassword = false;
    showSignupPassword = false;

    toggleLoginPassword() {
        this.showLoginPassword = !this.showLoginPassword;
    }

    toggleSignupPassword() {
        this.showSignupPassword = !this.showSignupPassword;
    }

    isLoginMode = true;

    loginForm: FormGroup = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    signupForm: FormGroup = this.fb.group({
        username: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(4)]],
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        adminSecret: [''],
    });

    switchMode(isLogin: boolean): void {
        this.isLoginMode = isLogin;
    }

    onLoginSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const payload: LoginRequest = this.loginForm.value;
        this.authService.login(payload).subscribe({
            next: (user) => {
                if (user.role === 'ADMIN') {
                    this.router.navigate(['/admin']);
                } else {
                    this.router.navigate(['/user/profile']);
                }
            },
            error: (err) => {
                alert(err?.error || 'Login failed');
            },
        });
    }

    onSignupSubmit(): void {
        if (this.signupForm.invalid) {
            this.signupForm.markAllAsTouched();
            return;
        }

        const payload: SignupRequest = this.signupForm.value;
        this.authService.signup(payload).subscribe({
            next: (user) => {
                alert('Signup successful! You are now logged in.');
                if (user.role === 'ADMIN') {
                    this.router.navigate(['/admin']);
                } else {
                    this.router.navigate(['/user/profile']);
                }
            },
            error: (err) => {
                alert(err?.error || 'Signup failed');
            },
        });
    }
}