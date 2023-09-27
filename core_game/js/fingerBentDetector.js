
let thumbUpValidation = 0;
let thumbDownValidation = 0;
let okValidation = 0;

let STANDARD_GESTURES = {
	ok: [true, false, true, true, true],
	thumb_up: [true, false, false, false, false],
	thumb_down: [true, false, false, false, false]
};

function gestureAnalysisOneHand(results){
	// ok sign?
	let arr = getBentStraight(results.multiHandLandmarks[0]);
	//console.log(arr);
	if (compareToGesture(arr, STANDARD_GESTURES.ok)){
		console.log("ok detected");
		return 0;
	}

	function detectThumb(arr, landmark){
		let wristY = landmark[0].y;
		let thumbTipY = landmark[4].y;
		return wristY > thumbTipY;
	}

	if (compareToGesture(arr, STANDARD_GESTURES.thumb_up, detectThumb, results.multiHandLandmarks[0])){
		// a thumb up?
		console.log("thumb up");
		return 1;
	}

	function detectThumb2(arr, landmark){
		let wristY = landmark[0].y;
		let thumbTipY = landmark[4].y;
		return wristY < thumbTipY;
	}

	if (compareToGesture(arr, STANDARD_GESTURES.thumb_down, detectThumb2, results.multiHandLandmarks[0])){
		// a thumb up?
		console.log("thumb down");
		return 2;
	}

	return -1;
}

function getBentStraight(landmarks){
	return [
		thumbStraight(landmarks),
		indexStraight(landmarks),
		middleStraight(landmarks),
		ringFingerStraight(landmarks),
		pinkyStraight(landmarks),
	]
}

function compareToGesture(arr, gesture, callback=(arr, landmark) => {return true;}, landmark=null){
	for (var i = 0; i < 5; i++){
		if (arr[i] != gesture[i]){
			return false;
		}
	}
	return callback(arr, landmark);
}

function angleFunction(a, b, c) {
	let angle = Math.abs((Math.atan2(a.y - b.y, a.x - b.x) - Math.atan2(c.y - b.y, c.x - b.x)) * (180 / Math.PI));
	if (angle > 200) {
		angle = 360 - angle;
	}
	return angle;
}

function thumbStraight(landmarks){
	if (angleFunction(landmarks[3], landmarks[2], landmarks[1]) >= 170) {
		return true;
	}
	else{
		return false;
	}
	
}
function indexStraight(landmarks){
	if (angleFunction(landmarks[5], landmarks[6], landmarks[7]) >= 170) {
		return true;
	}
	else{
		return false;
	}
}
function middleStraight(landmarks){
	if (angleFunction(landmarks[11], landmarks[10], landmarks[9]) >= 170) {
		return true;
	}
	else{
		return false;
	}
}
function ringFingerStraight(landmarks){
	if (angleFunction(landmarks[15], landmarks[14], landmarks[13]) >= 170) {
		return true;
	}
	else{
		return false;
	}
}
function pinkyStraight(landmarks){
	if (angleFunction(landmarks[19], landmarks[18], landmarks[17]) >= 170) {
		return true;
	}
	else{
		return false;
	}
}
