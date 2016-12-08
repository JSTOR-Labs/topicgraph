import { Injectable } from '@angular/core';
import { CameraOptions } from '../';

@Injectable()
export class CameraService {

    public takePicture(options?:CameraOptions) : Promise<any> {
        return new Promise<any>((resolve, reject) => {resolve('TODO'); });
    }

}
