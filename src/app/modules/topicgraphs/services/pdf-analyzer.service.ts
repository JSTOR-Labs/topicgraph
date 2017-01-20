import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { LabsAuthService } from '../../auth/services/labs-auth.service';
import { API_BASE_URL, SERVICES_HOST, TOPIC_MODEL } from '../../../services/constants';

@Injectable()
export class PdfAnalyzerService {

    constructor(private _http: Http,
                private authService: LabsAuthService) {}

    /** 
     * Submit a PDF for off-line analysis.  An email notification is generated when the document
     * processing is complete. 
     */
    submit(dataUrl: string, notificationEmail: string) {
        if (dataUrl.slice(0, 28) === 'data:application/pdf;base64,') {
            let data = { pdfAsBase64: dataUrl,
                         notify: notificationEmail,
                         model: TOPIC_MODEL,
                         refresh: true };
            if (API_BASE_URL === 'http://localhost:8000' && SERVICES_HOST) {
                data['servicesHost'] = SERVICES_HOST;
            }
            return this.authService.authenticate()
                .switchMap((session: any) =>
                    this._http.post(API_BASE_URL + '/api/pdfanalyzer/',
                                    JSON.stringify(data),
                                    { headers: new Headers({'Content-Type': 'application/json',
                                                            'Authorization': 'JWT ' + session.token }) })
            )
            .map((response: any) => response.json());
        } else {
            return this.authService.authenticate()
                .switchMap((session: any) =>
                    this._http.get(API_BASE_URL + '/api/pdfanalyzer/?url='+encodeURIComponent(dataUrl),
                                  { headers: new Headers({ 'Authorization': 'JWT '+session.token }) })
            )
            .map((response: any) => response.json());
        }
    }

}
