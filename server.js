// These polyfills must be the first thing imported in node
"use strict";
require('angular2-universal/polyfills');
var path = require('path');
var express = require('express');
// Angular 2 Universal
var router_1 = require('@angular/router');
var core_1 = require('@angular/core');
var angular2_universal_1 = require('angular2-universal');
// replace this line with your Angular 2 root component
var app_1 = require('./app');
var app = express();
var ROOT = path.join(path.resolve(__dirname, '..'));
core_1.enableProdMode();
// Express View
app.engine('.html', angular2_universal_1.expressEngine);
app.set('views', __dirname);
app.set('view engine', 'html');
function ngApp(req, res) {
    var baseUrl = '/';
    var url = req.originalUrl || '/';
    var config = {
        directives: [app_1.App],
        // dependencies shared among all requests to server
        platformProviders: [
            { provide: angular2_universal_1.ORIGIN_URL, useValue: 'http://localhost:3000' },
            { provide: angular2_universal_1.BASE_URL, useValue: baseUrl },
        ],
        // dependencies re-created for each request
        providers: [
            { provide: angular2_universal_1.REQUEST_URL, useValue: url },
            router_1.provideRouter(app_1.routes),
            angular2_universal_1.NODE_LOCATION_PROVIDERS,
            angular2_universal_1.NODE_HTTP_PROVIDERS,
        ],
        // if true, server will wait for all async to resolve before returning response
        async: true,
        // if you want preboot, you need to set selector for the app root
        // you can also include various preboot options here (explained in separate document)
        preboot: false // { appRoot: 'app' }
    };
    res.render('index', config);
}
// Serve static files
app.use(express.static(ROOT, { index: false }));
// send all requests to Angular Universal
// if you want Express to handle certain routes (ex. for an API) make sure you adjust this
app.get('/', ngApp);
app.get('/home', ngApp);
app.get('/about', ngApp);
// Server
app.listen(3000, function () {
    console.log('Listening on: http://localhost:3000');
});
