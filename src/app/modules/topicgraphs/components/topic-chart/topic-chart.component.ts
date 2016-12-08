import { Component, AfterViewInit, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { Store } from '@ngrx/store';
import 'rxjs/Rx';  // this imports the rxjs operators
import { AppState, TOPICGRAPHS_ACTIONS } from '../../../../reducers/';
import { MonographsService } from '../../services/monographs.service';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'topic-chart',
    templateUrl: 'topic-chart.component.html',
    styleUrls: ['topic-chart.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class TopicChartComponent implements AfterViewInit, OnChanges, OnInit {
    @ViewChild('chart') chartContainer: ElementRef;
    @Input('topic') topic: any;
    @Input('docData') docData: any;
    @Input('color') color: string;
    @Input('orientation') orientation: string = 'horizontal';

    margin: any = { top: 0, bottom: 50, left: 20, right: 20 };
    width: number;
    height: number;
    chart: any;
    pagesScale: any;
    rotatedHeight = 950;
    priorOrientation: string;
    relatedTopics: Observable<string>;

    constructor(public store: Store<AppState>,
                private monographsService: MonographsService){}

    ngOnInit() {
        this.relatedTopics = this.monographsService.getTopicWords(this.topic.topic.toLowerCase().replace(' ','_'))
        .map(words => {
            var temp_string = "<p><b>Topic:</b> " + this.topic.topic + "</p><p><b>Related terms:</b> ";
            for (var i = 0; i < words.length; i++) {
                if (i < 15) {
                    temp_string = temp_string + words[i] + ", ";
                } else if (i === 15) {
                     temp_string = temp_string + words[i] + ", and more</p>";
                }
            }
            return temp_string;
        })
        ;

    }

    ngAfterViewInit() {
        let element = this.chartContainer.nativeElement;
        if (element && element.offsetWidth) {
            this.createChart();
            this.updateChart();
        };
    }

    ngOnChanges(e?: any) {
        if (this.chart) this.updateChart();
    }

    positionPDFatPage(pageNum: number, topic: string, topicNumber: number) {
        this.store.dispatch({type: TOPICGRAPHS_ACTIONS.SET_PDF_PAGE, payload: pageNum});
        this.store.dispatch({type: TOPICGRAPHS_ACTIONS.SET_SELECTED_TOPIC, payload: {topic: topic, topicNum: topicNumber}});
    }

    createChartSvg() {
        let numPages = this.docData.pages.length;
        let element = this.chartContainer.nativeElement;
        this.width = this.orientation === 'vertical' ? this.rotatedHeight : element.offsetWidth - this.margin.left - this.margin.right;
        this.height = element.offsetHeight - this.margin.top - this.margin.bottom;

        //console.log('createChargSvg', this.topic.topic, this.width, this.height, element.offsetWidth, element.offsetHeight);
        this.chart = d3.select(element).append('svg')
            .attr('id', 'topic' + this.topic.num)
            .attr('width', element.offsetWidth)
            .attr('height', element.offsetHeight)
                .append('g')
                    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

       /* this.chart.append('text')
            .attr('x', (element.leftOffset))
            .attr('y', 14)
            .attr('text-anchor', 'left')
            .style('font-size', '16px') 
            .style('font-weight', 'bold')
            .text(this.topic.topic);*/
        // linear scale for page numbers
        this.pagesScale = d3.scaleLinear()
    	    .domain(this.orientation === 'vertical' ? [numPages, 0] : [0, numPages])
    	    .range([0, this.width]);
        var pagesAxis = d3.axisBottom(this.pagesScale);

        // polylinear scale for chapters
        let chapterDomain:number[] = [], chapterRange: number[] = [];
        this.docData.chapters.forEach(function(firstPage: number, chapterNumber: number){
            chapterDomain.push(chapterNumber);
            chapterRange.push(firstPage === 0 ? 0.0 : firstPage / numPages * this.width);
        }, this);
        var chaptersScale = d3.scaleLinear().domain(chapterDomain).range(chapterRange);
        var chaptersAxis = d3.axisBottom(chaptersScale)
            .tickValues(chaptersScale.domain()
            .filter(function(d, i) { return d % 1 === 0; }))
            .tickFormat(d3.format('.0d'));

        if (this.orientation === 'horizontal') {
            if (this.docData.sourceDocs.length === 1) {
                this.chart.append('g')
                    .attr('transform', 'translate(0,' + (this.height) + ')')
                    .call(pagesAxis);

            } else {
                this.chart.append('g')
                    .attr('transform', 'translate(0,' + (this.height) + ')')
                    .call(chaptersAxis)
                        // remove outer ticks
                        .selectAll('.tick')
                            .each(function (d: any, i: number) {
                                if (d === 0 || d === chapterDomain.length - 1) {
                                    (<any>this).remove();
                                }
                            });
            }
            let xAxisTitle = this.docData.sourceDocs.length === 1 ? 'Page' : 'Chapter';
            this.chart.append('text')
                .attr('x', (element.leftOffset))
                .attr('y', 66)
                .attr('text-anchor', 'left')
                .style('font-size', '10px')
                .style('font-weight', 'light')
                .text(xAxisTitle);
        /*this.tooltipDiv = d3.select('#main').append('div')	
            .attr('class', 'tooltip')				
            .style('opacity', 0);*/
        }

    }

    createChart() {
        this.createChartSvg();
    }

    updateChart(replace: boolean= false) {
        if (replace || this.priorOrientation) {
            d3.select('#topic' + this.topic.num).remove();
            this.createChartSvg();
        }
        this.priorOrientation = this.orientation;

        let y = d3.scaleLinear()
            .domain([0, 4])
            .range([this.height, 0]);

        let x = d3.scaleLinear()
            .domain(this.orientation === 'vertical' ? [0, this.topic.values.length-1] : [this.topic.values.length-1, 0])
            .range([this.width, 0]);

        // define the area
        let area = d3.area()
            .x(function(d: any, i: number) { return x(i); })
            .y0(this.height)
            .y1(function(d: any, i: number) { return y(d); });

        // define the line
        let line = d3.line()
            .x(function(d: any, i: any) { return x(i); })
            .y(function(d: any, i: number) { return y(d); });

        let self = this;
        let dataarray: any[] = [];
        this.chart.append('path')
            .data([this.topic.values])
            .attr('fill', this.color)
            .attr('d', area)
            .on('mouseover', function(d: any, i: number) {
                /*self.tooltipDiv.transition()		
                    .duration(200)		
                    .style('opacity', .9);*/
            })
            .on('mousemove', function(d: any, i: number) {
                var coords = d3.mouse(this);
                var page = Math.floor(self.pagesScale.invert(coords[0]));
                var segment = Math.floor(x.invert(coords[0]));
                var selected = d;
                for (var k = 0; k < selected.length; k++) {
                    dataarray[k] = selected[k];
                }
                //console.log(self.topic.topic, page, segment, d, d[segment]);
                /*
                self.tooltipDiv.transition().duration(200).style('opacity', 1);
                self.tooltipDiv.html('<p><span class="tooltipTitle">'+self.topic.topic+'</span><br/><span class="tooltipPage">Page '+page+'</span></p>')	
                    .style('left', (d3.event.pageX - 50) + 'px')
                    .style('top', (d3.event.pageY - 58) + 'px');
                */
            })
            .on('mouseout', function(d:any, i:number) {
                //self.tooltipDiv.transition().duration(500).style('opacity', 0);	
            })
            /*
            .on('click', function(d:any, i:number) {
                var coords = d3.mouse(this);
                var page = Math.floor(self.pagesScale.invert(coords[0]));
                self.positionPDFatPage(page, self.topic.topic, self.topic.num);
            })
            */;

        /*this.chart.append('path')
            .data([this.topic.values])
            .attr('stroke', this.color)
            .attr('stroke-width', '1px')
            .attr('fill', 'none')
            .attr('d', line);*/

        if (this.orientation === 'vertical') { // rotate svg
            d3.select('svg').attr('height', this.rotatedHeight);
            this.chart
                .attr('transform', 'rotate(-90 0 0) translate(-'+(this.rotatedHeight)+',396)')
                .attr('height', this.rotatedHeight);
        }
    }

}
