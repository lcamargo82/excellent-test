import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product.model';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { ProductModalComponent } from '../product-modal/product-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductModalComponent, FormsModule], // Add FormsModule
  template: `
    <div class="container mt-5 animate__animated animate__fadeIn">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary fw-bold"><i class="bi bi-box-seam-fill me-2"></i> Produtos</h2>
        @if (isAdmin()) {
          <button class="btn btn-success shadow-sm" (click)="openModal()">
            <i class="bi bi-plus-lg me-1"></i> Novo Produto
          </button>
        }
      </div>

      <div class="card shadow border-0 rounded-3">
        <div class="card-header bg-white py-3 border-0">
            <div class="input-group">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input 
                    type="text" 
                    class="form-control border-start-0 ps-0" 
                    placeholder="Buscar produtos..." 
                    [(ngModel)]="searchQuery" 
                    (ngModelChange)="onSearch($event)">
            </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover table-striped mb-0 align-middle">
              <thead class="bg-light text-secondary">
                <tr>
                  <th class="ps-4">Imagem</th>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th class="text-end pe-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (product of products(); track product.id) {
                  <tr>
                    <td class="ps-4">
                      @if (product.images.length > 0) {
                        <img [src]="'/uploads/products/' + product.images[0].url.split('/').pop()" 
                             alt="Product" class="rounded shadow-sm" style="width: 50px; height: 50px; object-fit: cover;">
                      } @else {
                        <div class="bg-secondary bg-opacity-25 rounded d-flex align-items-center justify-content-center text-muted" 
                             style="width: 50px; height: 50px;">
                          <i class="bi bi-image"></i>
                        </div>
                      }
                    </td>
                    <td class="fw-bold text-dark">{{ product.name }}</td>
                    <td>{{ product.price | currency:'BRL' }}</td>
                    <td>
                      <span class="badge" [class.bg-success]="product.stock > 10" [class.bg-warning]="product.stock <= 10 && product.stock > 0" [class.bg-danger]="product.stock === 0">
                        {{ product.stock }} un
                      </span>
                    </td>
                    <td class="text-end pe-4">
                      @if (isAdmin()) {
                        <button class="btn btn-sm btn-outline-primary me-2" (click)="openModal(product)" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" (click)="deleteProduct(product)" title="Excluir">
                          <i class="bi bi-trash"></i>
                        </button>
                      } @else {
                        <button class="btn btn-sm btn-outline-info" (click)="openModal(product)" title="Ver">
                          <i class="bi bi-eye"></i>
                        </button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                      Nenhum produto encontrado.
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
                <button class="page-link" (click)="loadProducts(currentPage() - 1)">Anterior</button>
              </li>
              <li class="page-item" [class.disabled]="currentPage() === lastPage()">
                <button class="page-link" (click)="loadProducts(currentPage() + 1)">Próxima</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <app-product-modal 
      [product]="selectedProduct()" 
      [isOpen]="isModalOpen()" 
      (close)="closeModal($event)" 
    ></app-product-modal>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductsService);
  private authService = inject(AuthService);

  products = signal<Product[]>([]);
  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');
  currentPage = signal<number>(1);
  lastPage = signal<number>(1);
  totalItems = signal<number>(0);
  searchQuery = signal<string>('');
  private searchTimeout: any;

  isModalOpen = signal<boolean>(false);
  selectedProduct = signal<Product | null>(null);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(page: number = 1) {
    const onlyAvailable = false; // Salesperson should see all products, even zero stock
    const search = this.searchQuery();
    // Default limit is 10 in service, passing it explicitly here to match signature
    this.productService.getProducts(page, 10, onlyAvailable, search).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.currentPage.set(res.page);
        this.totalItems.set(res.total);
        this.lastPage.set(res.lastPage);
      },
      error: (err) => console.error(err)
    });
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadProducts(1);
    }, 300);
  }

  deleteProduct(product: Product) {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Deseja excluir ${product.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(product.id).subscribe(() => {
          Swal.fire('Excluído!', 'Produto removido.', 'success');
          this.loadProducts(this.currentPage());
        });
      }
    });
  }

  openModal(product: Product | null = null) {
    this.selectedProduct.set(product);
    this.isModalOpen.set(true);
  }

  closeModal(saved: boolean) {
    this.isModalOpen.set(false);
    this.selectedProduct.set(null);
    if (saved) {
      this.loadProducts(this.currentPage());
    }
  }
}
