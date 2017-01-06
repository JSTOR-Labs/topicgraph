import { Observable } from 'rxjs/Observable';
import { MonographsService } from '../services/monographs.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface IVisdata {
    segment: number;
    label: string;
    value: number;
}

class Visdata implements IVisdata {
    constructor(public segment: number = 0,
                public label: string = '',
                public value: number = 0.0) {}
}

export class Topic {
    constructor(public topic:string=null, public weight:number = 0.0) {}
}

export interface IMonograph {
    id: string;
    author: string[];
    author_string: string;
    cover_thumbnail_lg: string;
    cover_thumbnail_sm: string;
    disciplines: string[];
    doi: string;
    numPages: number;
    pdf: string;
    publisher: string;
    pubYear: number;
    segmentLevels: number;
    stableUrl: string;
    submittedBy: string;
    subtitle: string;
    summary: string;
    title: string;
    toc: any[];
    topics: Topic[];
    visdata: Observable<any>;
    wordCoords: Observable<any>;
}

class Monograph implements IMonograph {
    id: string;
    author: string[];
    author_string: string;
    cover_thumbnail_lg: string;
    cover_thumbnail_sm: string;
    disciplines: string[];
    doi: string;
    numPages: number;
    pdf: string;
    publisher: string;
    pubYear: number;
    segmentLevels: number;
    stableUrl: string;
    submittedBy: string;
    subtitle: string;
    summary: string;
    title: string;
    topics: Topic[]; 
    toc: any[];

    private _visdata: any;
    private _wordCoords: any;

    constructor(public monographsService: MonographsService) {}
    get visdata() : Observable<any> {
        return this._visdata !== undefined
            ? new BehaviorSubject<any>(this._visdata)
            : this.monographsService.getVisualizationData(this.id, this.segmentLevels)
                .map(docs => monographDocsToVisdata(docs))
                .do(visdata => this._visdata = visdata);
    }
    get wordCoords() : Observable<any> {
        return this._wordCoords !== undefined
            ? new BehaviorSubject<any>(this._wordCoords)
            : this.monographsService.getWordCoords(this.id)
                .map(docs => {
                    let wordCoordsByPage:any = {};
                    if (docs.length > 0 && docs[0].coord_ocr) {
                        for (let i = 0; i < docs[0].coord_ocr.length; i++) {
                            let wordCoordRecs = docs[0].coord_ocr[i].split('\n');
                            if (wordCoordRecs.length > 0) {
                                let pageNum = +wordCoordRecs[0].split(',').slice(0,1);
                                wordCoordsByPage[pageNum] = wordCoordRecs;
                            }
                        }
                    }
                    return wordCoordsByPage;
                })
                .do(wordCoordsByPage => this._wordCoords = wordCoordsByPage);
    }
}

export function monographsSearchResultsToDocs(monographsService: MonographsService, searchResults: any[], token: string): IMonograph[] {
    let monographs: IMonograph[] = [];
    for (let i = 0; i < searchResults.length; i++) {
        let resultsDoc: any = searchResults[i];
        let doc: IMonograph = new Monograph(monographsService);
        doc.id = resultsDoc.id;
        doc.doi = resultsDoc.doi;
        doc.cover_thumbnail_sm = resultsDoc.thumbnail_sm;
        doc.cover_thumbnail_lg = resultsDoc.thumbnail_lg;

        doc.title = resultsDoc.title || 'Untitled';
        doc.subtitle = resultsDoc.subtitle || '';
        doc.summary = resultsDoc.summary || '';
        doc.segmentLevels = +(resultsDoc.segment_levels || 0);
        doc.disciplines = resultsDoc.discipline || ['Undefined'];
        doc.publisher = (resultsDoc.publisher || [null])[0];
        doc.submittedBy = resultsDoc.submitted_by;
        doc.numPages = +resultsDoc.num_pages;
        doc.pubYear = +resultsDoc.published_date;
        doc.pdf = 'https://labs.jstor.org/api/monographs/'+doc.id+'.pdf/?jwt='+token;

        doc.author = [];
        doc.author_string = '';
        if (resultsDoc.author) {
            for (let i = 0; i < resultsDoc.author.length; i++) {
                 doc.author.push(resultsDoc.author[i].replace(/\<\/?[^\>\/]+\>/g, ''));
                if (i === 0) {
                    doc.author_string = doc.author[i];
                } else if (i === 1) {
                    doc.author_string = doc.author_string + ', ' + doc.author[i] + ', et al.';
                }
            }
        }

        if (resultsDoc.visdata) {
            doc.topics = JSON.parse(resultsDoc.visdata);
        }

        if (resultsDoc.stable_url) {
            doc.stableUrl = resultsDoc.stable_url;
        } else if (resultsDoc.doi) {
            doc.stableUrl = 'http://www.jstor.org/stable/'+resultsDoc.doi;
        }

        if (resultsDoc.source_docs) {
            doc.toc = [];
            resultsDoc.source_docs.forEach(function(sd:string){
                doc.toc.push(JSON.parse(sd));
            });
        }

        monographs.push(doc);
    }
    return monographs;
}

export function monographDocsToVisdata(monographDocs: any[]): any {
    let visdata: any = {docData: {
                            sourceDocs: [],
                            pages: [],
                            chapters: []}, 
                        byLevel: {}
                       };
    monographDocs.forEach(function(doc) {
        let segmentNumber = doc.segment || 1;
        if (doc.source_docs) {
            let chapterNumber = 0;
            visdata.docData.chapters.push(0);
            for (let d = 0; d <  doc.source_docs.length; d++) {
                let sourceDoc = JSON.parse(doc.source_docs[d]);
                if (sourceDoc.ty === 'chapter') {
                    chapterNumber++;
                    visdata.docData.chapters.push(sourceDoc.fpage);
                }
                for (let pnum = sourceDoc.fpage; pnum <= sourceDoc.lpage; pnum++) {
                    visdata.docData.pages.push({page:pnum, chapter:chapterNumber, sourceDoc:d});
                }
                visdata.docData.sourceDocs.push(sourceDoc);
            };
            visdata.docData.chapters.push(visdata.docData.pages.length);
        }
        if (!(doc.level in visdata.byLevel)) {
            visdata.byLevel[doc.level] = {topics:{}, segments:[]};
        }
        let segmentTopics:any[] = [];
        if (segmentNumber > visdata.byLevel[doc.level].segments.length) {
            let segmentPages:number[] = [];
            for (let pnum = doc.fpage; pnum <= doc.lpage; pnum++) {
                segmentPages.push(pnum);
            }
            segmentTopics = [];
            visdata.byLevel[doc.level].segments.push({topics:segmentTopics, pages:segmentPages});
        }
        JSON.parse(doc.visdata).forEach(function(rec: any, i:number) {
            if (!visdata.byLevel[doc.level].topics[rec.topic]) visdata.byLevel[doc.level].topics[rec.topic] = 0.0;
            visdata.byLevel[doc.level].topics[rec.topic] += rec.weight;
            segmentTopics.push(new Visdata(rec.segment, rec.topic, rec.weight));
        });
    });
    for (let level in visdata.byLevel) {
        let levelData = visdata.byLevel[level];
        let numSegments = levelData.segments.length;
        for (let topic in levelData.topics) {
            levelData.topics[topic] = levelData.topics[topic]/numSegments;
        }
    }
    return visdata;
}
