
let thumbUpValidation = 0;
let thumbDownValidation = 0;
let okValidation = 0;

function gestureAnalysis(results){
	// ok sign?
	if(thumbStraight(results.multiHandLandmarks[0]) && !indexStraight(results.multiHandLandmarks[0]) && middleStraight(results.multiHandLandmarks[0]) && ringFingerStraight(results.multiHandLandmarks[0]) && pinkyStraight(results.multiHandLandmarks[0])) {
		console.log("ok detected");
		thumbUpValidation = 0;
		thumbDownValidation = 0;
		okValidation++;
		return;
	}
	let wristY = results.multiHandLandmarks[0][0].y;
	let thumbTipY = results.multiHandLandmarks[0][4].y;

	if(thumbStraight(results.multiHandLandmarks[0]) && wristY > thumbTipY) {
		// a thumb up?
		console.log("thumb up");
		thumbUpValidation++;
		return;
	}

	else if (thumbStraight(results.multiHandLandmarks[0]) && thumbTipY > wristY) {
		// a thumb down?
		console.log("thumb down");
		thumbDownValidation++;
		return;
	}
}

function angleFunction(a, b, c) {
	let angle = Math.abs((Math.atan2(a.y - b.y, a.x - b.x) - Math.atan2(c.y - b.y, c.x - b.x)) * (180 / Math.PI));
	if (angle > 200) {
		angle = 360 - angle;
	}
	console.log("angle: "+angle);
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