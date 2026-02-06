import { Component, inject, OnInit, signal, computed } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Order } from '../../models/order.model';
import { OrderModalComponent } from '../order-modal/order-modal.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, OrderModalComponent, FormsModule], // Add FormsModule
  template: `
    <div class="container mt-5 animate__animated animate__fadeIn">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary fw-bold"><i class="bi bi-cart-fill me-2"></i> Pedidos</h2>
        <button class="btn btn-success shadow-sm" (click)="openModal()">
          <i class="bi bi-plus-lg me-1"></i> Novo Pedido
        </button>
      </div>

      <div class="card shadow border-0 rounded-3">
        <div class="card-header bg-white py-3 border-0">
            <div class="input-group">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input 
                    type="text" 
                    class="form-control border-start-0 ps-0" 
                    placeholder="Buscar pedidos por cliente ou ID..." 
                    [(ngModel)]="searchQuery" 
                    (ngModelChange)="onSearch($event)">
            </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover table-striped mb-0 align-middle">
              <thead class="bg-light text-secondary">
                <tr>
                  <th class="ps-4">ID</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th class="text-end pe-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                @if (isLoading()) {
                  <tr>
                    <td colspan="6" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                      </div>
                      <p class="mt-2 text-muted">Carregando pedidos...</p>
                    </td>
                  </tr>
                } @else {
                  @for (order of orders(); track order.id) {
                    <tr>
                      <td class="ps-4 text-muted small">#{{ order.id.substring(0, 8) }}</td>
                      <td class="fw-bold text-dark">{{ order.client.name }}</td>
                      <td class="fw-bold">{{ order.total | currency:'BRL' }}</td>
                      <td>
                        <span class="badge rounded-pill" 
                          [class.bg-warning]="order.status === 'PENDING'"
                          [class.bg-success]="order.status === 'COMPLETED'"
                          [class.bg-danger]="order.status === 'CANCELED'">
                          {{ order.status }}
                        </span>
                      </td>
                      <td>{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-info me-2" (click)="viewOrder(order)" title="Detalhes">
                          <i class="bi bi-eye"></i>
                        </button>
                        @if (isAdmin()) {
                          <button class="btn btn-sm btn-outline-danger" (click)="deleteOrder(order)" title="Excluir">
                            <i class="bi bi-trash"></i>
                          </button>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="text-center py-5 text-muted">
                        Nenhum pedido encontrado.
                      </td>
                    </tr>
                  }
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
                <button class="page-link" (click)="loadOrders(currentPage() - 1)">Anterior</button>
              </li>
              <li class="page-item" [class.disabled]="currentPage() === lastPage()">
                <button class="page-link" (click)="loadOrders(currentPage() + 1)">Próxima</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <app-order-modal 
      [order]="selectedOrder()" 
      [isOpen]="isModalOpen()" 
      (close)="closeModal($event)" 
    ></app-order-modal>
  `
})
export class OrderListComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private authService = inject(AuthService);

  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');
  orders = signal<Order[]>([]);
  currentPage = signal<number>(1);
  lastPage = signal<number>(1);
  totalItems = signal<number>(0);
  searchQuery = signal<string>('');
  private searchTimeout: any;

  isModalOpen = signal<boolean>(false);
  selectedOrder = signal<Order | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  isLoading = signal<boolean>(false);

  loadOrders(page: number = 1) {
    const search = this.searchQuery();
    this.isLoading.set(true);
    this.ordersService.getOrders(page, 10, search).subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.currentPage.set(res.page);
        this.totalItems.set(res.total);
        this.lastPage.set(res.lastPage);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadOrders(1);
    }, 300);
  }

  openModal() {
    this.selectedOrder.set(null); // Create mode
    this.isModalOpen.set(true);
  }

  viewOrder(order: Order) {
    this.selectedOrder.set(order); // View mode - Modal needs to handle Read-Only
    this.isModalOpen.set(true);
  }

  deleteOrder(order: Order) {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Deseja excluir o pedido #${order.id.substring(0, 8)}? O estoque será estornado.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ordersService.deleteOrder(order.id).subscribe({
          next: () => {
            Swal.fire('Excluído!', 'Pedido removido e estoque estornado.', 'success');
            this.loadOrders(this.currentPage());
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Erro!', 'Não foi possível excluir o pedido.', 'error');
          }
        });
      }
    });
  }

  closeModal(saved: boolean) {
    this.isModalOpen.set(false);
    this.selectedOrder.set(null);
    if (saved) {
      this.loadOrders(this.currentPage());
    }
  }
}
