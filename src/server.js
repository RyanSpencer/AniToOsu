var http = require('http');
var url = require('url');
var query = require('querystring');
var fs = require('fs');
var requestHandler = require('request');

var port = process.env.PORT || process.env.NODE_PORT || 3000;

var index = fs.readFileSync(__dirname + "/../client/index.html");

function onRequest(req, res) {
    var parsedURL = url.parse(req.url);
    var params = query.parse(parsedURL.query);
    
    console.dir(parsedURL.pathname);
    console.dir(params);
    
    //Load the image when it gets passed in
    if (parsedURL.pathname === "/head-logo.png") {
        var file = fs.readFileSync(__dirname + "/../client/head-logo.png");
        res.writeHead(200, {"Content-Type": "image/png"});
        res.end(file, 'binary');
    }
    //If nothing is passed just load the page
    if (parsedURL.pathname === "/") {
        res.writeHead(200, {"Content-Type" : "text/html"});
        res.write(index);
        res.end();
    }
    //When this is passed in the we call the fucntion
    if (parsedURL.pathname === "/userSearch") {
        res = userSearch(req, res, params.term);
    }
}

function userSearch(req, res, params) {
    
    console.log("Term: ");
    console.dir(params);
    
    try {
        //If it can connect then we pipe in the information
      
        var queryString = `
        query($id: String) {
          MediaListCollection(userName: $id, type: ANIME) {
            lists {
              entries {
                media {
                  title {
                    romaji
                    english
                  }
                }
              }
            }
          }  
        }
        `;
      
        var variables = {
          id: params
        };
      
        var url = 'https://graphql.anilist.co',
              options ={
                  method: 'POST',
                  headers: {
                    "Accept": 'application/json',
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    query: queryString,
                    variables: variables,
                  })
              };
      
        requestHandler(url, options).pipe(res)
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