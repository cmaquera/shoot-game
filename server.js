'use strict';
var serverPort = process.env.PORT||1337;
var http = require('http').createServer(MyServer);
var fs = require('fs');
var io = require('socket.io').listen(http);
var nSight=0;

var contentTypes={
    ".html":"text/html",
    ".css":"text/css",
    ".js":"application/javascript",
    ".png":"image/png",
    ".jpg":"image/jpeg",
    ".ico":"image/x-icon",
    ".m4a":"audio/mp4",
    ".oga":"audio/ogg"
};

http.listen(parseInt(serverPort,10), function(){
    console.log('Server is listening on port ' + serverPort);
});

function MyServer(request,response){
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';
    
    var extname = filePath.substr(filePath.lastIndexOf('.'));
    var contentType = contentTypes[extname];
    if(!contentType)
        contentType = 'application/octet-stream';
    console.log((new Date()) + ' Serving ' + filePath + ' as ' + contentType);
        
    fs.exists(filePath, function(exists){
        if(exists){
            fs.readFile(filePath, function(error, content){
                if(error){
                    response.writeHead(500, { 'Content-Type': 'text/html' });
                    response.end('<h1>500 Internal Server Error</h1>');
                }
                else{
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else{
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.end('<h1>404 Not Found</h1>');
        }
    });
}

io.sockets.on('connection', function(socket){
    socket.player = nSight++;
    io.sockets.emit('sight', socket.player, 0, 0);
    console.log(socket.id + ' connected as player ' + socket.player);






    socket.on('mySight', function(x, y){
        io.sockets.emit('sight', socket.player, x, y);
    });
    
    socket.on('disconnect', function(){
        io.sockets.emit('sight', socket.player, null, null);
        console.log('Player' + socket.player + ' disconnected.');
    });
});

