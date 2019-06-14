'use strict'

var localVideo = document.querySelector('video#localvideo');
var remoteVideo = document.querySelector('video#remotevideo');

var btnStart = document.querySelector('button#start');
var btnCall = document.querySelector('button#call');
var btnHangup = document.querySelector('button#hangup');

var offerSdpTextarea = document.querySelector('textarea#offer');
var answerSdpTextarea = document.querySelector('textarea#answer');

var localStream;
var pc1;
var pc2;

function getMediaStream(stream){
	localVideo.srcObject = stream;
	localStream = stream;
}

function handleError(err){
	console.error('Failed to get Media Stream!', err);
}

function start(){
	if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
		console.error('the getUserMedia is not supported!');
		return;
	}else {
		var constraints = {
			video:true,
			audio:false
		}

		navigator.mediaDevices.getUserMedia(constraints)
		.then(getMediaStream)
		.catch(handleError);

		btnStart.disabled = true;
		btnCall.disabled = false;
		btnHangup.disabled = true;
	}
}

function getRemoteStream(e){
	remoteVideo.srcObject = e.streams[0];
}

function handleOfferError(err){
	console.error('Failed to create offer: ', err);
}

function handleAnswerError(err){
	console.error('Failed to create answer: ', err);
}

function createAnswerSuc(desc){
	pc2.setLocalDescription(desc);
	answerSdpTextarea.value = desc.sdp;

	//send desc to signal
	// receive desc from signal

	pc1.setRemoteDescription(desc);
}

function createOfferSuc(desc){
	pc1.setLocalDescription(desc);
	offerSdpTextarea.value = desc.sdp;

	//send desc to signal
	//receive desc from signal 

	pc2.setRemoteDescription(desc);

	pc2.createAnswer()
		.then(createAnswerSuc)
		.catch(handleAnswerError);
}

function call(){
	pc1 = new RTCPeerConnection();
	pc2 = new RTCPeerConnection();

	pc1.onicecandidate = (e) =>{
		pc2.addIceCandidate(e.candidate);
	}

	pc2.onicecandidate = (e) =>{
		pc1.addIceCandidate(e.candidate);
	}

	pc2.ontrack = getRemoteStream;
	localStream.getTracks().forEach((track)=>{
		pc1.addTrack(track, localStream);
	});

	var offerOptions = {
		offerToRecieveAudio:0,
		offerToRecieveVideo:1
	}

	pc1.createOffer(offerOptions)
		.then(createOfferSuc)
		.catch(handleOfferError);

	btnCall.disabled = true;
	btnHangup.disabled = false;
}

function hangup(){
	pc1.close();
	pc2.close();
	pc1 = null;
	pc2 = null;

	btnCall.disabled = false;
	btnHangup.disabled = true;
}

btnStart.onclick = start;
btnCall.onclick = call;
btnHangup.onclick = hangup;

















