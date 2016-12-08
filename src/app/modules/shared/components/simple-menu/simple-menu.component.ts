import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../reducers/';

@Component({
    selector: 'simple-menu',
    templateUrl: './simple-menu.component.html',
    styleUrls: ['./simple-menu.component.css']
})
export class SimpleMenuComponent implements OnInit {

    session: Observable<any>;
    path: Observable<string>;

    constructor(public router: Router,
                public store: Store<AppState>) {}

    ngOnInit() {
        this.session = this.store.select(state => state.session);
        this.path = this.store.select(state => state.router.path);
    }
}
