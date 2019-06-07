### 环境搭建
#### 安装nodejs
brew install nodejs

#### 安装依赖库
brew install npm   

#### 创建一个简单的http服务
- require 引入http模块
- 创建http服务
- 监听端口

```
var app = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type':'text/plain'});
	res.end('Hello World\n');
}).listen(8080, '0.0.0.0');
```
#### 启动服务

```
node server.js 
```



