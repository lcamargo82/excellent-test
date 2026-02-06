import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientsService } from '../../services/clients.service';
import { IntegrationsService } from '../../../../core/services/integrations.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { Client } from '../../models/client.model';
import { NgxMaskDirective } from 'ngx-mask';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  template: `
    @if (isOpen) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">{{ client ? 'Editar Cliente' : 'Novo Cliente' }}</h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="clientForm" (ngSubmit)="save()">
                <div class="mb-3">
                  <label class="form-label fw-bold">CNPJ</label>
                   <div class="input-group">
                    <input type="text" class="form-control" formControlName="document"
                           mask="00.000.000/0000-00"
                           [class.is-invalid]="isFieldInvalid('document')"
                           [readonly]="!!client"
                           (keyup)="onDocumentKeyUp()">
                    @if (isFetchingCnpj()) {
                      <span class="input-group-text">
                        <span class="spinner-border spinner-border-sm" role="status"></span>
                      </span>
                    }
                  </div>
                  <div class="invalid-feedback">{{ getErrorMessage('document') }}</div>
                  <small class="text-muted">Digite os 14 dígitos do CNPJ.</small>
                </div>

                <div class="mb-3">
                  <label class="form-label">Nome</label>
                  <input type="text" class="form-control" formControlName="name" 
                         [class.is-invalid]="isFieldInvalid('name')">
                  <div class="invalid-feedback">{{ getErrorMessage('name') }}</div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" formControlName="email"
                         [class.is-invalid]="isFieldInvalid('email')">
                  <div class="invalid-feedback">{{ getErrorMessage('email') }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold">Telefone</label>
                  <input type="text" class="form-control" formControlName="phone"
                         mask="(00) 0000-0000 || (00) 00000-0000"
                         [class.is-invalid]="isFieldInvalid('phone')">
                  <div class="invalid-feedback">{{ getErrorMessage('phone') }}</div>
                </div>
              </form>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="button" class="btn btn-primary" (click)="save()" [disabled]="clientForm.invalid">
                <i class="bi bi-save me-1"></i> Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ClientModalComponent implements OnChanges {
  @Input() client: Client | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private clientService = inject(ClientsService);
  private integrationsService = inject(IntegrationsService);
  private errorHandler = inject(ErrorHandlerService);

  isFetchingCnpj = signal(false);

  clientForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    document: ['', [Validators.required, Validators.minLength(14), this.cnpjValidator]]
  });

  cnpjValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    const cnpj = value.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14) return { invalidCnpj: true };

    if (/^(\d)\1+$/.test(cnpj)) return { invalidCnpj: true };

    let tamanho = cnpj.length - 2
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return { invalidCnpj: true };

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return { invalidCnpj: true };

    return null;
  }

  onDocumentKeyUp() {
    const val = this.clientForm.get('document')?.value || '';
    const cleanVal = val.replace(/\D/g, '');

    if (cleanVal.length === 14) {
      if (!this.clientForm.get('document')?.hasError('invalidCnpj')) {
        this.fetchCnpj(cleanVal);
      }
    }
  }

  fetchCnpj(cnpj: string) {
    this.isFetchingCnpj.set(true);
    this.integrationsService.consultCnpj(cnpj).subscribe({
      next: (data) => {
        this.isFetchingCnpj.set(false);
        if (data && data.razao_social) {

          const phone = data.ddd_telefone_1
            ? `(${data.ddd_telefone_1.substring(0, 2)}) ${data.ddd_telefone_1.substring(2)}`
            : (data.estabelecimento?.ddd1 && data.estabelecimento?.telefone1
              ? `${data.estabelecimento.ddd1}${data.estabelecimento.telefone1}`
              : '');

          this.clientForm.patchValue({
            name: data.razao_social,
            email: data.estabelecimento?.email || this.clientForm.get('email')?.value,
            phone: phone || this.clientForm.get('phone')?.value
          });

          Swal.fire({
            icon: 'info',
            title: 'CNPJ Identificado',
            text: `Dados preenchidos para: ${data.razao_social}`,
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      error: (err) => {
        this.isFetchingCnpj.set(false);
        console.error('Erro ao consultar CNPJ:', err);
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Não foi possível consultar os dados do CNPJ automaticamente. Verifique se o backend está rodando.',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isOpen) {
      if (this.client) {
        // Edit Mode
        this.clientForm.patchValue(this.client);
        setTimeout(() => this.clientForm.get('document')?.disable(), 0);
      } else if (changes['isOpen']) {
        // Create Mode (Only reset if opening new)
        this.clientForm.reset();
        this.clientForm.get('document')?.enable();
      }
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.clientForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.clientForm.get(field);
    if (!control || !control.errors) return '';

    if (control.hasError('serverError')) return control.getError('serverError');
    if (control.hasError('required')) return 'Campo obrigatório.';
    if (control.hasError('email')) return 'Email inválido.';
    if (control.hasError('minlength')) return `Mínimo de ${control.getError('minlength').requiredLength} caracteres.`;
    if (control.hasError('invalidCnpj')) return 'CNPJ inválido.';

    return 'Campo inválido.';
  }

  save() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const dto = this.clientForm.value;

    const request$ = this.client ?
      this.clientService.updateClient(this.client.id, dto) :
      this.clientService.createClient(dto);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Dados salvos com sucesso.',
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
            const control = this.clientForm.get(key);
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
