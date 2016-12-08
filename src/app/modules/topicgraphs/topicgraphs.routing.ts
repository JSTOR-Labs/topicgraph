import { Routes, RouterModule } from '@angular/router';
import { TopicgraphsAboutComponent,
         PdfSubmitterComponent,
         TopicgraphsBrowserComponent,
         TopicgraphsViewerComponent } from './components';

const TOPICGRAPHS_ROUTES: Routes = [
    { path: '', component: TopicgraphsBrowserComponent },
    { path: 'about', component: TopicgraphsAboutComponent},
    { path: 'submit', component: PdfSubmitterComponent},
    { path: 'monograph/:docid', component: TopicgraphsViewerComponent},
];

export const topicgraphsRouting = RouterModule.forChild(TOPICGRAPHS_ROUTES);
