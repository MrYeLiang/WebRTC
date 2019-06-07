'use strict'

var audioSource = document.querySelector('select#audioSource');
var audioOutput = document.querySelector('select#audioOutput');
var videoSource = document.querySelector('select#videoSource');

//后去到video标签
var videoplay = document.querySelector('video#player');

//将流赋值给video标签
function gotMediaStream(stream){
	videoplay.srcObject = stream;

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

if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
	console.log('getUserMedia is not supported');
}else{
	var constraints = {
		video : true,
		audio : true
	}

	navigator.mediaDevices.getUserMedia(constraints)
	.then(gotMediaStream)
	.then(gotDevices)
	.catch(handleError)
}