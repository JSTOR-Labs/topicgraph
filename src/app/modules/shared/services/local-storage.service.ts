import { Injectable } from '@angular/core';
import { LocalStorage } from '../interfaces/';
import { isBrowser } from 'angular2-universal';

@Injectable()
export class LocalStorageService implements LocalStorage {

    store: any = {};

    public get(key: string): string { return this.store[key]; } 
    public set(key: string, value: string) { this.store[key] = value; }
    public remove(key: string) { delete this.store[key]; }
    
    
    /* emporarily disabled as the use of localStorage breaks AOT compilation
    public get(key: string): string {
        return isBrowser ? localStorage.getItem(key) : this.store[key];
    }

    public set(key: string, value: string) {
        if (isBrowser) {
            localStorage.setItem(key, value);
        } else {
            this.store[key] = value;
        }
    }

    public remove(key: string) {
        if (isBrowser) {
            localStorage.removeItem(key);
        } else {
            delete this.store[key];
        }
    }
    */

}
