'use strict'

//后去到video标签
var videoplay = document.querySelector('video#player');

//将流赋值给video标签
function gotMediaStream(stream){
	videoplay.srcObject = stream;
}

//打印错误日志
function handleError(err){
	console.log('getUserMedia error : ', err);
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
	.catch(handleError)
}
