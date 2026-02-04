import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/dashboard">
          <i class="bi bi-gem me-2"></i>Excellent System
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                <i class="bi bi-speedometer2 me-1"></i> Dashboard
              </a>
            </li>
            @if (authService.hasRole('ADMIN')) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/clients" routerLinkActive="active">
                  <i class="bi bi-people me-1"></i> Clientes
                </a>
              </li>
            }
            <li class="nav-item">
              <a class="nav-link" routerLink="/products" routerLinkActive="active">
                <i class="bi bi-box-seam me-1"></i> Produtos
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/orders" routerLinkActive="active">
                <i class="bi bi-cart me-1"></i> Pedidos
              </a>
            </li>
            @if (authService.hasRole('ADMIN')) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/users" routerLinkActive="active">
                  <i class="bi bi-person-gear me-1"></i> Usuários
                </a>
              </li>
            }
          </ul>
          <div class="d-flex">
             <span class="navbar-text text-white me-3 d-none d-lg-block">
               Olá, {{ authService.currentUser()?.email }}
             </span>
             <button class="btn btn-outline-light btn-sm" (click)="logout()">
               <i class="bi bi-box-arrow-right me-1"></i> Sair
             </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container py-4">
      <router-outlet></router-outlet>
    </div>
  `
})
export class MainLayoutComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
