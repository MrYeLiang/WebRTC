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
# (二) 设备信息获取

### html代码，用于显示当前设备的信息

```
<html>
	<head>
		<title>WebRTC get audio and video devices</title>
	</head>
	<body>
		<div>
			 <label>audio input device:</label>
             <select id = "audioSource"></select>
		</div>
		<div>
			<label>audio output device:</label>
			<select id = "audioOutput"></select>
		</div>	
		<div>
			<label>video input device:</label>
			<select id = "videoSource"></select>
		</div>
		<script src="client.js"></script>
	</body>
</html>

```
## js代码，用于获取当前设备信息
```
'use strict'
var audioSource = document.querySelector("select#audioSource");
var audioOutput = document.querySelector("select#audioOutput");
var videoSource = document.querySelector("select#videoSource");

if(!navigator.mediaDevices || !navigator.mediaDevices.emurateDevices){
	console.log('emurateDevices is not support!');
}else{
	navigator.mediaDevices.emurateDevices
	.then(gotDevices)
	.catch(handleError);
}

function gotDevices(devicesInfo){
	devicesInfos.forEash(function(deviceInfo)){
		console.log(deviceInfo.kind 
			+ ": label = "+deviceInfo.label
			+ ": id  = " + deviceInfo.deviceId
			+ ": groupId = " + deviceInfo.groupId);

		var option = document.createElement('option');
		option.html = deviceInfo.label;
		option.value = deviceInfo.deviceId;

		if(devicesInfo.kind === 'audioinput'){
				audioSource.appendChild(option);
		}else if(devicesInfo.kind === 'audiooutput'){
				audioOutput.appendChild(option);
		}else if(){
				videoSource.appendChild(option);
		}
	}
}

function handleError(err){
	console.log(err.name + “ ： ” + err.message);
}

```
## js打印结果

```
audioinput: label = : id = default: groupId = c8c3ef9c92cf11acba2a3a50b317b9bf2cf30f5d401f9874445ed51e731ef4bd
client.js:17 audioinput: label = : id = b12c633cd7017ae872295cc07950aa4f72c8dfcbb038481cda0a0ef3d0cc2f09: groupId = c8c3ef9c92cf11acba2a3a50b317b9bf2cf30f5d401f9874445ed51e731ef4bd
client.js:17 videoinput: label = : id = b95c88c72235c31f445c13258cdb2d4ab5a774225b3757281d58b453fc14b0c0: groupId = cb329ecdbf1a92f2eadd2c3c5e6ca0cfbdb6a2ae3f93d5a2967c830444503c4b
client.js:17 audiooutput: label = : id = default: groupId = c8c3ef9c92cf11acba2a3a50b317b9bf2cf30f5d401f9874445ed51e731ef4bd
client.js:17 audiooutput: label = : id = a8c76b962c5b479073378dbde69fcf8edc05f125aa58d885a231bfc608c0cae2: groupId = c8c3ef9c92cf11acba2a3a50b317b9bf2cf30f5d401f9874445ed51e731ef4bd
```
可以看到label没有值，这是因为没有获取到音频设备的权限。
通过下一节调用如下方法即可拿到权限。

## 获取权限方法
```
navigator.mediaDevices.getUserMedia
```









