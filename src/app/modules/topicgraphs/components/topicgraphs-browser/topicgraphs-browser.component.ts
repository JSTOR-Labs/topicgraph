import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import 'rxjs/Rx';  // this imports the rxjs operators
import { AppState } from '../../../../reducers/';
import { MonographsService } from '../../services/monographs.service';

// declare let ga: Function;

const disciplines: string[] = ['Anthropology',
                               'Archaeology',
                               'Architecture and Architectural History',
                               'Art & Art History',
                               'Business',
                               'Environmental Science',
                               'Geology',
                               'Health Sciences',
                               'History',
                               'Language & Literature',
                               'Law',
                               'Music',
                               'Paleontology',
                               'Performing Arts',
                               'Philosophy',
                               'Political Science',
                               'Religion',
                               'Sociology',
                               'Undefined',
                               'Zoology'
                                ];

@Component({
    selector: 'topicgraphs-browser',
    templateUrl: 'topicgraphs-browser.component.html',
    styleUrls: ['topicgraphs-browser.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicgraphsBrowserComponent implements OnInit {

    allMonographs = {};

    constructor(public store: Store<AppState>,
                public router: Router,
                private monographsService: MonographsService) {}

    onItemSelected(docid: any) {
        if (docid) this.router.navigate(['monograph', docid]);
    }

    ngOnInit() {
        this.allMonographs['All'] = this.store.select(state => state.topicgraphs.docs).filter(monographs => monographs.length > 0);

        disciplines.forEach(discipline => {
            this.allMonographs[discipline] = this.store.select(state => state.topicgraphs.docs)
                .map(monographs => monographs.filter(function(monograph){return monograph.disciplines.indexOf(discipline) >= 0;}))
                .filter(monographs => monographs.length > 0);
        });

    }

}
