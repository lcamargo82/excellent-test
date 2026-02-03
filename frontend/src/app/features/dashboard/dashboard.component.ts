import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row">
      <div class="col-md-12">
        <div class="p-5 mb-4 bg-light rounded-3 shadow-sm border">
          <div class="container-fluid py-5">
            <h1 class="display-5 fw-bold text-primary">Bem vindo ao Excellent!</h1>
            <p class="col-md-8 fs-4">Utilize o menu acima para navegar pelos módulos do sistema.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  authService = inject(AuthService);
}
