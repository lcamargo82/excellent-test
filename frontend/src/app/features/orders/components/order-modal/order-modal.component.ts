import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule, AbstractControl } from '@angular/forms';
import { OrdersService } from '../../services/orders.service';
import { ClientsService } from '../../../clients/services/clients.service';
import { ProductsService } from '../../../products/services/products.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Order } from '../../models/order.model';
import { Client } from '../../../clients/models/client.model';
import { Product } from '../../../products/models/product.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered modal-xl"> <!-- Extra Large Modal -->
          <div class="modal-content border-0 shadow-lg" style="min-height: 80vh;">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                @if (order) {
                  Detalhes do Pedido #{{ order.id.substring(0,8) }}
                } @else {
                  Novo Pedido
                }
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            
            <div class="modal-body bg-light p-0">
              
              <!-- VIEW MODE -->
              @if (order) {
                <div class="container-fluid p-4">
                  <div class="row mb-4">
                    <div class="col-md-6">
                      <h6 class="text-uppercase text-muted small fw-bold">Cliente</h6>
                      <p class="fs-5 fw-bold">{{ order.client.name }}</p>
                      <p class="mb-1"><i class="bi bi-envelope me-2"></i>{{ order.client.email }}</p>
                    </div>
                    <div class="col-md-6 text-end">
                      <h6 class="text-uppercase text-muted small fw-bold">Status</h6>
                      <span class="badge fs-6" 
                        [class.bg-warning]="order.status === 'PENDING'"
                        [class.bg-success]="order.status === 'COMPLETED'">
                        {{ order.status }}
                      </span>
                      <h6 class="text-uppercase text-muted small fw-bold mt-3">Data</h6>
                      <p>{{ order.created_at | date:'medium' }}</p>
                    </div>
                  </div>

                  <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white fw-bold">Itens do Pedido</div>
                    <ul class="list-group list-group-flush">
                      @for (item of order.items; track item.id) {
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <span class="fw-bold">{{ item.product.name }}</span>
                            <div class="text-muted small">
                              {{ item.quantity }} x {{ item.price | currency:'BRL' }}
                            </div>
                          </div>
                          <span class="fw-bold">{{ (item.quantity * item.price) | currency:'BRL' }}</span>
                        </li>
                      }
                    </ul>
                    <div class="card-footer bg-white text-end">
                      <span class="text-muted me-2">Total:</span>
                      <span class="fs-4 fw-bold text-primary">{{ order.total | currency:'BRL' }}</span>
                    </div>
                  </div>
                </div>
              } 
              
              <!-- CREATE MODE: RICH UI -->
              @else {
                <div class="d-flex h-100 flex-column flex-lg-row">
                  
                  <!-- LEFT SIDE: PRODUCT CATALOG (65%) -->
                  <div class="flex-grow-1 p-3 border-end bg-white overflow-auto" style="flex-basis: 65%;">
                    <div class="d-flex justify-content-between align-items-center mb-3 sticky-top bg-white py-2" style="z-index: 10;">
                        <h5 class="mb-0 fw-bold text-secondary"><i class="bi bi-box-seam me-2"></i>Catálogo</h5>
                        
                        <!-- Client Selection for ALL Users (Salesperson Model) -->
                        <div class="w-50">
                            <label class="form-label small text-muted mb-0">Cliente</label>
                            <select class="form-control form-select-sm" [formControl]="clientIdControl" [class.is-invalid]="clientIdControl.invalid && clientIdControl.touched">
                                <option value="" disabled selected>Selecione um cliente...</option>
                                @for (client of clients(); track client.id) {
                                    <option [value]="client.id">{{ client.name }}</option>
                                }
                            </select>
                        </div>
                    </div>

                    <!-- Search Bar -->
                    <div class="input-group mb-3 sticky-top bg-white" style="top: 50px; z-index: 10;">
                        <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
                        <input type="text" class="form-control border-start-0 bg-light" placeholder="Buscar produtos..." 
                            [(ngModel)]="catalogSearch" (ngModelChange)="onCatalogSearch($event)">
                    </div>

                     <!-- Product Grid -->
                    <div class="row g-3">
                        @for (prod of catalogProducts(); track prod.id) {
                            <div class="col-md-4 col-sm-6">
                                <div class="card h-100 border-0 shadow-sm product-card position-relative">
                                     <!-- Stock Badge -->
                                     <span class="position-absolute top-0 end-0 badge m-2" 
                                        [class.bg-success]="prod.stock > 10" 
                                        [class.bg-warning]="prod.stock <= 10 && prod.stock > 0" 
                                        [class.bg-danger]="prod.stock === 0">
                                        {{ prod.stock }} un
                                     </span>

                                    <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 120px;">
                                        @if (prod.images && prod.images.length > 0) {
                                            <img [src]="'/uploads/products/' + prod.images[0].url.split('/').pop()" 
                                                alt="Prod" class="h-100 w-100 object-fit-cover rounded-top"
                                                onerror="this.src='placeholder.png'; this.parentElement.innerHTML='<i class=\'bi bi-image text-muted fs-1\'></i>'">
                                        } @else {
                                            <i class="bi bi-image text-muted fs-1"></i>
                                        }
                                    </div>
                                    <div class="card-body p-2 d-flex flex-column">
                                        <h6 class="card-title text-truncate mb-1" [title]="prod.name">{{ prod.name }}</h6>
                                        <p class="card-text text-primary fw-bold mb-2">{{ prod.price | currency:'BRL' }}</p>
                                        <button class="btn btn-sm btn-outline-primary mt-auto w-100" 
                                            (click)="addToOrder(prod)" 
                                            [disabled]="prod.stock === 0">
                                            <i class="bi bi-plus-lg"></i> Adicionar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        } @empty {
                            <div class="col-12 text-center py-5 text-muted">
                                <i class="bi bi-search display-6 mb-3 d-block"></i>
                                Nenhum produto encontrado.
                            </div>
                        }
                    </div>

                    <!-- Pagination -->
                    <div class="d-flex justify-content-between align-items-center mt-4">
                         <span class="text-muted small">
                            Pag {{ catalogPage() }} de {{ catalogLastPage() }}
                         </span>
                         <nav>
                            <ul class="pagination pagination-sm mb-0">
                                <li class="page-item" [class.disabled]="catalogPage() === 1">
                                    <button class="page-link" (click)="loadCatalog(catalogPage() - 1)">Ant</button>
                                </li>
                                <li class="page-item" [class.disabled]="catalogPage() === catalogLastPage()">
                                    <button class="page-link" (click)="loadCatalog(catalogPage() + 1)">Prox</button>
                                </li>
                            </ul>
                         </nav>
                    </div>
                  </div>

                  <!-- RIGHT SIDE: CART (35%) -->
                  <div class="d-flex flex-column bg-light border-start" style="flex-basis: 35%; min-width: 300px;">
                    <div class="p-3 bg-white border-bottom shadow-sm">
                        <h5 class="fw-bold mb-0 text-primary"><i class="bi bi-cart4 me-2"></i>Seu Pedido</h5>
                    </div>
                    
                    <div class="flex-grow-1 overflow-auto p-3">
                        @if (items.controls.length === 0) {
                            <div class="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                                <i class="bi bi-cart-x display-1 mb-3"></i>
                                <p>Carrinho vazio</p>
                            </div>
                        } @else {
                             <div class="list-group list-group-flush card shadow-sm border-0">
                                @for (itemControl of items.controls; track $index; let i = $index) {
                                    <div class="list-group-item p-2">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div class="me-2 text-truncate">
                                                <div class="fw-bold text-truncate" [title]="getProductName(i)">{{ getProductName(i) }}</div>
                                                <small class="text-muted">{{ getProductPrice(i) | currency:'BRL' }} un</small>
                                            </div>
                                            <div class="text-end">
                                                <div class="fw-bold">{{ getItemSubtotal(i) | currency:'BRL' }}</div>
                                            </div>
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mt-2 bg-light rounded p-1">
                                            <div class="input-group input-group-sm w-auto">
                                                <button class="btn btn-outline-secondary px-2" type="button" (click)="adjustQuantity(i, -1)">-</button>
                                                <input type="text" class="form-control text-center px-0" style="width: 40px;" [value]="getQuantity(i)" readonly>
                                                <button class="btn btn-outline-secondary px-2" type="button" (click)="adjustQuantity(i, 1)">+</button>
                                            </div>
                                            <button class="btn btn-sm text-danger" (click)="removeItem(i)" title="Remover">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                }
                             </div>
                        }
                    </div>

                    <div class="p-3 bg-white border-top shadow-lg z-index-10">
                         <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="text-muted h6 mb-0">Total</span>
                            <span class="fw-bold h3 mb-0 text-success">{{ calculateTotal() | currency:'BRL' }}</span>
                         </div>
                         <div class="d-grid gap-2">
                             @if (!order) {
                                <button type="button" class="btn btn-lg btn-success" 
                                    (click)="save()" 
                                    [disabled]="isSaveDisabled()">
                                    <i class="bi bi-check-lg me-1"></i> Finalizar Pedido
                                </button>
                             }
                         </div>
                    </div>
                  </div>

                </div>
              }
            </div>
            
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .product-card { transition: transform 0.2s; }
    .product-card:hover { transform: translateY(-2px); }
  `]
})
export class OrderModalComponent implements OnChanges {
  @Input() order: Order | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private ordersService = inject(OrdersService);
  private clientsService = inject(ClientsService);
  private productsService = inject(ProductsService);
  private authService = inject(AuthService);

  // Catalog State
  catalogProducts = signal<Product[]>([]);
  catalogPage = signal<number>(1);
  catalogLastPage = signal<number>(1);
  catalogTotal = signal<number>(0);
  catalogSearch = signal<string>('');
  private searchTimeout: any;

  // Client State
  clients = signal<Client[]>([]);
  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');
  currentClientName = signal<string>('');

  // Create Form
  clientIdControl = this.fb.control<string>('', Validators.required);
  itemsFormArray = this.fb.array([], Validators.required);

  // Helper to map product ID to details for the Cart view
  private productDetailsMap = new Map<string, Product>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      if (!this.order) {
        // Create Mode - Reset
        this.clientIdControl.reset();
        this.itemsFormArray.clear();
        this.productDetailsMap.clear();
        this.catalogSearch.set('');
        this.loadDependencies();
      }
    }
  }

  get items() {
    return this.itemsFormArray;
  }

  loadDependencies() {
    // Fetch clients for EVERYONE now (Salesperson model)
    this.clientsService.getClients(1, 100).subscribe(res => this.clients.set(res.data));

    this.loadCatalog(1);
  }

  loadCatalog(page: number = 1) {
    const onlyAvailable = false; // Salesperson should see all products
    const search = this.catalogSearch();
    this.productsService.getProducts(page, 9, onlyAvailable, search).subscribe(res => {
      this.catalogProducts.set(res.data);
      this.catalogPage.set(res.page);
      this.catalogLastPage.set(res.lastPage);
      this.catalogTotal.set(res.total);

      res.data.forEach(p => this.productDetailsMap.set(p.id, p));
    });
  }

  onCatalogSearch(query: string) {
    this.catalogSearch.set(query);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadCatalog(1);
    }, 300);
  }

  addToOrder(product: Product) {
    if (product.stock <= 0) return;

    // Iterate controls safely
    const index = this.itemsFormArray.controls.findIndex((c: AbstractControl) => c.value.productId === product.id);

    if (index >= 0) {
      this.adjustQuantity(index, 1);
    } else {
      this.productDetailsMap.set(product.id, product);

      const group = this.fb.group({
        productId: [product.id, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]]
      });

      // Cast to any to bypass strict type checking annoyance with FormArray push if inference failure
      this.itemsFormArray.push(group as any);

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true
      });
      Toast.fire({ icon: 'success', title: 'Adicionado!' });
    }
  }

  adjustQuantity(index: number, delta: number) {
    const control = this.items.at(index);
    const currentQty = control.get('quantity')?.value || 0;
    const newQty = currentQty + delta;

    const prodId = control.get('productId')?.value;
    const product = this.productDetailsMap.get(prodId);

    if (newQty < 1) return;
    if (product && newQty > product.stock) {
      Swal.fire({
        toast: true, position: 'top', icon: 'warning',
        title: `Estoque máximo: ${product.stock}`, timer: 2000, showConfirmButton: false
      });
      return;
    }

    control.patchValue({ quantity: newQty });
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  getProductName(index: number): string {
    const val = this.items.at(index).value as any;
    return this.productDetailsMap.get(val.productId)?.name || 'Carregando...';
  }

  getProductPrice(index: number): number {
    const val = this.items.at(index).value as any;
    return this.productDetailsMap.get(val.productId)?.price || 0;
  }

  getQuantity(index: number): number {
    const val = this.items.at(index).value as any;
    return val.quantity;
  }

  getItemSubtotal(index: number): number {
    return this.getProductPrice(index) * this.getQuantity(index);
  }

  calculateTotal(): number {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      total += this.getItemSubtotal(i);
    }
    return total;
  }

  isSaveDisabled(): boolean {
    return this.items.length === 0 || this.clientIdControl.invalid;
  }

  save() {
    if (this.isSaveDisabled()) {
      this.clientIdControl.markAsTouched();
      return;
    }

    const clientId = this.clientIdControl.value;
    if (!clientId) return; // Should be handled by valid check but TS needs it

    const dto = {
      clientId: clientId,
      items: this.itemsFormArray.value.map((i: any) => ({
        productId: i.productId,
        quantity: i.quantity
      }))
    };

    this.ordersService.createOrder(dto).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Pedido Realizado!',
          text: 'O pedido foi salvo com sucesso.',
          timer: 1500,
          showConfirmButton: false
        });
        this.close.emit(true);
      },
      error: (err) => {
        const msg = err.error?.message || 'Ocorreu um erro ao salvar.';
        Swal.fire('Erro', msg, 'error');
      }
    });
  }

  closeModal() {
    this.close.emit(false);
  }
}
