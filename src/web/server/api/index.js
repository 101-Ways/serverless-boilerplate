import results from './results';

/**
 * Maps API endpoints for production and dev servers.
 * @param  {Object} server - express server instance that will get middleware applied to,
 * @return {void}
 */
const applyApi = server => {
  const apiMap = {
    '/api/results': results
  };
  for (let path in apiMap) {
    server.use(path, apiMap[path]);
  }
};

export default applyApi;
