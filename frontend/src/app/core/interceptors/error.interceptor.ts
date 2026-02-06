import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { ErrorHandlerService } from '../services/error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const errorHandler = inject(ErrorHandlerService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'Ocorreu um erro inesperado.';
            let errorTitle = 'Erro';

            // Use the service to extract the message if possible
            const extractedMessage = errorHandler.getErrorMessage(error);
            if (extractedMessage) {
                errorMessage = extractedMessage;
            }

            // Handle specific status codes
            switch (error.status) {
                case 400:
                    errorTitle = 'Dados Inválidos';
                    // For 400, sometimes we have specific field errors shown in the form, 
                    // but we can still show a toast or alert if it's a general bad request.
                    // If the component handles it (e.g., forms), they might want to suppress this.
                    // For now, let's show it only if it's not a validation error caught by the form.
                    break;
                case 401:
                    errorTitle = 'Não Autorizado';
                    errorMessage = 'Sua sessão expirou ou você não tem permissão. Faça login novamente.';
                    break;
                case 403:
                    errorTitle = 'Acesso Negado';
                    errorMessage = 'Você não tem permissão para realizar esta ação.';
                    break;
                case 404:
                    errorTitle = 'Não Encontrado';
                    errorMessage = 'O recurso solicitado não foi encontrado.';
                    break;
                case 500:
                case 502:
                case 503:
                    errorTitle = 'Erro no Servidor';
                    errorMessage = 'Ocorreu um problema no servidor. Tente novamente mais tarde.';
                    break;
            }

            // We can use a Toast for less intrusive errors or a Modal for critical ones.
            // Let's use a Toast for validation/auth and Modal for Server errors?
            // For simplicity/standardization, let's use the layout style user likely prefers (Toast).

            const isServerSide = error.status >= 500;

            if (error.status !== 0) { // Ignore cancelled requests
                Swal.fire({
                    icon: 'error',
                    title: errorTitle,
                    text: errorMessage,
                    toast: !isServerSide,
                    position: isServerSide ? 'center' : 'top-end',
                    showConfirmButton: isServerSide,
                    timer: isServerSide ? undefined : 4000,
                    timerProgressBar: !isServerSide
                });
            }

            return throwError(() => error);
        })
    );
};
