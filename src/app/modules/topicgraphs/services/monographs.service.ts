import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Store } from '@ngrx/store';
import { LabsAuthService } from '../../auth/services/labs-auth.service';
import { AppState, TOPICGRAPHS_ACTIONS } from '../../../reducers/';
import { API_BASE_URL } from '../../../services/constants';
import { monographsSearchResultsToDocs } from '../';

const fields = 'id,author,discipline,doi,num_pages,published_date,publisher,segment_levels,stable_url,submitted_by,subtitle,source_docs,thumbnail_lg,title,visdata';
// const fields = 'id,author,discipline,doi,num_pages,published_date,publisher,submitted_by,subtitle,thumbnail_lg,title';

let filteredWords: string[] = `a aaa able aboard about above acad across ad after again against al all almost along already also although always am
amid among an and another anti any anything apr are area around as at aug
b based be because been before began behind being below beneath beside besides between beyond biol both bmj but by
c cal came can cant ch clearly co com come comes con concerning considering could
d de dec der del des despite did didnt different dis do does doi done dont down during
e each earlier early economic ed edu effect effects either else en ence et etc even ever every except excepting excluding
f fact feb few fig figure finally first following for form found four from fully further
g generally get give given go going gov good got great group groups
h had has have havent having he hence her here herself him himself his history how however html http
i ii iii iiii iiiii iv ix ibid ie if important in inasmuch indeed ing inside inter into is it its ity
j jan jour journ journal jstor jul jun just
k
l la large late later le least les less let level like los
m made make many mar may me ment ments mere merely might minus more moreover most mr mrs much must my
n natl near neither never new no non nor not note nov now
o oct of off often on one only onto or order org other otherwise ought our out outside over own
p par part past per phys pre press pro proc plus possible pp pnas
q
r rather re really regarding research result results review right
s said same san save say says sci second section see sep sept set several shall she should similar since sion small so social
society some something sometimes still such
t take terms than that the their them then there therefore these they thing things this those three think
though through thus tion tions tional tive to too tor total toward towards ture two type
u und under underneath university unlike until up upon us usa use
v vi vii viii value values various versus very via view vol von volume
w want was way we well went were what when where whereas whether which whichever while who will with within
without wont would www
x
y year yes yet you your york
z`.split(' ');

@Injectable()
export class MonographsService {

    query: string;
    offset: number;

    constructor(private _http: Http,
                private authService: LabsAuthService,
                private store: Store<AppState>) {

        this.store.select(state => state.topicgraphs)
            .filter(monographsState => monographsState.loading)
            .do(monographsState => {
                this.query = monographsState.query;
                this.offset = monographsState.offset;
            })
            .switchMap(monographsState => this.select())
            .subscribe((results: any) => {
                results.docs = monographsSearchResultsToDocs(this, results.docs);
                this.store.dispatch({type: TOPICGRAPHS_ACTIONS.MONOGRAPHS_SEARCH_COMPLETE,
                                     payload: results});
            });
        this.store.dispatch({type: TOPICGRAPHS_ACTIONS.SEARCH_MONOGRAPHS});
    }

    select() {
        let url = API_BASE_URL + '/api/monographs/?format=json&submitted_by=jstorlabs&level=0&status=complete&fields=' + fields + '&limit=100';
        // console.log('MonographsService.select', url);
        return this.authService.authenticate()
            .switchMap((session: any) =>
                this._http.get(url,
                               { headers: new Headers({ 'Authorization': 'JWT ' + session.token })})
            )
            .map((response: any) => response.json())
            // .do(searchResults => console.log(searchResults))
            ;
    }

    getVisualizationData(docid: string, segmentLevel?: number) {
        console.log('getVisualizationData', docid, segmentLevel);
        let url = API_BASE_URL + '/api/monographs/?docid=' + docid + '&fields=level,source_docs,fpage,lpage,segment,summary,visdata&sort=segment%20asc&limit=512';
        if (segmentLevel) {
            url += '&level=(0 OR ' + segmentLevel + ')';
        }
        return this.authService.authenticate()
            .switchMap((session: any) =>
                this._http.get(url,
                               { headers: new Headers({ 'Authorization': 'JWT ' + session.token })}
                )
                .map((response: any) => response.json().docs)
            );
    }

    getWordCoords(docid: string) {
        let url = API_BASE_URL + '/api/monographs/?id=' + docid + '&fields=coord_ocr';
        return this.authService.authenticate()
            .switchMap((session: any) =>
                this._http.get(url,
                               { headers: new Headers({ 'Authorization': 'JWT ' + session.token })}
                )
                .map((response: any) => response.json().docs)
            );
    }

    getTopicWords(topic: string) {
        let url = API_BASE_URL + '/api/monographs/?id=' + topic + '&fields=data';
        return this.authService.authenticate()
            .switchMap((session: any) =>
                this._http.get(url,
                               { headers: new Headers({ 'Authorization': 'JWT ' + session.token })}
                )
                .map((response: any) => response.json().docs)
                .map(docs => {
                    let words: string[] = [];
                    if (docs && docs.length === 1) {
                        docs[0].data.split(' ').forEach(function(word:string){
                            if (filteredWords.indexOf(word) === -1) {
                                words.push(word);
                            }
                        });
                    }
                    return words;
                })
            );
    }

}
