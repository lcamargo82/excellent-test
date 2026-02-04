import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsService } from '../../services/clients.service';
import { Client, PaginatedResult } from '../../models/client.model';
import Swal from 'sweetalert2';
import { ClientModalComponent } from '../client-modal/client-modal.component';
import { AuthService } from '../../../../core/services/auth.service';
import { computed } from '@angular/core';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, ClientModalComponent, NgxMaskPipe],
  template: `
    <div class="container mt-5 animate__animated animate__fadeIn">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary fw-bold"><i class="bi bi-people-fill me-2"></i> Clientes</h2>
        @if (isAdmin()) {
          <button class="btn btn-success shadow-sm" (click)="openModal()">
            <i class="bi bi-plus-lg me-1"></i> Novo Cliente
          </button>
        }
      </div>

      <div class="card shadow border-0 rounded-3">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover table-striped mb-0 align-middle">
              <thead class="bg-light text-secondary">
                <tr>
                  <th class="ps-4">Nome</th>
                  <th>CNPJ</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th class="text-end pe-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (client of clients(); track client.id) {
                  <tr>
                    <td class="ps-4 fw-bold text-dark">{{ client.name }}</td>
                    <td>{{ client.document | mask: '00.000.000/0000-00' }}</td>
                    <td>{{ client.email }}</td>
                    <td>{{ client.phone | mask: '(00) 0000-0000 || (00) 00000-0000' }}</td>
                    <td class="text-end pe-4">
                      @if (isAdmin()) {
                        <button class="btn btn-sm btn-outline-primary me-2" (click)="openModal(client)" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" (click)="deleteClient(client)" title="Excluir">
                          <i class="bi bi-trash"></i>
                        </button>
                      } @else {
                        <span class="text-muted small">Sem ações</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center">
          <span class="text-muted small">
            Página {{ currentPage() }} de {{ lastPage() }} (Total: {{ totalItems() }})
          </span>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" [class.disabled]="currentPage() === 1">
                <button class="page-link" (click)="loadClients(currentPage() - 1)">Anterior</button>
              </li>
              <li class="page-item" [class.disabled]="currentPage() === lastPage()">
                <button class="page-link" (click)="loadClients(currentPage() + 1)">Próxima</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal Component controlled via @ViewChild or structural directive if implemented that way. 
         For simplicity, I will use a simple logical flag or a shared service method, OR better: use Bootstrap Modal instance.
         To keep it Angular-way with standalone, I'll put the modal in the template and pass data.
    -->
    <app-client-modal 
      [client]="selectedClient()" 
      [isOpen]="isModalOpen()" 
      (close)="closeModal($event)" 
    ></app-client-modal>
  `
})
export class ClientListComponent implements OnInit {
  private clientService = inject(ClientsService);
  private authService = inject(AuthService);

  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');
  clients = signal<Client[]>([]);
  currentPage = signal<number>(1);
  lastPage = signal<number>(1);
  totalItems = signal<number>(0);

  // Modal State
  isModalOpen = signal<boolean>(false);
  selectedClient = signal<Client | null>(null);

  ngOnInit() {
    this.loadClients();
  }

  loadClients(page: number = 1) {
    this.clientService.getClients(page).subscribe({
      next: (res) => {
        this.clients.set(res.data);
        this.currentPage.set(res.page);
        this.totalItems.set(res.total);
        this.lastPage.set(res.lastPage);
      },
      error: (err) => console.error(err)
    });
  }

  deleteClient(client: Client) {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Deseja excluir ${client.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientService.deleteClient(client.id).subscribe(() => {
          Swal.fire('Excluído!', 'Cliente removido.', 'success');
          this.loadClients(this.currentPage());
        });
      }
    });
  }

  openModal(client: Client | null = null) {
    this.selectedClient.set(client);
    this.isModalOpen.set(true);
  }

  closeModal(saved: boolean) {
    this.isModalOpen.set(false);
    this.selectedClient.set(null);
    if (saved) {
      this.loadClients(this.currentPage());
    }
  }
}
