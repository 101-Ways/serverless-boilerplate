const path = require("path");
const ManifestPlugin = require("webpack-manifest-plugin");
const SWPrecacheWebpackPlugin = require("sw-precache-webpack-plugin");
const paths = require("./paths");
const getClientEnvironment = require("./env");
const Merge = require("webpack-merge");
const commonPluginsDevProd = require("./webpack.config.common.js")
  .commonPluginsDevProd;
const commonPluginsProdServer = require("./webpack.config.common.js")
  .commonPluginsProdServer;
const commonResolve = require("./webpack.config.common.js").commonResolve;
const commonModule = require("./webpack.config.common.js").commonModule;
var nodeExternals = require("webpack-node-externals");
const cssModulesClassFormat = "[name]-[local]-[hash:8]";

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = "/"; // paths.servedPath;

// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = process.env.PUBLIC_URL;
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified["process.env"].NODE_ENV !== '"production"') {
  throw new Error("Production builds must have NODE_ENV=production.");
}

// This is the production configuration.
// module.exports = Merge(commonConfig, {
// module.exports =
const productionBundle = Merge(
  commonResolve,
  commonModule,
  commonPluginsDevProd,
  commonPluginsProdServer,
  {
    // Don't attempt to continue if there are any errors.
    bail: true,
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: "source-map",
    // In production, we only want to load the polyfills and the app code.
    entry: {
      main: [require.resolve("./polyfills"), paths.appIndexJs]
    },
    output: {
      // The build folder.
      path: paths.appBuild,
      // Generated JS file names (with nested folders).
      // There will be one main bundle, and one file per asynchronous chunk.
      // We don't currently advertise code splitting but Webpack supports it.
      filename: "static/js/[name].[chunkhash:8].js",
      // chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',

      // We inferred the "public path" (such as / or /my-project) from homepage.
      publicPath: publicPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: info =>
        path
          .relative(paths.appSrc, info.absoluteResourcePath)
          .replace(/\\/g, "/")
    },
    plugins: [
      // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
      // new ExtractTextPlugin({
      //   filename: 'static/css/[name].[contenthash:8].css',
      //   disable: false,
      //   allChunks: true
      // }),
      // Generate a manifest file which contains a mapping of all asset filenames
      // to their corresponding output file so that tools can pick it up without
      // having to parse `index.html`.
      new ManifestPlugin({
        fileName: "asset-manifest.json"
      }),
      // Generate a service worker script that will precache, and keep up to date,
      // the HTML & assets that are part of the Webpack build.
      new SWPrecacheWebpackPlugin({
        // By default, a cache-busting query parameter is appended to requests
        // used to populate the caches, to ensure the responses are fresh.
        // If a URL is already hashed by Webpack, then there is no concern
        // about it being stale, and the cache-busting can be skipped.
        dontCacheBustUrlsMatching: /\.\w{8}\./,
        filename: "service-worker.js",
        logger(message) {
          if (message.indexOf("Total precache size is") === 0) {
            // This message occurs for every build and is a bit too noisy.
            return;
          }
          if (message.indexOf("Skipping static resource") === 0) {
            // This message obscures real errors so we ignore it.
            // https://github.com/facebookincubator/create-react-app/issues/2612
            return;
          }
          console.log(message);
        },
        minify: true,
        // For unknown URLs, fallback to the index page
        navigateFallback: publicUrl + "/index.html",
        // Ignores URLs starting from /__ (useful for Firebase):
        // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
        navigateFallbackWhitelist: [/^(?!\/__).*/],
        // Don't precache sourcemaps (they're large) and build asset manifest:
        staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/]
      })
    ]
  }
);

const server = Merge(commonResolve, commonPluginsProdServer, {
  entry: {
    server: paths.serverIndexJs
  },
  target: "node",
  output: {
    path: paths.appBuild,
    filename: "server/[name].js",
    libraryTarget: "umd",
    publicPath: publicPath
  },
  externals: [nodeExternals()],
  module: {
    strictExportPresence: true,
    rules: [
      // ** ADDING/UPDATING LOADERS **
      // The "file" loader handles all assets unless explicitly excluded.
      // The `exclude` list *must* be updated with every change to loader extensions.
      // When adding a new loader, you must add its `test`
      // as a new entry in the `exclude` list in the "file" loader.

      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      {
        exclude: [
          /\.html$/,
          /\.(js|jsx)$/,
          /\.css$/,
          /\.scss$/,
          /\.json$/,
          /\.png$/,
          /\.svg$/
        ],
        loader: require.resolve("file-loader"),
        options: {
          name: "static/media/[name].[hash:8].[ext]"
        }
      },
      // "url" loader works just like "file" loader but it also embeds
      // assets smaller than specified size as data URLs to avoid requests.
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
        loader: require.resolve("url-loader"),
        options: {
          limit: 10000,
          name: "static/media/[name].[hash:8].[ext]"
        }
      },
      // Process JS with Babel.
      {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: require.resolve("babel-loader"),
        options: {
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true,
          compact: true
        }
      },
      // Add SASS support.
      {
        test: /\.scss$/,
        use: [
          {
            loader: require.resolve("css-loader/locals"),
            options: {
              localIdentName: cssModulesClassFormat,
              camelCase: "dashes",
              modules: true
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: false,
              includePaths: paths.sassPaths
            }
          }
        ]
      }
    ]
  }
});

module.exports = [productionBundle, server];
