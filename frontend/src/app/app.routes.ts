import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ClientListComponent } from './features/clients/components/client-list/client-list.component';
import { ProductListComponent } from './features/products/components/product-list/product-list.component';
import { OrderListComponent } from './features/orders/components/order-list/order-list.component';

import { MainLayoutComponent } from './core/layout/main-layout.component';
import { UserListComponent } from './features/users/components/user-list/user-list.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'clients', component: ClientListComponent },
            { path: 'products', component: ProductListComponent },
            { path: 'orders', component: OrderListComponent },
            { path: 'users', component: UserListComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
