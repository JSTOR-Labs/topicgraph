import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, isUserAuthenticated } from '../../reducers/';
import { LabsAuthService } from './services/labs-auth.service';

@Component({
    selector: 'myjstor-logout',
    templateUrl: 'auth-logout.component.html',
    styleUrls: ['auth.component.css']
})

export class LabsAuthLogoutComponent implements OnInit, OnDestroy {
    private logoutSub: any;
    constructor(public router: Router,
                public store: Store<AppState>,
                public labsAuthService: LabsAuthService) {}

    ngOnInit() {
        this.logoutSub = this.store.map(state => state.session)
            .filter((session: any) => !isUserAuthenticated(session))
            .switchMap(session => this.store.select(s => s.ui.priorPath))
            .filter(priorPath => (priorPath !== '/logout') && (priorPath !== '/login'))
            .first()
            .subscribe(priorPath => {
                console.log('logout, nagivate to:', priorPath);
                this.router.navigate([priorPath], { queryParams: {} });
            })
            ;
        this.labsAuthService.doLogout();
    }

    ngOnDestroy() {
        if (this.logoutSub) { this.logoutSub.unsubscribe(); }
    }

}
