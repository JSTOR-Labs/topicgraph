import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LocalStorageService, ReferrerService } from './index';
import { SimpleMenuComponent } from './components/simple-menu/simple-menu.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule
    ],
    declarations: [
        SimpleMenuComponent
    ],
    exports: [
        SimpleMenuComponent
    ],
    providers: [
        { provide: 'LocalStorageService', useClass: LocalStorageService },
        { provide: 'ReferrerService', useClass: ReferrerService },
    ]
})
export class SharedModule { }
