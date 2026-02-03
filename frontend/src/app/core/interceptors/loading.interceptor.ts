import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loadingService = inject(LoadingService);

    // Option: Skip loading for specific requests using context if needed
    loadingService.show();

    return next(req).pipe(
        finalize(() => loadingService.hide())
    );
};
