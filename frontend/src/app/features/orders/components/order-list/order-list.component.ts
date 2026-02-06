import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { SKIP_LOADING } from '../../../../core/interceptors/loading.interceptor';
import { finalize, tap } from 'rxjs/operators';
import { timeout } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Order } from '../../models/order.model';
import { PaginatedResult } from '../../../clients/models/client.model';
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
                      <td class="fw-bold text-dark">{{ order.client?.name || 'Cliente Removido' }}</td>
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
                        <button class="btn btn-sm btn-outline-info me-2" (click)="viewOrder(order)" title="Detalhes" [disabled]="loadingOrderId() === order.id">
                          @if (loadingOrderId() === order.id) {
                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          } @else {
                            <i class="bi bi-eye"></i>
                          }
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
                <button class="page-link" (click)="loadOrders(currentPage() - 1)">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li class="page-item active">
                <span class="page-link">{{ currentPage() }}</span>
              </li>
              <li class="page-item" [class.disabled]="currentPage() === lastPage()">
                <button class="page-link" (click)="loadOrders(currentPage() + 1)">
                  <i class="bi bi-chevron-right"></i>
                </button>
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
    // Safety check: if loading takes more than 5s, force disable it to show error/empty state
    setTimeout(() => {
      if (this.isLoading()) {
        console.warn('Force stopping loading spinner after 5s safety timeout');
        this.isLoading.set(false);
      }
    }, 5000);
  }

  isOrdersArrayCheck() {
    // Helper to debug signals in template
    return Array.isArray(this.orders());
  }

  isLoading = signal<boolean>(false);

  loadOrders(page: number = 1) {
    const search = this.searchQuery();
    this.isLoading.set(true);
    this.ordersService.getOrders(page, 10, search)
      .pipe(
        tap((res: PaginatedResult<Order>) => console.log('Pipe tap - Data received:', res)),
        finalize(() => {
          console.log('Pipe finalize - setting isLoading false');
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (res: PaginatedResult<Order>) => {
          try {
            if (!res || !res.data) {
              throw new Error('Resposta inválida da API');
            }
            this.orders.set(res.data);
            this.currentPage.set(res.page);
            this.totalItems.set(res.total);
            this.lastPage.set(res.lastPage);
          } catch (e) {
            console.error('Error processing orders response:', e);
            Swal.fire('Erro', 'Erro ao processar dados dos pedidos.', 'error');
          }
        },
        error: (err) => {
          console.error('Error loading orders:', err);
          Swal.fire('Erro', 'Não foi possível carregar os pedidos.', 'error');
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

  loadingOrderId = signal<string | null>(null);

  viewOrder(order: Order) {
    this.loadingOrderId.set(order.id);
    console.log('Requesting full details for order:', order.id);

    // Bypass global loading interceptor to use local button state
    // We need to cast ordersService to accessing the HttpClient or use a direct call if getOrder doesn't support context args yet?
    // Actually, getOrder takes (id) only. We need to modify the Service OR directly inject HttpClient here?
    // Better practice: Add context param to service method or use context in service. 
    // Let's modify the component to just call the service, but we'll need to update the service to accept options OR we can just hope the manual isLoadingDetails is enough if we remove the global spinner. 
    // WAIT: I cannot pass context to getOrder without modifying the service. 
    // Let's modify the SERVICE first in the next tool call. For now, I'll assume I'll update the service.

    // Changing approach: I will update the service to accept options or expose the http call more flexibly.
    // For now, let's just make sure the component logic is sound. We will update the service in the next step.

    this.ordersService.getOrder(order.id, {
      context: new HttpContext().set(SKIP_LOADING, true)
    })
      .pipe(
        timeout(5000),
        tap(res => console.log('Full order response:', res)),
        finalize(() => this.loadingOrderId.set(null))
      )
      .subscribe({
        next: (fullOrder: Order) => {
          if (!fullOrder) {
            throw new Error('Pedido retornou vazio.');
          }
          console.log('Setting selectedOrder:', fullOrder);
          this.selectedOrder.set(fullOrder);
          this.isModalOpen.set(true);
        },
        error: (err) => {
          console.error('Error fetching full order details:', err);
          Swal.fire('Erro', 'Não foi possível carregar os detalhes do pedido.', 'error');
        }
      });
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
