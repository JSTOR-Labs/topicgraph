import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, AfterViewChecked, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import 'rxjs/Rx';  // this imports the rxjs operators
import { AppState, TOPICGRAPHS_ACTIONS } from '../../../../reducers/';
import { MonographsService } from '../../services/monographs.service';
import { Http } from '@angular/http';
import { IMonograph } from '../../models/';
//import {JSONP_PROVIDERS} from 'angular2/http'

@Component({
    selector: 'topicgraphs-viewer',
    templateUrl: 'topicgraphs-viewer.component.html',
    styleUrls: ['topicgraphs-viewer.component.css'],
    changeDetection: ChangeDetectionStrategy.Default,
    host: {
        '(window:scroll)': 'updateHeader($event)'
    }
})

export class TopicgraphsViewerComponent implements OnInit, OnDestroy, AfterViewChecked {
    monograph: Observable<any>;
    selectedMonographSub: any;
    uiStateSub: any;
    visdata: Observable<any[]>;
    citationJSON:  Observable<any>;
    activeTab:number = 0;
    @ViewChild('pdfViewer') pdfViewer: any;

    monographId: string;
    page: number = 1;
    zoom: number = 1.0;
    originalSize: boolean = false;
    showAll: boolean = false;
    pdf: any;
    numPages: number = 0;
    author: string[];
    title: string;
    publisher: string;
    pubYear: Number = 0;

    topicMapOrientationIsVertical: boolean = false;

    pdfViewerDimensions: any;
    wordCoords: any;
    highlights: any[];
    showHighlights: boolean = true;
    selectedTopic: string;
    selectedTopicNum: number = 1;

    isScrolled = false;
    currPos: Number = 0;
    startPos: Number = 0;
    changePos: Number = 100;
    pdfViewerSize: string = 'medium'; // small, medium, large
    enlarged: boolean = false;

    public pdfIsLoading = true;

    topicGraphTooltip:string = 'The Topic Graphic shows what topics are covered in this book and where.  Click on the graphic to jump to a page that discusses a topic you’re interested in.';

    constructor(public router: Router,
                public store: Store<AppState>,
                private activatedRoute: ActivatedRoute,
                private monographsService: MonographsService,
                private http: Http) {}

    tabSelected(idx:number) {
        this.activeTab = idx;
    }

    onLoadComplete = (pdf:any) => {
        this.pdfIsLoading = false;
    }

    incrementPage(amount: number) {
        this.gotoPage(this.page + amount);
    }

    gotoPage(newPage: number) {
        if (newPage > 0 && newPage <= this.numPages) {
            this.store.dispatch({type: TOPICGRAPHS_ACTIONS.SET_PDF_PAGE, payload: newPage});
       }
    }

    /*togglePDFsize() {
        if (this.pdfViewerSize == 'medium'){
            this.pdfViewerSize = 'large';
            this.enlarged = true;
        } else {
            this.pdfViewerSize = 'medium';
            this.enlarged = false;
        }
    }*/

    /*pdfViewerSizeChange(event:any) {
        this.updatePdfViewerDimensions();
        this.updatePage(0); // used to force a page refresh
    }*/

    updatePage(pageNum: number) {
        this.highlights = [];
        if (pageNum === 0) {
            pageNum = this.page;
            this.page = 0;
        } else {
            this.page = pageNum;
        }
        if (this.showHighlights && this.selectedTopic && this.wordCoords && this.wordCoords[pageNum] && this.pdfViewerDimensions) {
            let topic_key:string = this.selectedTopic.toLowerCase().replace(' ','_');
            this.monographsService.getTopicWords(topic_key).subscribe(words => {
                this.wordCoords[pageNum].forEach(function(rec:string){
                    let fields:string[] = rec.split(',');
                    if (fields.length >= 8) {
                        let lemma = fields[1];
                        let text = fields[2];
                        if (words.indexOf(lemma) >= 0) {
                            let ratio:number, xmin:number, xmax:number, ymin:number, ymax:number = 0.0;
                            if (fields.length === 8) {
                                ratio = parseFloat(fields[3]);
                                console.log('source',ratio);
                                xmin = parseFloat(fields[4]);
                                xmax = parseFloat(fields[5]);
                                ymin = parseFloat(fields[6]);
                                ymax = parseFloat(fields[7]);
                            } else if (fields.length === 9) {
                                let pageWidth = parseFloat(fields[3]);
                                let pageHeight = parseFloat(fields[4]);
                                ratio = pageWidth/pageHeight;
                                console.log('source',pageWidth,pageHeight,ratio);
                                xmin = parseFloat(fields[5]);
                                xmax = parseFloat(fields[6]);
                                ymin = parseFloat(fields[7]);
                                ymax = parseFloat(fields[8]);
                            }
                            let width = this.pdfViewerDimensions.offsetWidth;
                            let height = width / ratio;
                            let offsetLeft = this.pdfViewerDimensions.offsetLeft;
                            let offsetTop = this.pdfViewerDimensions.offsetTop;
                            let highlight: any = {
                                class: 'imageHighlight'+(this.selectedTopicNum % 10),
                                text: text,
                                coords: {
                                    top: (offsetTop+ymin*height)+'px',
                                    left: (offsetLeft+xmin*width)+'px',
                                    height: ((ymax-ymin)*height)+'px',
                                    width: ((xmax-xmin)*width)+'px'
                                }
                            };
                            this.highlights.push(highlight);
                        }
                    }
                }, this);
            });

        }
    }

