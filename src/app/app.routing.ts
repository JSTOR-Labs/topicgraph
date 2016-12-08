/* tslint:disable: max-line-length */
import { Routes } from '@angular/router';

import { NotFound404Component } from './not-found404.component';
import { LabsAuthLoginComponent } from './modules/auth/auth-login.component';
import { LabsAuthLogoutComponent } from './modules/auth/auth-logout.component';

export const routes: Routes = [
  { path: '', loadChildren: './modules/topicgraphs/topicgraphs.module#TopicgraphsModule'},
  { path: 'login', component: LabsAuthLoginComponent, pathMatch: 'prefix' },
  { path: 'logout', component: LabsAuthLogoutComponent, pathMatch: 'prefix' },
  { path: '**', component: NotFound404Component }
];
