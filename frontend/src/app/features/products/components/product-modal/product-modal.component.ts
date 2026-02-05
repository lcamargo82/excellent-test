import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import Swal from 'sweetalert2';
import { switchMap, of } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  template: `
    @if (isOpen) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                {{ isAdmin() ? (product ? 'Editar Produto' : 'Novo Produto') : 'Detalhes do Produto' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="productForm">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Nome</label>
                    <input type="text" class="form-control" formControlName="name" 
                           [class.is-invalid]="isFieldInvalid('name')">
                    <div class="invalid-feedback">{{ getErrorMessage('name') }}</div>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">Preço</label>
                    <input type="text" class="form-control" formControlName="price"
                           mask="separator.2" thousandSeparator="." decimalMarker="," prefix="R$ "
                           [class.is-invalid]="isFieldInvalid('price') || productForm.hasError('priceRequired')">
                    <div class="invalid-feedback">
                      {{ getErrorMessage('price') || (productForm.hasError('priceRequired') ? 'Preço obrigatório se houver estoque.' : 'Preço inválido.') }}
                    </div>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">Estoque</label>
                    <input type="text" class="form-control" formControlName="stock"
                           mask="0*"
                           [class.is-invalid]="isFieldInvalid('stock') || productForm.hasError('stockRequired')">
                     <div class="invalid-feedback">
                      {{ getErrorMessage('stock') || (productForm.hasError('stockRequired') ? 'Estoque obrigatório se houver preço.' : 'Estoque inválido.') }}
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Descrição</label>
                  <textarea class="form-control" formControlName="description" rows="3"></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold">Imagens Atuais</label>
                  <div class="d-flex flex-wrap gap-2 mb-3">
                    @for (img of product?.images; track img.id) {
                      <div class="position-relative group">
                        <img [src]="'/uploads/products/' + img.url.split('/').pop()" 
                             alt="Product Image" class="rounded border shadow-sm" 
                             style="width: 80px; height: 80px; object-fit: cover;">
                        @if (isAdmin()) {
                          <button type="button" 
                                  class="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle p-1"
                                  (click)="removeExistingImage(img.id)"
                                  style="line-height: 1; transform: translate(30%, -30%);">
                            <i class="bi bi-x"></i>
                          </button>
                        }
                      </div>
                    } @empty {
                      <div class="text-muted small italic">Nenhuma imagem cadastrada.</div>
                    }
                  </div>
                  
                  @if (isAdmin()) {
                    <label class="form-label fw-bold">Adicionar Novas Imagens</label>
                    <input type="file" class="form-control" multiple (change)="onFileSelected($event)" accept="image/*">
                    <div class="form-text text-muted">Selecione uma ou mais imagens.</div>
                  }
                </div>
              </form>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                {{ isAdmin() ? 'Cancelar' : 'Fechar' }}
              </button>
              @if (isAdmin()) {
                <button type="button" class="btn btn-primary" (click)="save()" [disabled]="productForm.invalid">
                  <i class="bi bi-save me-1"></i> Salvar
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ProductModalComponent implements OnChanges {
  @Input() product: Product | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private productService = inject(ProductsService);
  private authService = inject(AuthService);
  private errorHandler = inject(ErrorHandlerService);

  isAdmin = signal(this.authService.hasRole('ADMIN'));

  productForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [''],
    stock: ['']
  }, { validators: this.dependencyValidator });

  dependencyValidator(group: FormGroup) {
    const price = group.get('price')?.value;
    const stock = group.get('stock')?.value;

    // Check if fields are "filled" (non-empty string/number)
    const priceFilled = price !== null && price !== '' && price !== undefined;
    const stockFilled = stock !== null && stock !== '' && stock !== undefined;

    if (stockFilled && !priceFilled) {
      return { priceRequired: true };
    }
    if (priceFilled && !stockFilled) {
      return { stockRequired: true };
    }
    return null;
  }

  selectedFiles: File[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (this.isAdmin()) {
      this.productForm.enable();
    } else {
      this.productForm.disable();
    }

    if (changes['product'] && this.product) {
      this.productForm.patchValue(this.product);
    } else if (changes['isOpen'] && this.isOpen && !this.product) {
      this.productForm.reset({ price: '', stock: '' });
      this.selectedFiles = [];
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.productForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.productForm.get(field);
    if (!control || !control.errors) return '';

    if (control.hasError('serverError')) return control.getError('serverError');
    if (control.hasError('required')) return 'Campo obrigatório.';
    if (control.hasError('email')) return 'Email inválido.';
    if (control.hasError('minlength')) return `Mínimo de ${control.getError('minlength').requiredLength} caracteres.`;

    return 'Campo inválido.';
  }


  onFileSelected(event: any) {
    if (event.target.files) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  removeExistingImage(imageId: string) {
    Swal.fire({
      title: 'Excluir imagem?',
      text: 'Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.productService.deleteImage(imageId).subscribe({
          next: () => {
            if (this.product) {
              this.product.images = this.product.images.filter(i => i.id !== imageId);
            }
            Swal.fire('Sucesso', 'Imagem removida.', 'success');
          },
          error: () => Swal.fire('Erro', 'Falha ao remover imagem.', 'error')
        });
      }
    });
  }

  save() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const dto = this.productForm.value;

    // Logic: Create/Update -> Then Upload Images if any
    let request$;

    if (this.product) {
      // Update
      request$ = this.productService.updateProduct(this.product.id, dto).pipe(
        switchMap((updatedProduct) => {
          if (this.selectedFiles.length > 0) {
            // Pass 'multiple' files
            return this.productService.uploadImages(updatedProduct.id, this.selectedFiles);
          }
          return of(updatedProduct);
        })
      );
    } else {
      // Create
      request$ = this.productService.createProduct(dto).pipe(
        switchMap((newProduct) => {
          if (this.selectedFiles.length > 0) {
            return this.productService.uploadImages(newProduct.id, this.selectedFiles);
          }
          return of(newProduct);
        })
      );
    }

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Produto salvo com sucesso.',
          timer: 1500,
          showConfirmButton: false
        });
        this.close.emit(true);
      },
      error: (err) => {
        const message = this.errorHandler.getErrorMessage(err);
        const fieldErrors = this.errorHandler.getFieldErrors(err);

        if (Object.keys(fieldErrors).length > 0) {
          Object.keys(fieldErrors).forEach(key => {
            const control = this.productForm.get(key);
            if (control) {
              control.setErrors({ serverError: fieldErrors[key] });
              control.markAsTouched();
            }
          });
        }

        Swal.fire('Erro', message, 'error');
        console.error(err);
      }
    });
  }

  closeModal() {
    this.close.emit(false);
  }
}