    updateHeader(evt:any) {
        this.currPos = (window.pageYOffset || evt.target.scrollTop) - (evt.target.clientTop || 0);
        if(this.currPos >= this.changePos ) {
            this.isScrolled = true;
        } else {
            this.isScrolled = false;
        }
    }

    toggleTopicMapOrientation(event?:any) {
        this.store.dispatch({type: TOPICGRAPHS_ACTIONS.SET_TOPIC_MAP_ORIENTATION, 
                             payload: this.topicMapOrientationIsVertical ? 'horizontal' : 'vertical'});
    }

    toggleHighlighting(event?:any) {
        this.store.dispatch({type: TOPICGRAPHS_ACTIONS.SET_TOPIC_WORD_HIGHLIGHTING_ENABLED, payload: !this.showHighlights});
    }


    copyCitation(format:string) {
        let request = {
            'raw': 'true',
            'source': 'book',
            'style': format,
            'book': {
            },
            'pubtype': {
                'main': 'pubnonperiodical'
            },
            'pubnonperiodical': {
                'title': this.title,
                'publisher': this.publisher,
                'year': this.pubYear,
            },
            'contributors': [{
                'function': 'author',
                'first': 'Firstname',
                'middle': 'Middlename',
                'last': 'Lastname'
                }]
            };
       /* clipboard.copy({
  "text/plain": "Markup text. Paste me into a rich text editor.",
  "text/html": "<i>Markup</i> <b>text</b>. Paste me into a rich text editor."
});*/
        let book = encodeURI(JSON.stringify(request));
        let url = 'https://api.citation-api.com/rest/widget/site/labs.jstor.org?callback=EBUpdateCitation&cachebuster=' + Date.now() + '&data=' + book;
        // console.log(url);
        // this.http.get(url).subscribe(val => console.log("val", val));
    }

    ngOnInit() {

        this.uiStateSub = this.store.select(state => state.topicgraphs)
            .subscribe(uiState => {
                this.selectedTopic = uiState.topic;
                this.selectedTopicNum = uiState.topicNum;
                this.showHighlights = uiState.topicWordHighlightingEnabled;
                this.updatePage(uiState.pdfPage);
            });

        this.monograph = this.store.select(state => state.topicgraphs.selected)
            .filter(monograph => monograph !== null)
            .do(monograph => {
                this.monographId = monograph.id;
                this.numPages = monograph.numPages;
                this.author = monograph.author;
                this.title = monograph.title;
                this.publisher = monograph.publisher;
                this.pubYear = monograph.pubYear;
            });

        this.monograph.subscribe((monograph: IMonograph) => {
            monograph.wordCoords.subscribe(wordCoords => this.wordCoords = wordCoords);
        });

        /*this.selectedMonographSub = this.store.select(state => state.topicgraphs.docs)
            .filter(monographs => monographs.length > 0)
            .switchMap(monographs =>
                this.activatedRoute.params.forEach((params: Params) => {
                    this.store.dispatch({type: TOPICGRAPHS_ACTIONS.SET_SELECTED_MONOGRAPH, payload: params['docid']});
                    //this.mode = params['mode'];
                    console.log(params);
                }
            )
        ).subscribe();*/

        this.activatedRoute.params.forEach((params: Params) => {
            if (params['docid']) {
                this.store.dispatch({type: TOPICGRAPHS_ACTIONS.CLEAR_SELECTED_MONOGRAPH});
                this.monographsService.select(params['docid']).subscribe((results: any) => {
                    this.store.dispatch({type: TOPICGRAPHS_ACTIONS.MONOGRAPHS_SEARCH_COMPLETE, payload: results});
                    this.store.dispatch({type: TOPICGRAPHS_ACTIONS.SET_SELECTED_MONOGRAPH, payload: params['docid']});
                });
            }
        });

       // this.store.dispatch(this.uiActions.setSelectedChapter(-1));
    }

    updatePdfViewerDimensions() {
        let element = this.pdfViewer.element.nativeElement;
        this.pdfViewerDimensions = {
            offsetLeft: element.offsetLeft,
            offsetWidth: element.offsetWidth,
            offsetTop: element.offsetTop,
            offsetHeight: element.offsetHeight
        };
        console.log('display', this.pdfViewerDimensions.offsetWidth,this.pdfViewerDimensions.offsetHeight,parseFloat(this.pdfViewerDimensions.offsetWidth)/parseFloat(this.pdfViewerDimensions.offsetHeight));
    }
    ngAfterViewChecked() {
        if (this.pdfViewerDimensions === undefined && this.pdfViewer && this.pdfViewer.element && this.pdfViewer.element.nativeElement.offsetHeight) {
            this.updatePdfViewerDimensions();
        }
    }

    ngOnDestroy() {
        if (this.uiStateSub) this.uiStateSub.unsubscribe();
        if (this.selectedMonographSub) this.selectedMonographSub.unsubscribe();
        this.store.dispatch({type: TOPICGRAPHS_ACTIONS.SET_PDF_PAGE, payload: 1});
    }

}

function formatCitationResponse(response:any) {
        console.log('response', response);
        var stringcite = response.data.substring(17, response.data.length - 1);
        var obj = JSON.parse(stringcite);


        var citation = obj.data.citation.replace('):', ').'); //fix chicago citation
        citation = citation.replace(/\\'/g, ''); //remove escape backslashes for /'
        console.log('citation', citation);
    return citation;
}

/*function getCite(style:string) {
        let url = formatCitationRequest(style);
       return this.http.get(url);
            .map((response:any) => response.json())
            .map(data => {
                var string = data;
                return string;
            })

    }*/