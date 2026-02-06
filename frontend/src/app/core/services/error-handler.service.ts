
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {

    getErrorMessage(error: any): string {
        if (error.error?.message) {
            return error.error.message;
        }
        if (typeof error.error === 'string') {
            return error.error;
        }
        if (error.message) {
            return error.message;
        }
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }

    getFieldErrors(error: any): Record<string, string> {
        if (error.error?.errors) {
            return error.error.errors;
        }
        return {};
    }
}
