# Topicgraph

## Overview

This repository contains the source code for the web application driving the
[JSTOR Labs](https://labs.jstor.org) [Topicgraph](https://labs.jstor.org/topicgraph) 
demonstration app.  The Topicgraph app was developed as part of the 
["Reimagining the Monograph"](https://labs.jstor.org/monographs) project conducted by
JSTOR Labs during the Fall of 2016.

## Installing and running locally

> This application was developed using the Angular2 javascript framework and can be installed
and run using either the Node Package Manager (NPM) or yarn.

> You can use npm, but it's recommended to use yarn as it installs a lot faster and has other benefits 
[https://yarnpkg.com/](https://yarnpkg.com/) . Make sure you are using yarn version 0.16.0 or newer (check with 'yarn --version')

```bash
git clone git@github.com:JSTOR-Labs/topicgraph.git
cd topicgraph
yarn
yarn start
```

## Technical details

### Web application

This application extends the [angular-webpack2-starter](https://github.com/qdouble/angular-webpack2-starter/blob/master/README.md) 
seed project, which provides support for Angular2, Ahead of Time (AOT) compilation, server-side rendering (Angular Universal) and 
many other features.

For this project the [Owl Carousel](http://www.owlcarousel.owlgraphic.com/), [Font Awesome icons](http://fontawesome.io/),
[pdf.js](https://www.npmjs.com/package/pdfjs-dist) and [D3](https://github.com/d3/d3/wiki) libraries were added.

### Data API

REST APIs provided by JSTOR Labs are used for in the analysis and topic inference of the monographs.  
These APIs should be considered experimental and subject to change.

#### Monographs service

`select` - Retrieves monograph metadata and serialized thumbnail images from back-end service.  If a 
document ID is provided only the metadata for that single document is returned, otherwise the 
metadata and thumbnails for all public monographs is returned.

`getVisualizationData` - Retrieves topic data for a monograph for use in visualization.  The topic data 
is generally available at multiple levels of granularity.  If unspecified the level defaults to level 
'0', or the most coarse.

`getWordCoords` - Retrieves the full text for a monograph with corresponding woord coordinates.  
This word coordinate text is used in word highlighting.

`getTopicWords` - Retrieves the words associated with a specified topic.

#### PDF analyzer service

`submit` - Submit a PDF for off-line analysis.  An email notification is generated when the 
document processing is complete.
