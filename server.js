const express = require('express');
const webServer = express();
webServer.use('',express.static('./'));
var server = webServer.listen(5000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});