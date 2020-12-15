exports.data = {
  title: 'Hypercore Protocol'
}

exports.render = function (data) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${data.title}</title>

    <!-- SEO -->
    <meta name="Description" content="A fast, scalable, and secure peer-to-peer protocol for everyone.">
    <meta name="keywords" content="decentralization,hypercore,peer-to-peer,p2p,hyperdrive">

    <!-- Social -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:site" content="@HypercoreProto">
    <meta name="twitter:creator" content="@HypercoreProto">
    <meta name="og:title" content="Hypercore Protocol">
    <meta name="og:description" content="A fast, scalable, and secure peer-to-peer protocol for everyone.">
    <meta name="twitter:image" content="https://hypercore-protocol.org/images/hypercore-protocol.png">

    <link rel="stylesheet" type="text/css" href="${data.rootPath}fonts/index.css">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    ${data.content}
    <script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
    <noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt=""></noscript>
  </body>
</html>
`
}