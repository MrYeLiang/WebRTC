'use strict'

var localVideo = document.querySelector('video#localvideo');
var remoteVideo = document.querySelector('video#remotevideo');

var btnConn = document.querySelector('button#connserver');
var btnLeave = document.querySelector('button#leave');

var offer = document.querySelector('textarea#offer')
var answer = document.querySelector('textarea#answer');

var shareDeskBox = document.querySelector('input#shareDesk');

var pcConfig = {
	'iceServers':[{
		'urls' : 'turn:stun.al.learning.cn:3478',
		'credential': "mypassword",
		'username':"garrylea"
	}]
};

var localStream = null;
var remoteStream = null;

var pc = null;

var roomid;
var socket = null;

var offerdesc = null;
var state = 'init';

// 以下代码是从网上找的
//=========================================================================================

//如果返回的是false说明当前操作系统是手机端，如果返回的是true则说明当前的操作系统是电脑端
function IsPC() {
	var userAgentInfo = navigator.userAgent;
	var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
	var flag = true;

	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			flag = false;
			break;
		}
	}

	return flag;
}

//如果返回true 则说明是Android  false是ios
function is_android() {
	var u = navigator.userAgent, app = navigator.appVersion;
	var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
	var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
	if (isAndroid) {
		//这个是安卓操作系统
		return true;
	}

	if (isIOS) {
      　　//这个是ios操作系统
     　　 return false;
	}
}

//获取url参数
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

//=======================================================================

function getRemoteStream(e){
	remoteStream = e.streams[0];
	remoteVideo.srcObject = e.streams[0];
}

function sendMessage(roomid, data){
	console.log('send message to other end', "roomid = ",roomid, "data = ",data);
	if(!socket){
		console.log('socket is null');
	}
	socket.emit('message', roomid, data);
}

function createPeerConnection(){
	console.log('create RTCPeerConnection!');
	if(!pc){
		pc = new RTCPeerConnection(pcConfig);

		pc.onicecandidate = (e)=>{
			if(e.candidate){
				sendMessage(roomid, {
					type : 'candidate',
					label : event.candidate.sdpMLineIndex,
					id:event.candidate.sdpMid,
					candidate:event.candidate.candidate
				});
			}else {
				console.log('this is the end candidate');
			}
		}

		pc.ontrack = getRemoteStream;
	} else {
		console.waring('the pc have be created!');
	}

	return;
}

function bindTracks(){
	console.log('bind tracks into RTCPeerConnection!');

	if(pc === null || pc === undefined){
			console.error('pc is null or undefined!');
			return;
	}

	if(localStream === null || localStream === undefined){
		console.error('localStream is null or undefined!');
		return;
	}

	localStream.getTracks().forEach((track)=>{
		pc.addTrack(track, localStream);
	});
}

function createAnswerSuc(desc){
	pc.setLocalDescription(desc);

	answer.value = desc.sdp;

	sendMessage(roomid, desc);
}

function createOfferSuc(desc){
	pc.setLocalDescription(desc);
	offer.value = desc.sdp;
	offerdesc = desc;

	//send offer sdp
	sendMessage(roomid, offerdesc);
}

function createOfferFail(err){
	console.error('Failed to create answer:', err);
}

function call(){
	if(state === 'joined_conn'){
		var offerOptions = {
			offerToRecieveAudio : 1,
			offerToRecieveVideo : 1
		}

		pc.createOffer(offerOptions)
		.then(createOfferSuc)
		.catch(createOfferFail);
	}
}

function closeLocalMedia(){
	if(localStream && localStream.getTracks()){
		localStream.getTracks().forEach((track) => {
			track.stop();
		});
	}
	localStream = null;
}

