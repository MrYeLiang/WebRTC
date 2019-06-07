### 二进制安装
#### 安装nodejs
brew install nodejs
#### 安装依赖库
brew install npm  

### 源码安装
下载Nodejs源码
生成Makefile
make -j 4 && sudo make install 

### 最简单的http服务
- require 引入http模块
- 创建http服务
- 监听端口----

```
var app = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type':'text/plain'});
	res.end('Hello World\n');
}).listen(8080, '0.0.0.0');
```
#### mac查看监听端口命令

```
netstat -anL
```

或者安装net-tools工具
brew install net-tools

#### 测试服务器是否启动浏览器输入

```
http://10.2.2.113:8080/
```


#### 启动服务

```
node app.js 
```

以这种方式启动，窗口关闭则程序结束

```
nohub node app.js
```

服务端程序运行在后台，日志输出会有问题


```
forever start app.js
```
服务会一直在后台运行
安装forver
npm install forever -g   （-g表示可以在任何目录下执行命令）


