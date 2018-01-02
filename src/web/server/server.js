// @flow

import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'fs';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import { StaticRouter, matchPath } from 'react-router-dom';
import App from 'rootContainers/App';
import { Helmet } from 'react-helmet';
import rootSaga from 'sagas';
import { ports } from './app.conf.js';
// API routes for different API endpoints.
import applyApi from 'server/api';
import * as reducers from 'reducers';
import 'fetch-everywhere';
import template from './template.js';
import staticRoutes from 'routes';

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// translate sccs variables files into JSON. You get a JSON like: { 'variableName' : 'variableValue'}, just access the value: scssJson.variableName

const assets = JSON.parse(
  fs.readFileSync('./build/asset-manifest.json', { encoding: 'utf8' })
);

const port =
  (ports &&
    process.env.APP_ENV &&
    (typeof ports[process.env.APP_ENV] === 'number' &&
      ports[process.env.APP_ENV])) ||
  ports.default;
// Proxy the fetch command to the server due to server side needing absolute paths.
const oldFetch = global.fetch;
const serverProxyEndpoint =
  typeof process.env.BASE_URL === 'string'
    ? process.env.BASE_URL
    : 'http://localhost:' + port;
global.fetch = function(endpoint, ...args) {
  console.log('endpoint', endpoint);
  return oldFetch(serverProxyEndpoint + endpoint, ...args);
};

const server = express();
server.use(awsServerlessExpressMiddleware.eventContext());
server.use('/', express.static('build'));
applyApi(server);
server.use((req, res) => {
  const context = {};

  const match = staticRoutes.some(route => {
    return matchPath(req.url, route);
  });

  if (match) {
    const reducer = combineReducers(reducers);
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(reducer, applyMiddleware(sagaMiddleware));
    const html = (
      <Provider store={store}>
        <StaticRouter location={req.url} context={context}>
          <App />
        </StaticRouter>
      </Provider>
    );
    sagaMiddleware.run(rootSaga).done.then(() => {
      res.status(200).send(
        template(
          renderToString(html),
          assets['main.js'],
          assets['main.css'],
          store.getState(),
          Helmet.renderStatic() // NOTE: Must be placed after renderToString to get Helmet config
        )
      );
    });
    renderToString(html);
    store.dispatch(END);
  } else {
    res.status(404).send('Page not found');
  }
});

exports.server = server;
