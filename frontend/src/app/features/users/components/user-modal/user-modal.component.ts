import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-user-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    @if (isOpen) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">{{ user ? 'Editar Permissão' : 'Novo Usuário' }}</h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="userForm">
                
                @if (!user) {
                  <div class="mb-3">
                    <label class="form-label">Nome</label>
                    <input type="text" class="form-control" formControlName="name" [class.is-invalid]="isFieldInvalid('name')">
                    <div class="invalid-feedback">Nome é obrigatório.</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" formControlName="email" [class.is-invalid]="isFieldInvalid('email')">
                    <div class="invalid-feedback">Email inválido.</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Senha</label>
                    <input type="password" class="form-control" formControlName="password" [class.is-invalid]="isFieldInvalid('password')">
                     <div class="invalid-feedback">Senha é obrigatória (min 6 carac).</div>
                  </div>
                } @else {
                  <p class="text-muted">Editando permissões para: <strong>{{ user.name }}</strong></p>
                }

                <div class="mb-3">
                  <label class="form-label">Permissão (Role)</label>
                  <select class="form-select" formControlName="role">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

              </form>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="button" class="btn btn-primary" (click)="save()" [disabled]="userForm.invalid">
                <i class="bi bi-save me-1"></i> Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class UserModalComponent implements OnChanges {
    @Input() user: User | null = null;
    @Input() isOpen = false;
    @Output() close = new EventEmitter<boolean>();

    private fb = inject(FormBuilder);
    private usersService = inject(UsersService);

    userForm: FormGroup = this.fb.group({
        name: [''],
        email: [''],
        password: [''],
        role: ['USER', Validators.required]
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isOpen'] && this.isOpen) {
            this.userForm.reset({ role: 'USER' });

            if (this.user) {
                // Edit Mode: Only Role is editable (and relevant in this impl)
                this.userForm.patchValue({ role: this.user.role });
                this.userForm.get('name')?.clearValidators();
                this.userForm.get('email')?.clearValidators();
                this.userForm.get('password')?.clearValidators();
            } else {
                // Create Mode: All required
                this.userForm.get('name')?.setValidators(Validators.required);
                this.userForm.get('email')?.setValidators([Validators.required, Validators.email]);
                this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            }
            this.userForm.updateValueAndValidity();
        }
    }

    isFieldInvalid(field: string): boolean {
        const control = this.userForm.get(field);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    save() {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }

        const val = this.userForm.value;
        let request$;

        if (this.user) {
            request$ = this.usersService.updateRole(this.user.id, val.role);
        } else {
            request$ = this.usersService.createUser(val);
        }

        request$.subscribe({
            next: () => {
                Swal.fire('Sucesso!', 'Dados salvos.', 'success');
                this.close.emit(true);
            },
            error: (err) => {
                const msg = err.error?.message || 'Erro ao salvar.';
                Swal.fire('Erro', msg, 'error');
            }
        });
    }

    closeModal() {
        this.close.emit(false);
    }
}
