import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { views } from './app-nav-views';
import { MOBILE } from './services/constants';

import { LabsAuthService } from './modules/auth/services/labs-auth.service';

@Component({
    selector: 'my-app',
    styleUrls: ['./app.component.css'],
    templateUrl: './app.component.html'
})
export class AppComponent {
    showMonitor = (ENV === 'development' && !AOT &&
        ['monitor', 'both'].includes(STORE_DEV_TOOLS) // set in constants.js file in project root
    );
    mobile = MOBILE;
    sideNavMode = MOBILE ? 'over' : 'side';
    views = views;

    constructor(
        public route: ActivatedRoute,
        labsAuthService: LabsAuthService,
        public router: Router
    ) {}

    activateEvent(event) {
        if (ENV === 'development') {
            console.log('Activate Event:', event);
        }
    }

    deactivateEvent(event) {
        if (ENV === 'development') {
            console.log('Deactivate Event', event);
        }
    }
}
