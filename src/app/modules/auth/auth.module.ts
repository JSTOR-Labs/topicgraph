import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { LabsAuthService } from './services/labs-auth.service';
import { LabsAuthLoginComponent } from './auth-login.component';
import { LabsAuthLogoutComponent } from './auth-logout.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule
    ],
    declarations: [
        LabsAuthLoginComponent,
        LabsAuthLogoutComponent
    ],
    providers: [
        LabsAuthService,
    ],
    exports: [
        LabsAuthLoginComponent,
        LabsAuthLogoutComponent        
    ]
})
export class AuthModule { }
