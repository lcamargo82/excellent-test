import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';
import { UserModalComponent } from '../user-modal/user-modal.component'; // Refresh import

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserModalComponent],
  template: `
    <div class="container mt-5 animate__animated animate__fadeIn">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary fw-bold"><i class="bi bi-person-gear me-2"></i> Usuários</h2>
        <button class="btn btn-success shadow-sm" (click)="openModal()">
          <i class="bi bi-person-plus-fill me-1"></i> Novo Usuário
        </button>
      </div>

      <div class="card shadow border-0 rounded-3">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover table-striped mb-0 align-middle">
              <thead class="bg-light text-secondary">
                <tr>
                  <th class="ps-4">Nome</th>
                  <th>Email</th>
                  <th>Permissão</th>
                  <th class="text-end pe-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users(); track user.id) {
                  <tr>
                    <td class="ps-4 fw-bold text-dark">{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span class="badge" 
                        [class.bg-danger]="user.role === 'ADMIN'"
                        [class.bg-info]="user.role === 'USER'">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="text-end pe-4">
                      <button class="btn btn-sm btn-outline-primary" (click)="editUser(user)" title="Editar Permissão">
                        <i class="bi bi-pencil"></i>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="text-center py-5 text-muted">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <app-user-modal 
      [user]="selectedUser()" 
      [isOpen]="isModalOpen()" 
      (close)="closeModal($event)" 
    ></app-user-modal>
  `
})
export class UserListComponent implements OnInit {
  private usersService = inject(UsersService);

  users = signal<User[]>([]);

  isModalOpen = signal<boolean>(false);
  selectedUser = signal<User | null>(null);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.usersService.getUsers().subscribe({
      next: (data) => this.users.set(data),
      error: (err) => console.error(err)
    });
  }

  openModal() {
    this.selectedUser.set(null);
    this.isModalOpen.set(true);
  }

  editUser(user: User) {
    this.selectedUser.set(user);
    this.isModalOpen.set(true);
  }

  closeModal(saved: boolean) {
    this.isModalOpen.set(false);
    this.selectedUser.set(null);
    if (saved) {
      this.loadUsers();
    }
  }
}
