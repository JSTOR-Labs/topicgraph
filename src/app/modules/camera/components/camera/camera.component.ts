import { Component, ViewChild, AfterViewInit, Renderer, Output, EventEmitter, Attribute } from '@angular/core';
import { ExifRestorer } from './exif';
import { CameraService } from '../../services/camera.service';

@Component({
    selector: 'camera',
    templateUrl: 'camera.component.html',
    styleUrls: ['camera.component.css']
})
export class CameraComponent implements AfterViewInit {
    exifRestorer = new ExifRestorer();
    @ViewChild('cameraInput') cameraInput: any;
    @ViewChild('scratchCanvas') scratchCanvas: any;
    listenFunc: Function;
    @Output('photoSelected') photoSelected = new EventEmitter<any>();
    canvasSize: number = 1000;
    maxImageSize: number = 500000;

    constructor(@Attribute('maxSize') maxImageSize: any,
                public renderer: Renderer,
                private _cameraService: CameraService) {
        this.maxImageSize = parseInt(maxImageSize || this.maxImageSize);
    }

    takePhoto(e?: any) {
        this.renderer.invokeElementMethod(this.cameraInput.nativeElement, 'click');
    }

    ngAfterViewInit() {
        this.listenFunc = this.renderer.listen(this.cameraInput.nativeElement, 'change', (event: any) => {
            if (event.target.files.length > 0) { this.photoSelected.emit(this.setPicture(event.target.files)); }
        });
    }

    // Calculate scale factor
    calcXFactor(memImg: any) {
        if (memImg.width < this.canvasSize && memImg.height < this.canvasSize) { return 1; };
        return memImg.width > memImg.height ? this.canvasSize / memImg.width : this.canvasSize / memImg.height;
    };

    // Convert selected file for upload to some data URL
    // which we can set to src of any image tag
    setPicture(files: any[]) {
        // if (files.length === 1 && files[0].type.indexOf('image/') === 0) return null;

        let memImg = new Image();
        // Promise for temp. memory image for resizing
        let memImgDefer = new Promise<any>((resolve, reject) => {
            let self = this;
            memImg.onload = function () {
                let imgCanvas = document.createElement('canvas'),
                    imgContext = imgCanvas.getContext('2d');

                // Make sure canvas is as big as the picture
                let xfactor = self.calcXFactor(memImg);
                imgCanvas.width = (this.width * xfactor) >> 0;
                imgCanvas.height = (this.height * xfactor) >> 0;

                // Draw image into canvas element
                imgContext.drawImage(this, 0, 0, imgCanvas.width, imgCanvas.height);

                let quality = 1.0;
                let targetImage = imgCanvas.toDataURL('image/jpeg', quality);
                while ((targetImage.length > self.maxImageSize) && quality >= 0.5) {
                    quality -= 0.05;
                    targetImage = imgCanvas.toDataURL('image/jpeg', quality);
                }
                // Send the resized image as promised
                resolve(targetImage);
                memImg = null;
                imgCanvas = null;
                imgContext = null;
            };
        });

        // Promise for file reader to read the original file data
        let binaryReaderDefer = new Promise<any>((resolve, reject) => {
            let binaryReader = new FileReader();
            binaryReader.onloadend = function (e: ProgressEvent) {
                let fileReader: FileReader = <FileReader>e.target;
                resolve(fileReader.result);
            };
            binaryReader.readAsDataURL(files[0]);
        });

        // noinspection JSUnresolvedFunction
        memImg.src = URL.createObjectURL(files[0]);

        // Promise for final image url to display and send to server
        let deferredImgSrc = new Promise<any>((resolve, reject) => {
            let self = this;
            Promise.all([binaryReaderDefer, memImgDefer]).then(function (images) {
                let sourceImage = images[0];
                let targetImage = images[1];
                // Copy exif data
                self.exifRestorer.restore(sourceImage, targetImage);
                resolve(targetImage);
            });
        });
        return deferredImgSrc;
    };

}
