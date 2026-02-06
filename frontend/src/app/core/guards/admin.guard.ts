import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated() && authService.hasRole('ADMIN')) {
        return true;
    }

    Swal.fire({
        icon: 'warning',
        title: 'Acesso Negado',
        text: 'Você não tem permissão para acessar esta página.',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });

    router.navigate(['/dashboard']);
    return false;
};
