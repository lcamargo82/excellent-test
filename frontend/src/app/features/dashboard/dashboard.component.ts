import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div class="container">
        <a class="navbar-brand" href="#">Excellent System</a>
        <button class="btn btn-light btn-sm" (click)="logout()">Logout</button>
      </div>
    </nav>
    <div class="container">
      <h1>Bem vindo ao Dashboard</h1>
      <p>Você está logado.</p>
    </div>
  `
})
export class DashboardComponent {
    authService = inject(AuthService);

    logout() {
        this.authService.logout();
    }
}
