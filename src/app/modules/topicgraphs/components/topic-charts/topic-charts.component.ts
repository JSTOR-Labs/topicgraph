import { HostListener, Component, AfterViewInit, OnChanges, OnDestroy, Input, QueryList, ViewEncapsulation, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Store } from '@ngrx/store';
import 'rxjs/Rx';  // this imports the rxjs operators
import { AppState, TOPICGRAPHS_ACTIONS } from '../../../../reducers/';
import * as d3 from 'd3';
import { TopicChartComponent } from '../topic-chart/topic-chart.component';

const colors:string[] = ['#00BFDF', '#EA4E3C', '#99CC33', '#CCBF8B', '#364364', '#FFBA00', '#990000', '#546389', '#757679', '#333333', '#E9E5CA', '#5C7999', '#000000'];

@Component({
    selector: 'topic-charts',
    templateUrl: 'topic-charts.component.html',
    styleUrls: ['topic-charts.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class TopicChartsComponent implements AfterViewInit, OnDestroy, OnChanges {

    @ViewChild('chartContainer') chartContainer: ElementRef;
    @ViewChildren(TopicChartComponent) topicChartComponents: QueryList<TopicChartComponent>;
    chart: any;
    margin: any = { top: 0, bottom: 50, left: 20, right: 20 };
    width: number;
    height: number;
    offsetTop: number;
    offsetLeft: number;
    vertical: any;

    topics = new Subject<any>();
    topicsToShow = 25;
    docData:any;
    visdataSub: any;
    topicsSub: any;
    orientation: string = 'horizontal';
    topicMapOrientationSub: any;
    colors: string[] = colors;

    allTopics: any;

    @Input('visdata') visdata: Observable<any>;

    constructor(public store: Store<AppState>) {}

    positionPDFatPage(pageNum: number, topic: string, topicNumber: number) {
        this.store.dispatch({type: TOPICGRAPHS_ACTIONS.SET_PDF_PAGE, payload: pageNum});
        this.store.dispatch({type: TOPICGRAPHS_ACTIONS.SET_SELECTED_TOPIC, payload: {topic: topic, topicNum: topicNumber}});
    }

    @HostListener('body:click', ['$event'])
    globalClickListener(event: any) {
        // Global click listener used to adjust top offset used by verticle
        //  position marker when display elements change size
        this.offsetTop = this.chartContainer.nativeElement.offsetTop;
        if (this.vertical) this.vertical.style('top', this.offsetTop + 'px');
    }

    ngOnChanges(e?: any) {
        if (this.width) {
            if (this.topicChartComponents.first.chartContainer.nativeElement.offsetWidth > 0 && this.width !== this.topicChartComponents.first.chartContainer.nativeElement.offsetWidth) {
                this.width = this.topicChartComponents.first.chartContainer.nativeElement.offsetWidth;
                this.offsetLeft = this.topicChartComponents.first.chartContainer.nativeElement.offsetLeft;
                this.topicChartComponents.forEach(topicChartComponent => topicChartComponent.updateChart(true));
            }
        } else {
            if (this.topicChartComponents && this.topicChartComponents.length > 0) {
                let element = this.topicChartComponents.first.chartContainer.nativeElement;
                this.width = element.offsetWidth;
                this.offsetLeft = element.offsetLeft;
                this.createChart();
            }
        }

    }

    ngAfterViewInit() {
        this.topicMapOrientationSub = this.store.select(state => state.topicgraphs.topicMapOrientation)
            .subscribe(orientation => {
                this.orientation = orientation;
                if (this.allTopics) {
                    if (this.orientation === 'horizontal') {
                        this.topics.next(this.allTopics.slice(0, this.topicsToShow));
                    } else {
                        this.topics.next(this.allTopics.slice(0, 1));
                    }
                }
            });

        this.topicsSub = this.topics.subscribe();

        this.visdataSub = this.visdata
            .map(data => {

                // Find most granular data
                let level: number = -1;
                for (let _level in data.byLevel) {
                    if (+_level > level) level = +_level;
                }

                let topicData: any = {};
                let topicNum = 0;
                for (let topic in data.byLevel[level].topics) {
                    topicData[topic] = {topic:topic, num:++topicNum, weight:data.byLevel[level].topics[topic], values:[]};
                }

                // Build array of segment values
                for (let segmentIdx = 0; segmentIdx < data.byLevel[level].segments.length; segmentIdx++) {
                    let segmentData:any[] = data.byLevel[level].segments[segmentIdx].topics;
                    for (let segTopicIdx = 0; segTopicIdx < segmentData.length; segTopicIdx++) {
                        let segTopic:any = segmentData[segTopicIdx];
                        if (topicData[segTopic.label]) {
                            topicData[segTopic.label].values.push(segTopic.value);
                        }
                    }
                    for (let topic in topicData) {
                        if (topicData[topic].values.length < segmentIdx+1) {
                            topicData[topic].values.push(0.0);
                        }
                    }
                }

                // Put topic data into array ordered by descending weight
                let sortedTopics:any[] = [];
                for (let topic in topicData) {
                    sortedTopics.push(topicData[topic]);
                }
                sortedTopics.sort(function (a: any, b: any) { return b.weight - a.weight; });

                // Apply moving average to smooth topic chart
                let periods = 5;
                for (let topic in sortedTopics) {
                    let smoothed:number[] = [];
                    for (let i = 0; i < sortedTopics[topic].values.length; i++) {
                        let s = i >= periods ? i-periods : i;
                        let e = i < sortedTopics[topic].values.length ? i+1 : sortedTopics[topic].values.length+1;
                        var maSum = sortedTopics[topic].values.slice(s,e).reduce(function(a:number, b:number) {
                            return a + b;
                        }, 0);
                        let maAvg = maSum > 0 ? maSum/(e-s) : 0;
                        smoothed.push(maAvg);
                    }
                    sortedTopics[topic].values = smoothed;
                }

                return {docData:data.docData, topics:sortedTopics};
            })
            .subscribe(data => {
                this.docData = data.docData;
                this.allTopics = data.topics;
                this.topics.next(this.allTopics.slice(0, (this.orientation === 'vertical' ? 1 : this.topicsToShow)));
            });
    }

    createChart() {
        let self: any = this;
        let numPages = this.docData.pages.length;
        let element = this.chartContainer.nativeElement;
        this.offsetTop = element.offsetTop;
        let pagesScale = d3.scaleLinear()
    	    .domain([0, numPages])
    	    .range([(this.offsetLeft), this.width+this.offsetLeft-this.margin.left-this.margin.right]);

        let tooltipDiv = d3.select('#main').append('div')	
            .attr('class', 'topicChartsTooltip')						
            .style('opacity', 0);

        // verticle bar spanning all topic graphs showing page position 
        let vertical = d3.select('#chartContainer')
            .append('div')
            .attr('class', 'remove')
            .style('position', 'absolute')
            .style('z-index', '19')
            .style('width', '0')
            .style('top', (this.offsetTop-4)+'px')
            .style('bottom', '0')
            .style('left', (this.offsetLeft)+'px')
            .style('background', '#aaa');

            d3.select('#chartContainer')
                .on('mousemove', function(d:any, i:number){  
                    let coords:any = d3.mouse(this);
                    if (vertical) vertical.style('left', (coords[0]) + 'px' ).style('cursor', 'pointer').style('cursor', 'hand');
                    let pagesIdx = Math.round(Math.floor(pagesScale.invert(coords[0]-self.margin.left)));
                    let page = (pagesIdx >= 0 && pagesIdx < numPages) ? self.docData.pages[pagesIdx] : {};
                    let sourceDoc = (page.sourceDoc && self.docData.sourceDocs[page.sourceDoc]) ? self.docData.sourceDocs[page.sourceDoc] : {};
                    if (pagesIdx >= 0 && pagesIdx < numPages) {
                        tooltipDiv.transition().duration(200).style('opacity', 1);
                        let toolTipHtml = '';
                        if (sourceDoc.title) {
                            toolTipHtml += '<p class="topicChartsTooltipTitle">';
                            if (sourceDoc.ty === 'chapter') toolTipHtml += 'Chapter '+ page.chapter + ' - ';
                            toolTipHtml += sourceDoc.title;
                            if (sourceDoc.subtitle) toolTipHtml += '&nbsp;&nbsp;'+sourceDoc.subtitle;
                            toolTipHtml += '</p>';
                        }
                        toolTipHtml += '<p class="topicChartsTooltipPage">Page '+page.page+'</p>';
                        tooltipDiv.html(toolTipHtml)	
                            .style('left', (coords[0]-150) + 'px')
                            .style('top', (self.offsetTop)+'px');
                        vertical.style('width', '1px');
                    }
                })
                .on('mouseover', function(d:any, i:number){  
                    let coords:any = d3.mouse(this);
                    var page = Math.round(Math.floor(pagesScale.invert(coords[0]-self.margin.left)))+1;
                    if (vertical && page > 0 && page <= numPages) {
                        vertical.style('left', coords[0] + 'px').style('width', '1px');;
                    }
                })
                .on('mouseout', function(d:any, i:number) {
                    tooltipDiv.transition().duration(500).style('opacity', 0);	
                    vertical.style('width', '0');
                })
                .on('click', function(d:any, i:number) {
                    let coords = d3.mouse(this);
                    var page = Math.round(Math.floor(pagesScale.invert(coords[0]-self.margin.left)))+1;
                    var topicIdx = Math.round(coords[1]/self.chartContainer.nativeElement.offsetHeight*self.allTopics.length);
                    console.log('click', page, topicIdx, self.allTopics[topicIdx].topic);
                    self.positionPDFatPage(page, self.allTopics[topicIdx].topic, topicIdx + 1);
                });

    }

    ngOnDestroy() {
        if (this.visdataSub) this.visdataSub.unsubscribe();
        if (this.topicsSub) this.topicsSub.unsubscribe();
        if (this.topicMapOrientationSub) this.topicMapOrientationSub.unsubscribe();
    }

}