function conn(){
	//3 ===============连接信令服务器，并设置回调方法===============
	socket = io.connect();
	socket.on("joined", (roomid, id) => {
		state = 'joined'

		createPeerConnection();
		bindTracks();

		btnConn.disabled = true;
		btnLeave.disabled = false;
		console.log('receive joined message, state = ',state,",roomid = ",roomid, ",id = ",id);
	});

	socket.on('otherjoin', (roomid) =>{
		if(state === 'joined_unbind'){
				createPeerConnection();
				bindTracks();
		}
		state = 'joined_conn';
		call();

		console.log('receive other_joined message, state = ', state);
	});

	socket.on('full',(roomid, id) => {
		console.log('receive full message ', roomid, id);
		hangup();
		closeLocalMedia();
		state = 'leaved';
		console.log('receive full message, state = ',state);
		alert('the room is full! ');
	})

	socket.on('leaved', (roomid, id) =>{
		console.log('receive leaved message', roomid, id);

		state = 'leaved';
		socket.disconnect();
		
		console.log('receive leaved message, state = ', state);

		btnConn.disabled = false;
		btnLeave.disabled = true;
	});

	socket.on('bye', (room,id)=>{
		console.log('receive bye message', roomid, id);

		state = 'joined_unbind';
		hangup();
		offer.value = '';
		answer.value = '';
		console.log('receive bye message, state = ', state);
	})

	socket.on('disconnect', (socket)=>{
		console.log('receive disconnect message!', roomid);

		if(!(state === 'leaved')){
			hangup();
			closeLocalMedia();
		}

		state = 'leaved';
	});

	socket.on('message', (roomid, data) => {

		if(data === null || data === undefined){
				console.err('the message is invalid!');
				return;
		}

		if(data.hasOwnProperty('type') && data.type === 'offer'){
			console.log('receive offer', roomid, data);
			offer.value = data.sdp;

			pc.setRemoteDescription(new RTCSessionDescription(data));

			//create answer
			pc.createAnswer()
			.then(createAnswerSuc)
			.catch(handleAnswerError);
		}else if(data.hasOwnProperty('type') && data.type === 'answer'){
			console.log('receive answer', roomid, data);

			answer.value = data.sdp;
			pc.setRemoteDescription(new RTCSessionDescription(data));
		}else if(data.hasOwnProperty('type') && data.type === 'candidate'){
			console.log('receive candidate', roomid, data);

			var candidate = new RTCIceCandidate({
				sdpMLineIndex: data.label,
				candidate:data.candidate
			});
			pc.addIceCandidate(candidate);
		}else{
			console.log('the message is invalid', data);
		}
	});

	roomid = getQueryVariable('room');
	socket.emit('join', roomid);
	return true;
}


function getMediaStream(stream){
	if(localStream){
		stream.getAudioTracks().forEach((track)=>{
			localStream.addTrack(track);
			stream.removeTrack(track);
		})
	} else {
		localStream = stream;
	}

	//2 ===============显示本地视频===============
	localVideo.srcObject = localStream;
	conn();
}

function handleError(){
	console.error("Failed to get Media Stream!", err);
}

function shareDesk(){
	if(IsPC()){
		navigator.mediaDevices.getDisplayMedia({video:true})
		.then(getDeskStream)
		.catch(handleError);

		return true;
	}

	return false;
}

function start(){
	if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
		console.error('the getUserMedia is not supported!');
		return;
	}else {
		//1 ===============配置音视频参数===============
		var constraints;

		if(shareDeskBox.checked && shareDesk()){
			constraints = {
				video : false,
				audio : {
					echoCancellation : true,
					noiseSuppression : true,
					autoGainControl : true
				}
			}
		}else{
			constraints = {
				video : true,
				audio : {
					echoCancellation : true,
					noiseSuppression : true,
					autoGainControl : true
				}
			}

			navigator.mediaDevices.getUserMedia(constraints)
				.then(getMediaStream)
				.catch(handleError);
		}
	}
}

function leave(){
	if(socket){
		socket.emit('leave', roomid);
	}

	hangup();
}

function hangup(){
	if(pc){
		offerdesc = null;
		pc.close();
		pc = null;
	}
}

function connSignalServer(){
	//开启本地视频
	start();

	return true;
}


btnConn.onclick = connSignalServer;
btnLeave.onclick = leave;


