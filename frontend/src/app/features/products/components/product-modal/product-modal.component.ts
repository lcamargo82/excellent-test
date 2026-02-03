import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product.model';
import Swal from 'sweetalert2';
import { switchMap, of } from 'rxjs';

@Component({
    selector: 'app-product-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    @if (isOpen) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">{{ product ? 'Editar Produto' : 'Novo Produto' }}</h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="productForm">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Nome</label>
                    <input type="text" class="form-control" formControlName="name" 
                           [class.is-invalid]="isFieldInvalid('name')">
                    <div class="invalid-feedback">Nome é obrigatório.</div>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">Preço</label>
                    <input type="number" class="form-control" formControlName="price"
                           [class.is-invalid]="isFieldInvalid('price')">
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">Estoque</label>
                    <input type="number" class="form-control" formControlName="stock">
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Descrição</label>
                  <textarea class="form-control" formControlName="description" rows="3"></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">Imagens</label>
                  <input type="file" class="form-control" multiple (change)="onFileSelected($event)" accept="image/*">
                  <div class="form-text text-muted">Selecione uma ou mais imagens.</div>
                </div>
              </form>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="button" class="btn btn-primary" (click)="save()" [disabled]="productForm.invalid">
                <i class="bi bi-save me-1"></i> Salvar
              </button>
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

    productForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        price: [0, [Validators.required, Validators.min(0)]],
        stock: [0, [Validators.required, Validators.min(0)]]
    });

    selectedFiles: File[] = [];

    ngOnChanges(changes: SimpleChanges) {
        if (changes['product'] && this.product) {
            this.productForm.patchValue(this.product);
        } else if (changes['isOpen'] && this.isOpen && !this.product) {
            this.productForm.reset({ price: 0, stock: 0 });
            this.selectedFiles = [];
        }
    }

    isFieldInvalid(field: string): boolean {
        const control = this.productForm.get(field);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    onFileSelected(event: any) {
        if (event.target.files) {
            this.selectedFiles = Array.from(event.target.files);
        }
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
                Swal.fire('Erro', 'Ocorreu um erro ao salvar.', 'error');
                console.error(err);
            }
        });
    }

    closeModal() {
        this.close.emit(false);
    }
}
