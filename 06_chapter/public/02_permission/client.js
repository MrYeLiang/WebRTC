'use strict'

var audioSource = document.querySelector('select#audioSource');
var audioOutput = document.querySelector('select#audioOutput');
var videoSource = document.querySelector('select#videoSource');

//视频效果标签
var filtersSelect = document.querySelector('select#filter');

//用于拍照的btn和显示截取快照的图片
var snapshort = document.querySelector('button#snapshort');
var picture = document.querySelector('canvas#picture');
picture.width = 320;
picture.height = 240;

var divConstraints = document.querySelector('div#constraints');

//后去到video标签
var videoplay = document.querySelector('video#player');
var audioplay = document.querySelector('audio#audioplayer');

//将流赋值给video标签
function gotMediaStream(stream){
	videoplay.srcObject = stream;
	//audioplay.srcObject = stream;

	//视频的所有轨
	var videoTrack = stream.getVideoTracks()[0];
	var videoConstraints = videoTrack.getSettings();


	divConstraints.textContent = JSON.stringify(videoConstraints, null, 2);

	return navigator.mediaDevices.enumerateDevices();
}

//打印错误日志
function handleError(err){
	console.log('getUserMedia error : ', err);
}

//设备信息数组
function gotDevices(deviceInfos){

	deviceInfos.forEach(function(deviceinfo){
		var option = document.createElement('option');
		option.text = deviceinfo.label;
		option.value = deviceinfo.deviceId;

		if(deviceinfo.kind == 'audioinput'){
				audioSource.appendChild(option);
		}else if(deviceinfo.kind === 'audiooutput'){
				audioOutput.appendChild(option);
		}else if(deviceinfo.kind === 'videoinput'){
				videoSource.appendChild(option);
		}
	})
}

function start(){

	if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
		console.log('getUserMedia is not supported');
		return;
	}else{
		var deviceId = videoSource.value;
		var constraints = {
			 video : {
				//修改视频宽高
				width : 640,
				height : 480,

				//设置帧率
				frameRate : 15,
				facingMode : 'enviroment',
				deviceId : deviceId ? deviceId : undefined
			}, 
			audio : false
		}

		navigator.mediaDevices.getUserMedia(constraints)
		.then(gotMediaStream)
		.then(gotDevices)
		.catch(handleError)
	}

} 

start();


//每次选择时，都会触发start函数
videoSource.onchange = start

filtersSelect.onchange = function(){
	//获取css名字
	videoplay.className = filtersSelect.value;
}

//截取快照事件
snapshort.onclick = function(){
	picture.className = filtersSelect.value;
	picture.getContext('2d').drawImage(videoplay, 0,0, picture.width,picture.height);
}

