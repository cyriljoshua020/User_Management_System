import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    currentUser$ = this.authService.currentUser$;

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }

    trackById(index: number, item: User): number {
        return item.id;
    }
}