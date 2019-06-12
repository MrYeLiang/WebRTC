'use strict'

var http = require('http');
var https = require('https');
var fs = require('fs');

var express = require('express');
var serveIndex = require('serve-index');

//socket.io
var socketIo = require('socket.io');

//
var log4js = require('log4js');

log4js.configure({
    appenders: {
        file: {
            type: 'file',
            filename: 'app.log',
            layout: {
                type: 'pattern',
                pattern: '%r %p - %m',
            }
        }
    },
    categories: {
       default: {
          appenders: ['file'],
          level: 'debug'
       }
    }
});

var logger = log4js.getLogger();

var app = express();
app.use(serveIndex('./public'));
app.use(express.static('./public'));

//http server
var http_server = http.createServer(app);
http_server.listen(80, '0.0.0.0');

var options = {
	key : fs.readFileSync('./cert/test.key'),
	cert: fs.readFileSync('./cert/test.pem')
}

//https server
var https_server = https.createServer(options, app);

//bind socket.io with https_server
var https_socket = socketIo.listen(https_server);
var http_socket = socketIo.listen(http_server);

//connection
https_socket.sockets.on('connection', (socket)=>{

	socket.on('message', (room, data)=>{
		https_socket.to(room).emit('message', room, socket.id, data)//房间内所有人,除自己外
	});

	//该函数应该加锁
	socket.on('join', (room)=> {

		socket.join(room);

		var myRoom = https_socket.sockets.adapter.rooms[room];
		var users = Object.keys(myRoom.sockets).length;

		logger.log('the number of user in room is: ' + users);

		//在这里可以控制进入房间的人数,现在一个房间最多 2个人
		//为了便于客户端控制，如果是多人的话，应该将目前房间里
		//人的个数当做数据下发下去。
		if(users < 3) {
			socket.emit('joined', room, socket.id);	
			if (users > 1) {
				socket.to(room).emit('otherjoin', room);//除自己之外
			}
		}else {
			socket.leave(room);
			socket.emit('full', room, socket.id);	
		}
	 	//socket.to(room).emit('joined', room, socket.id);//除自己之外
		//io.in(room).emit('joined', room, socket.id)//房间内所有人
	 	//socket.broadcast.emit('joined', room, socket.id);//除自己，全部站点	
	});

	socket.on('leave', (room)=> {
		var myRoom = io.sockets.adapter.rooms[room];
		var users = Object.keys(myRoom.sockets).length;
		//users - 1;

		logger.log('the number of user in room is: ' + (users-1));

		socket.leave(room);
		socket.to(room).emit('bye', room, socket.id)//房间内所有人,除自己外
	 	socket.emit('leaved', room, socket.id);	
	 	//socket.to(room).emit('joined', room, socket.id);//除自己之外
		//io.in(room).emit('joined', room, socket.id)//房间内所有人
	 	//socket.broadcast.emit('joined', room, socket.id);//除自己，全部站点	
	});

});

//connection
http_socket.sockets.on('connection', (socket)=>{

	socket.on('message', (room, data)=>{
		http_socket.in(room).emit('message', room, socket.id, data)//房间内所有人
	});

	socket.on('join', (room)=> {
		socket.join(room);
		var myRoom = http_socket.sockets.adapter.rooms[room];
		var users = Object.keys(myRoom.sockets).length;
		logger.log('the number of user in room is: ' + users);
	 	socket.emit('joined', room, socket.id);	
	 	//socket.to(room).emit('joined', room, socket.id);//除自己之外
		//io.in(room).emit('joined', room, socket.id)//房间内所有人
	 	//socket.broadcast.emit('joined', room, socket.id);//除自己，全部站点	
	});

	socket.on('leave', (room)=> {
		var myRoom = http_socket.sockets.adapter.rooms[room];
		var users = Object.keys(myRoom.sockets).length;
		//users - 1;

		logger.log('the number of user in room is: ' + (users-1));

		socket.leave(room);
	 	socket.emit('leaved', room, socket.id);	
	 	//socket.to(room).emit('joined', room, socket.id);//除自己之外
		//io.in(room).emit('joined', room, socket.id)//房间内所有人
	 	//socket.broadcast.emit('joined', room, socket.id);//除自己，全部站点	
	});
});

https_server.listen(443, '0.0.0.0');




