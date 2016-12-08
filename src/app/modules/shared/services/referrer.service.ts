import { Injectable } from '@angular/core';
import { Referrer } from '../interfaces/';

@Injectable()
export class ReferrerService implements Referrer {
    private _referrer: any = null;
    constructor() { this._referrer = document.referrer; }
    get referrer() { return this._referrer; }
    set referrer(val: any) { this._referrer = val; }

}
