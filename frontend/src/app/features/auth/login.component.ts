import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container d-flex justify-content-center align-items-center vh-100 bg-gradient-primary">
      <div class="card shadow-lg border-0 rounded-3 animate__animated animate__fadeIn" style="max-width: 400px; width: 90%;">
        <div class="card-body p-5">
          <div class="text-center mb-4">
            <h2 class="fw-bold text-primary">Bem-vindo</h2>
            <p class="text-muted">Acesse o Excellent System</p>
          </div>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="email" class="form-label text-secondary small text-uppercase fw-bold">Email</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope"></i></span>
                <input type="email" id="email" class="form-control border-start-0 bg-light" formControlName="email" placeholder="seu@email.com">
              </div>
            </div>
            
            <div class="mb-4">
              <label for="password" class="form-label text-secondary small text-uppercase fw-bold">Senha</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock"></i></span>
                <input type="password" id="password" class="form-control border-start-0 bg-light" formControlName="password" placeholder="••••••••">
              </div>
            </div>
            
            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg shadow-sm" [disabled]="loginForm.invalid">
                ENTRAR
              </button>
            </div>
          </form>
        </div>
        <div class="card-footer text-center bg-white border-0 py-3">
          <small class="text-muted">© 2026 Excellent System</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); /* Deep Blue premium gradient */
    }
    .form-control:focus {
        box-shadow: none;
        border-color: #2a5298;
    }
    .input-group-text {
        border-right: none;
    }
    .btn-primary {
        background-color: #2a5298;
        border-color: #2a5298;
        transition: all 0.3s;
    }
    .btn-primary:hover {
        background-color: #1e3c72;
        transform: translateY(-2px);
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login({ email, password }).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Erro no Login',
            text: 'Email ou senha inválidos',
            confirmButtonColor: '#0d6efd'
          });
        }
      });
    }
  }
}
