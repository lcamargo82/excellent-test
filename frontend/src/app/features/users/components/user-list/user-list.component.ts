import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserModalComponent, FormsModule],
  template: `
    <div class="container mt-5 animate__animated animate__fadeIn">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
           <h2 class="text-primary fw-bold"><i class="bi bi-person-gear me-2"></i> Usuários</h2>
           <p class="text-muted mb-0">Gerencie os usuários do sistema</p>
        </div>
        <button class="btn btn-success shadow-sm" (click)="openModal()">
          <i class="bi bi-person-plus-fill me-1"></i> Novo Usuário
        </button>
      </div>

      <div class="card shadow border-0 rounded-3">
        <div class="card-header bg-white py-3 border-0">
            <div class="input-group">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input 
                    type="text" 
                    class="form-control border-start-0 ps-0" 
                    placeholder="Buscar usuários..." 
                    [(ngModel)]="searchQuery" 
                    (ngModelChange)="onSearch($event)">
            </div>
        </div>
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
                      @if (user.id !== authService.currentUser()?.id) {
                        <button class="btn btn-sm btn-outline-primary" (click)="editUser(user)" title="Editar Permissão">
                          <i class="bi bi-pencil"></i>
                        </button>
                      } @else {
                        <span class="badge bg-secondary">Você</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="text-center py-5 text-muted">
                      <div class="d-flex flex-column align-items-center">
                        <i class="bi bi-person-x fs-1 mb-2"></i>
                        <p class="mb-0">Nenhum usuário encontrado.</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer bg-white border-top-0 py-3">
            <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted small">
                    Mostrando {{ users().length }} de {{ totalItems() }} registros
                </span>
                <nav aria-label="Page navigation">
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item" [class.disabled]="currentPage() === 1">
                            <button class="page-link" (click)="onPageChange(currentPage() - 1)">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                        </li>
                        <li class="page-item active">
                            <span class="page-link">{{ currentPage() }}</span>
                        </li>
                        <li class="page-item" [class.disabled]="currentPage() >= lastPage()">
                            <button class="page-link" (click)="onPageChange(currentPage() + 1)">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
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
  authService = inject(AuthService);

  users = signal<User[]>([]);
  totalItems = signal<number>(0);
  currentPage = signal<number>(1);
  lastPage = signal<number>(1);
  searchQuery = signal<string>('');
  private searchTimeout: any;

  isModalOpen = signal<boolean>(false);
  selectedUser = signal<User | null>(null);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(page: number = 1) {
    const search = this.searchQuery();
    this.usersService.getUsers(page, 10, search).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.totalItems.set(res.total);
        this.currentPage.set(res.page);
        this.lastPage.set(res.lastPage || 1);
      },
      error: (err) => console.error(err)
    });
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadUsers(1);
    }, 300);
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.lastPage()) {
      this.loadUsers(page);
    }
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
      this.loadUsers(this.currentPage());
    }
  }
}
