import { Routes } from '@angular/router';
import { LabsAuthLoginComponent } from './auth-login.component';
// import { LabsAuthLogoutComponent } from './auth-logout.component';

export const LabsAuthRoutes: Routes = [
  {
    path: 'login',
    component: LabsAuthLoginComponent,
    data: {includeInSideMenu: false, includeInNavbar: false, menuLabel: 'Login'}
  },
  {
    path: 'logout',
    // component: LabsAuthLogoutComponent,
    data: {includeInSideMenu: true, includeInNavbar: true, menuLabel: 'Logout'}
  },
];
