import { Injectable, Inject } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/Rx';  // this imports the rxjs operators
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Store } from '@ngrx/store';
import { JwtHelper } from '../utils/';
import { User } from '../models/';
import { LocalStorage } from '../../shared/';
import { API_BASE_URL } from '../../../services/constants';

import { AppState, SESSION_ACTIONS, isUserAuthenticated, isValidSession } from '../../../reducers/';

@Injectable()
export class LabsAuthService {

    tokenName: string = 'jwt';
    _session: any;

    jwtHelper: JwtHelper = new JwtHelper();

    constructor(public http: Http,
                @Inject('LocalStorageService') public storageService: LocalStorage,
                public store: Store<AppState>) {

            this.store.select(s => s.session).subscribe(session => this._session = session);

            this.store.select(s => s.ui.context)
            .filter(context => context === 'browser').take(1)
            .switchMap(context =>
                this.authenticate())
                .subscribe((session: any) => {
                    if (!isUserAuthenticated(session) &&
                        this.storageService.get('username') !== undefined &&
                        this.storageService.get('password') !== undefined && this.storageService.get('password') !== null) {
                            this.doLogin(this.storageService.get('username'), this.storageService.get('password')).subscribe();
                    }
                });
        }

    public doLogout() {
        this.store.dispatch({type: SESSION_ACTIONS.CLEAR_USER});
        this.storageService.remove('password');
    }

    get session() { return this._session; }

    isUserAuthenticated() {
        return this.session.isUserAuthenticated();
    }

    public authenticate() {
            return isValidSession(this.session)
                ? new BehaviorSubject<any>(this.session)
                : this._authenticate();
        }

    public doLogin(login: string, password: string) {
            return this._authenticate(login, password);
        }

    private _authenticate(login?: string, password?: string) {
            return this.getCsrfToken().switchMap((csrfToken: string) => {
                let url = API_BASE_URL + '/authenticate/';
                let body = 'csrfmiddlewaretoken=' + encodeURIComponent(csrfToken);
                if (login && password !== null) {
                    body += '&login=' + login + '&password=' + encodeURIComponent(password);
                }
                return this.http.post(url, body,
                    {
                        headers: new Headers({
                            'X-CSRFToken': csrfToken,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }),
                        withCredentials: true
                    })
                    .map(resp => resp.json())
                    .map(respData => {
                        let jwtPayload = this.jwtHelper.decodeToken(respData.token);
                        let session = {
                            sessionId: jwtPayload.sessionid,
                            token: respData.token,
                            user: null,
                            institutions: jwtPayload.institutions,
                            entitlements: jwtPayload.entitlements,
                            tokenExpires: this.jwtHelper.getTokenExpirationDate(respData.token),
                            ipaddr: jwtPayload.ipaddr,
                        };

                        if (jwtPayload.userid) {
                            session.user = new User();
                            session.user.userid = jwtPayload.userid;
                            session.user.username = jwtPayload.username;
                            session.user.email = jwtPayload.email;
                            session.user.firstName = jwtPayload.first_name;
                            session.user.lastName = jwtPayload.last_name;
                            session.user.labsAdmin = jwtPayload.labs_admin;
                            session.user.labsGroups = jwtPayload.labs_groups;
                            this.storageService.set('username', login);
                            if (session.user.keepLoggedIn) {
                                this.storageService.set('password', password);
                            }
                        }
                        this.store.dispatch({type: SESSION_ACTIONS.SET_SESSION, payload: session});
                        if (login && !isUserAuthenticated(session)) {
                            throw new Error(respData.login_status);
                        }
                        return session;
                    });
            });
        }

    private getCsrfToken() {
            let url = API_BASE_URL + '/csrf/';
            return this.http.get(url, { withCredentials: true })
                .map((resp: any) => resp.json()).map(resp => resp.token);
        }

    }
