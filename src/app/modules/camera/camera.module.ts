import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraService } from './services/camera.service';
import { CameraComponent } from './components/camera/camera.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        CameraComponent
    ],
    providers: [
        CameraService,
    ],
    exports: [
        CameraComponent
    ]

})
export class CameraModule { }
