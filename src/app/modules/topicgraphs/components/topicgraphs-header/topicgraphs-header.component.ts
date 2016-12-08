import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'topicgraphs-header',
    templateUrl: 'topicgraphs-header.component.html',
    styleUrls: ['topicgraphs-header.component.css'],
})
export class TopicgraphsHeaderComponent {

    public constructor(private router: Router) {}

}
