var http = require('http');
var url = require('url');
var query = require('querystring');
var fs = require('fs');
var requestHandler = require('request');

var port = process.env.PORT || process.env.NODE_PORT || 3000;

var index = fs.readFileSync(__dirname + "/../client/index.html");

var responseHeaders = {  
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "Content-Type, accept",
    "access-control-max-age": 10,
    "Content-Type": "application/json"
};

function onRequest(req, res) {
    var parsedURL = url.parse(req.url);
    var params = query.parse(parsedURL.query);
    
    console.dir(parsedURL.pathname);
    console.dir(params);
    
    if (parsedURL.pathname === "/userSearch") {
        var term = "https://myanimelist.net/malappinfo.php?u=" + params.term + "&status=all&type=anime";
        res = userSearch(req, res, term);
    }
    else {
        res.writeHead(200, {"Content-Type" : "text/html"});
        res.write(index);
        res.end();
    }
}

function userSearch(req, res, params) {
    
    console.log("Term: ");
    console.dir(params);
    
    try {
        res.writeHead(200, responseHeaders);
        
        requestHandler(params).pipe(res);
    }
    catch(exception) {
        console.dir(exception);
        
        res.writeHead(500, responseHeaders);
        
        var responseMessage = {
            message: "Error connnecting to server. Check url and arguments for proper formatting"
        }
        
        res.write(JSON.stringify(responseMessage));
        
        res.end();
    }
    return res;
}

http.createServer(onRequest).listen(port);

console.log("Listening on localhost:" + port);