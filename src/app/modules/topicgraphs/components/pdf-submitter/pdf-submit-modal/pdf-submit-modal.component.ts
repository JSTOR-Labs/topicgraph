import { Component, ViewChild, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'pdf-submit-modal',
    templateUrl: 'pdf-submit-modal.component.html',
    styleUrls: ['pdf-submit-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfSubmitModalComponent implements OnInit {

    @ViewChild('submitModal') submitModal: any;
    @Output('onHide') onHide = new EventEmitter();
    notificationEmail: string;
    rightsAgree: boolean = false;
    tcAgree: boolean = false;

    show() {
        this.submitModal.config.backdrop = false;
        this.submitModal.show();
    }

    hide() {
        this.submitModal.hide();
    }

    submit() {
        this.onHide.emit(this.notificationEmail);
    }

    ngOnInit() {
        this.hide();
    }

}
