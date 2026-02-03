import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../services/orders.service';
import { Order } from '../../models/order.model';
import { OrderModalComponent } from '../order-modal/order-modal.component'; // Refresh import

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, OrderModalComponent],
  template: `
    <div class="container mt-5 animate__animated animate__fadeIn">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary fw-bold"><i class="bi bi-cart-fill me-2"></i> Pedidos</h2>
        <button class="btn btn-success shadow-sm" (click)="openModal()">
          <i class="bi bi-plus-lg me-1"></i> Novo Pedido
        </button>
      </div>

      <div class="card shadow border-0 rounded-3">
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
                      <button class="btn btn-sm btn-outline-info" (click)="viewOrder(order)" title="Detalhes">
                        <i class="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="text-center py-5 text-muted">
                      Nenhum pedido encontrado.
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

  orders = signal<Order[]>([]);
  currentPage = signal<number>(1);
  lastPage = signal<number>(1);
  totalItems = signal<number>(0);

  isModalOpen = signal<boolean>(false);
  selectedOrder = signal<Order | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(page: number = 1) {
    this.ordersService.getOrders(page).subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.currentPage.set(res.page);
        this.totalItems.set(res.total);
        this.lastPage.set(res.lastPage);
      },
      error: (err) => console.error(err)
    });
  }

  openModal() {
    this.selectedOrder.set(null); // Create mode
    this.isModalOpen.set(true);
  }

  viewOrder(order: Order) {
    this.selectedOrder.set(order); // View mode - Modal needs to handle Read-Only
    this.isModalOpen.set(true);
  }

  closeModal(saved: boolean) {
    this.isModalOpen.set(false);
    this.selectedOrder.set(null);
    if (saved) {
      this.loadOrders(this.currentPage());
    }
  }
}
