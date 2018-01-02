import serialize from 'serialize-javascript';

export default (content, js, css, storeData, helmet) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#ea2914">
    ${helmet.meta.toString()}
    <title>What Car? - New and Used Car Reviews, Car Deals</title>
    <link rel="manifest" href="manifest.json">
    <link rel="shortcut icon" href="favicon.ico">
    <link rel="stylesheet" type="text/css" href="${css}" />
  </head>
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root">${content}</div>
    <script>window.__REACT_REDUX_PAYLOAD__ = ${serialize(storeData, {
      isJSON: true
    })}</script>
    <script type="text/javascript" src='${js}'></script>
  </body>
</html>
`;
