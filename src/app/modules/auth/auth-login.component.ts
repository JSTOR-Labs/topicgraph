import { Component, OnDestroy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Store } from '@ngrx/store';
import { LocalStorage } from '../shared/';
import { LabsAuthService } from './services/labs-auth.service';
import { AppState } from '../../reducers/';

@Component({
    selector: 'myjstor-login',
    templateUrl: 'auth-login.component.html',
    styleUrls: ['auth.component.css'],
})
export class LabsAuthLoginComponent implements OnDestroy {

    save: boolean = true;
    loginForm: any;
    email: string;
    password: string;
    messages = new Subject<string[]>();
    isAuthenticating = false;

    private loginSub: any;

    constructor(public store: Store<AppState>,
                public router: Router,
                public labsAuthService: LabsAuthService,
                @Inject('LocalStorageService') public storageService: LocalStorage) {

        this.loginForm = {login: this.storageService.get('username'), password: this.storageService.get('password')};
    }

    ngOnDestroy() {
        if (this.loginSub) { this.loginSub.unsubscribe(); }
    }

    login(event: any) {
        this.isAuthenticating = true;
        this.messages.next([]);
        if (event) {
          event.preventDefault();
        }
        // this.store.dispatch({type: UI_ACTIONS.SET_BUSY, payload: 'Logging in to MyJstor account'});


        this.loginSub = this.labsAuthService.doLogin(this.loginForm.login, this.loginForm.password)
            .switchMap(authToken => this.store.select(s => s.ui.priorPath))
            .filter(priorPath => priorPath !== '/login')
            .take(1)
            .subscribe(
                priorPath => {
                    this.isAuthenticating = false;
                    this.router.navigate([priorPath], { queryParams: {} });
                },
                error => {
                    this.isAuthenticating = false;
                    // this.store.dispatch({type: UI_ACTIONS.CLEAR_BUSY});
                    this.messages.next([error]);
                },
                () => {
                    // this.store.dispatch({type: UI_ACTIONS.CLEAR_BUSY});
                    this.isAuthenticating = false;
                }
            );
    }

    register(event: any) {
        if (event) {
          event.preventDefault();
        }
        this.router.navigateByUrl('/register');
    }

}
