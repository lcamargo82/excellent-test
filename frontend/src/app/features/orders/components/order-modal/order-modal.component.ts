import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { OrdersService } from '../../services/orders.service';
import { ClientsService } from '../../../clients/services/clients.service';
import { ProductsService } from '../../../products/services/products.service';
import { Order } from '../../models/order.model'; // DTOs used internally
import { Client } from '../../../clients/models/client.model';
import { Product } from '../../../products/models/product.model';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-order-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    @if (isOpen) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered modal-xl">
          <div class="modal-content border-0 shadow-lg" style="min-height: 600px;">
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
            <div class="modal-body bg-light">
              
              <!-- VIEW MODE -->
              @if (order) {
                <div class="container-fluid">
                  <div class="row mb-4">
                    <div class="col-md-6">
                      <h6 class="text-uppercase text-muted small fw-bold">Cliente</h6>
                      <p class="fs-5 fw-bold">{{ order.client?.name }}</p>
                      <p class="mb-1"><i class="bi bi-envelope me-2"></i>{{ order.client?.email }}</p>
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
                            <span class="fw-bold">{{ item.product?.name }}</span>
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
              
              <!-- CREATE MODE -->
              @else {
                <form [formGroup]="orderForm">
                  <div class="row mb-4">
                    <div class="col-md-6">
                      <label class="form-label fw-bold">Cliente</label>
                      <select class="form-select" formControlName="clientId" [class.is-invalid]="isFieldInvalid('clientId')">
                        <option value="">Selecione um cliente...</option>
                        @for (client of clients(); track client.id) {
                          <option [value]="client.id">{{ client.name }}</option>
                        }
                      </select>
                      <div class="invalid-feedback">Cliente é obrigatório.</div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="fw-bold mb-0">Produtos</h6>
                    <button type="button" class="btn btn-sm btn-outline-primary" (click)="addItem()">
                      <i class="bi bi-plus-lg"></i> Adicionar Item
                    </button>
                  </div>

                  <div class="card border-0 shadow-sm p-3 mb-3" style="max-height: 300px; overflow-y: auto;">
                    <div formArrayName="items">
                      @for (item of items.controls; track $index; let i = $index) {
                        <div [formGroupName]="i" class="row g-2 align-items-center mb-2 pb-2 border-bottom">
                          <div class="col-md-6">
                            <label class="form-label small" *ngIf="i===0">Produto</label>
                            <select class="form-select form-select-sm" formControlName="productId">
                              <option value="">Selecione...</option>
                              @for (prod of products(); track prod.id) {
                                <option [value]="prod.id" [disabled]="prod.stock === 0">
                                  {{ prod.name }} (R$ {{ prod.price | number:'1.2-2' }})
                                </option>
                              }
                            </select>
                          </div>
                          <div class="col-md-2">
                            <label class="form-label small" *ngIf="i===0">Qtd</label>
                            <input type="number" class="form-control form-control-sm" formControlName="quantity" min="1">
                          </div>
                          <div class="col-md-3 text-end">
                            <label class="form-label small" *ngIf="i===0">Subtotal</label>
                            <div class="fw-bold pt-1">{{ getItemSubtotal(i) | currency:'BRL' }}</div>
                          </div>
                          <div class="col-md-1 text-end">
                             <label class="d-block small" *ngIf="i===0">&nbsp;</label>
                            <button type="button" class="btn btn-sm text-danger" (click)="removeItem(i)">
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="row justify-content-end">
                    <div class="col-md-4 text-end">
                      <h4 class="fw-bold text-primary">Total: {{ calculateTotal() | currency:'BRL' }}</h4>
                    </div>
                  </div>

                </form>
              }

            </div>
            <div class="modal-footer bg-white">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Fechar</button>
              @if (!order) {
                <button type="button" class="btn btn-success" (click)="save()" [disabled]="orderForm.invalid || items.length === 0">
                  <i class="bi bi-check-lg me-1"></i> Finalizar Pedido
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class OrderModalComponent implements OnChanges {
    @Input() order: Order | null = null;
    @Input() isOpen = false;
    @Output() close = new EventEmitter<boolean>();

    private fb = inject(FormBuilder);
    private ordersService = inject(OrdersService);
    private clientsService = inject(ClientsService);
    private productsService = inject(ProductsService);

    // Data for Selects
    clients = signal<Client[]>([]);
    products = signal<Product[]>([]);

    orderForm: FormGroup = this.fb.group({
        clientId: ['', Validators.required],
        items: this.fb.array([], Validators.required)
    });

    get items() {
        return this.orderForm.get('items') as FormArray;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isOpen'] && this.isOpen) {
            if (!this.order) {
                // Create Mode: Reset and Load Data
                this.orderForm.reset();
                this.items.clear();
                this.addItem(); // Start with one row
                this.loadDependencies();
            }
        }
    }

    loadDependencies() {
        // Load Clients
        this.clientsService.getClients(1, 100).subscribe(res => {
            this.clients.set(res.data);
        });
        // Load Products
        this.productsService.getProducts(1, 100).subscribe(res => {
            this.products.set(res.data);
        });
    }

    createItem(): FormGroup {
        return this.fb.group({
            productId: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]]
        });
    }

    addItem() {
        this.items.push(this.createItem());
    }

    removeItem(index: number) {
        this.items.removeAt(index);
    }

    getItemSubtotal(index: number): number {
        const itemGroup = this.items.at(index) as FormGroup;
        const prodId = itemGroup.get('productId')?.value;
        const qty = itemGroup.get('quantity')?.value || 0;

        const product = this.products().find(p => p.id === prodId);
        return product ? product.price * qty : 0;
    }

    grandTotal = computed(() => {
        // This needs to React to form changes. Computed signals on form values requires hooking into valueChanges.
        // However, I can't easily make a Signal from FormArray valueChanges without `toSignal`.
        // Instead I'll just use a getter or simple method called from template? 
        // Template expression {{ grandTotal() }} works if grandTotal is a signal.
        // I will implement a simpler getter for now, as Angular change detection will call it.
        // BUT BETTER: Listen to valueChanges.
        return 0; // Placeholder, I'll implement `calculateTotal` method.
    });

    // Since `computed` with Forms is tricky without updates, I'll use a method called by template or update a signal on valueChanges.
    // I'll use a method and let Angular dirty check it (cheap math).
    calculateTotal(): number {
        let total = 0;
        for (let i = 0; i < this.items.length; i++) {
            total += this.getItemSubtotal(i);
        }
        return total;
    }

    // Overriding the signal property with the method for the template to work cleanly
    // Actually, I'll replace `grandTotal()` in template with `calculateTotal()`.

    isFieldInvalid(field: string): boolean {
        const control = this.orderForm.get(field);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    save() {
        if (this.orderForm.invalid || this.items.length === 0) {
            this.orderForm.markAllAsTouched();
            return;
        }

        const formValue = this.orderForm.value;
        const dto = {
            clientId: formValue.clientId,
            items: formValue.items.map((i: any) => ({
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
                // Backend specific error handling (e.g. Stock insufficient)
                const msg = err.error?.message || 'Ocorreu um erro ao salvar.';
                Swal.fire('Erro', msg, 'error');
            }
        });
    }

    closeModal() {
        this.close.emit(false);
    }
}
