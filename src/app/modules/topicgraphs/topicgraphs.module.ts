import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
require('bootstrap/dist/js/bootstrap.js');

import { CarouselComponent,
         TopicgraphsAboutComponent,
         PdfSubmitterComponent,
         PdfSubmitModalComponent,
         PdfViewerComponent,
         TopicChartComponent,
         TopicChartsComponent,
         TopicgraphsBrowserComponent,
         TopicgraphsFooterComponent,
         TopicgraphsHeaderComponent,
         TopicgraphsViewerComponent } from './components/';
import { MonographsService } from './services/monographs.service';
import { PdfAnalyzerService } from './services/pdf-analyzer.service';
import { KeysPipe } from './pipes/';
import { FileDropDirective } from './directives/';
import { topicgraphsRouting } from './topicgraphs.routing';

@NgModule({
    imports: [
        CommonModule,
        Ng2BootstrapModule,
        topicgraphsRouting
    ],
    declarations: [
        CarouselComponent,
        TopicgraphsAboutComponent,
        PdfSubmitterComponent,
        PdfSubmitModalComponent,
        PdfViewerComponent,
        TopicChartComponent,
        TopicChartsComponent,
        TopicgraphsBrowserComponent,
        TopicgraphsFooterComponent,
        TopicgraphsHeaderComponent,
        TopicgraphsViewerComponent,
        FileDropDirective,
        KeysPipe
    ],
    providers: [
        MonographsService,
        PdfAnalyzerService
    ],
    exports: [
        TopicgraphsBrowserComponent
    ]
})
export class TopicgraphsModule { }
