# (一) 环境搭建
## 2 安装nodejs
brew install nodejs

## 3 安装依赖库
brew install npm   

## 4 创建一个简单的http服务
- require 引入http模块
- 创建http服务
- 监听端口

```
var http = require('http');

var app = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type':'text/plain'});
	res.end('Hello World\n');
}).listen(8080, '0.0.0.0');
```
## 5 启动服务

```
node server.js 
```
至此一个简单的服务端程序就完成了，在浏览器中输入域名和对应的端口好就可以看到屏幕中输出Hello World。

## 6 引入其他模块
功能强大的框架
```
npm install express 
```
批量发布框架
```
npm install  serve-index
```
## 7 创建一个https服务
申请摄像头麦克风的使用权限必须是有https的服务。
```
'use strict'
var https = require('https');
var fs = require('fs');

var options = {
	key :fs.readFileSync('./cert/test.key'),
	cert:fs.readFileSync('./cert/test.pem')
}

var app = https.createServer(options, function(req, res){

	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World!\n');


}).listen(443, '0.0.0.0');
```






