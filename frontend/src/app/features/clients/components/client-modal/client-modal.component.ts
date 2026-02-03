import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientsService } from '../../services/clients.service';
import { Client } from '../../models/client.model';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
                  <label class="form-label">Nome</label>
                  <input type="text" class="form-control" formControlName="name" 
                         [class.is-invalid]="isFieldInvalid('name')">
                  <div class="invalid-feedback">Nome é obrigatório.</div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" formControlName="email"
                         [class.is-invalid]="isFieldInvalid('email')">
                  <div class="invalid-feedback">Email inválido.</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Telefone</label>
                  <input type="text" class="form-control" formControlName="phone">
                </div>

                <div class="mb-3">
                  <label class="form-label">CPF</label>
                  <input type="text" class="form-control" formControlName="cpf">
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
  private authService = inject(AuthService); // Inject Auth

  private clientService = inject(ClientsService);

  clientForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    cpf: ['']
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['client'] && this.client) {
      this.clientForm.patchValue(this.client);
    } else if (changes['isOpen'] && this.isOpen && !this.client) {
      this.clientForm.reset();
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.clientForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  save() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const formValue = this.clientForm.value;
    const user = this.authService.currentUser();

    if (!user && !this.client) {
      Swal.fire('Erro', 'Usuário não autenticado.', 'error');
      return;
    }

    const dto = {
      ...formValue,
      createdById: user?.sub // Add ID
    };

    // Remove createdById if updating (Backend handles it, or ignores)
    if (this.client) {
      delete dto.createdById;
    }

    const request$ = this.client ?
      this.clientService.updateClient(this.client.id, formValue) : // Update excludes createdById usually
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
        Swal.fire('Erro', err.error?.message || 'Ocorreu um erro ao salvar.', 'error');
        console.error(err);
      }
    });
  }

  closeModal() {
    this.close.emit(false);
  }
}
