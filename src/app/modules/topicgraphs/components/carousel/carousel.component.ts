import { Component, Input, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

import 'owl.carousel';
import 'owl.carousel/dist/assets/owl.carousel.min.css';

@Component({
    selector: 'owl-carousel',
    template: `<ng-content></ng-content>`
})
export class CarouselComponent implements OnDestroy, AfterViewInit {

    @Input() options: any;
    $owlElement: any;
    defaultOptions: any = {
        responsive : {
            0 : { items : 2 },
            450 : { items : 2 },
            600 : { items : 3 },
            750 : { items : 4 },
            900 : { items : 5 },
            1050 : { items : 6, margin: 5 },
            1200 : { items : 7}
        },
        nav : true,
        navText : [
            '<img class="left-arrow" src="assets/Icon - Prev_Next.svg" style="position: absolute;">',
            '<img class="right-arrow" src="assets/Icon - Prev_Next.svg" style="position: absolute;">']
    };

    constructor(private el: ElementRef) {}

    ngAfterViewInit() {
        for (var key in this.options) {
            this.defaultOptions[key] = this.options[key];
        }
        this.$owlElement = (<any>$(this.el.nativeElement)).owlCarousel(this.defaultOptions);
    }

    ngOnDestroy() {
        this.$owlElement.data('owl.carousel').destroy();
        this.$owlElement = null;
    }
}
