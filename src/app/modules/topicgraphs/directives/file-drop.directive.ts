import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({ selector: '[fileDrop]' })
export class FileDropDirective {
    @Output() public fileOver: EventEmitter<any> = new EventEmitter();
    @Output() public onFileDrop: EventEmitter<any> = new EventEmitter();

    @HostListener('drop', ['$event'])
    public onDrop(event: any): void {
        this.onFileDrop.emit(true);
        this.fileOver.emit(false);
    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event: any): void {
        this.fileOver.emit(true);
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: any): any {
        this.fileOver.emit(false);
    }
}
