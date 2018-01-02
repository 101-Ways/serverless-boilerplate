// @flow

import express from 'express';
// API routes for different API endpoints.
import applyApi from './api';
import chalk from 'chalk';
console.log(chalk.red('Starting dev server'));
const server = express();
applyApi(server);
server.use('*', (req, res) => {
  res
    .status(404)
    .json({message: 'Path not found'});
});
server.listen(3001);