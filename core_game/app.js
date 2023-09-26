// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
Adapted from:
ml5 Example
PoseNet example using p5.js
Available at https://ml5js.org
=== */
let type;
let video;
let handPose;


function setup() {
	console.log("inside setup");
	let canvas = createCanvas(640, 480);
	canvas.parent('login_canvas');

	constraints = {
		video: {
			width: { max: 640 },
			height: { max: 480 },
			facingMode: {
				ideal: 'environment'
			}
		}
	};

	video = createCapture(constraints);
	video.size(width, height);
	handPose = ml5.handpose(video, modelReady);

	
	handPose.on('hand', function(results) {
		poses = results;
	});

	// Hide the video element, and just show the canvas
	video.hide();

	textFont('Open Sans');
	textSize(22);
}

function saveImage() {
	saveCanvas(canvas, 'snapshot', 'png');
}

function modelReady() {
	select('#status').style('color', '#4A5568');
	select('#status').html('Ready!✔ <i class="fas fa-check-circle" style="color:#4A5568;"></i>');
}
function draw() {
	
	clear();
	image(video, 0, 0, width, height);

	fill('white');
	strokeWeight(0);
	stroke('#A0AEC0');
	rectMode(CENTER);
	rect(45, 24, 60, 25, 15);

	fill('#4A5568');
	noStroke();
	textSize(30);
	textAlign(CENTER, CENTER);
	textStyle(BOLD);
	textFont('sans-serif');
}

function drawEllipse(leftx, lefty, rightx, righty,squatPos) {
	noFill();
	if (squatPos == 0) {
		strokeWeight(2)
		stroke('red');
	}else if (squatPos == 1) {
		strokeWeight(8);
		stroke('cyan')
	}
	xpoint = (leftx + rightx) / 2
	ypoint = (lefty + righty) / 2
	diameter = Math.sqrt(Math.pow(rightx-leftx, 2) + Math.pow(righty-lefty, 2));
	ellipse(xpoint, ypoint-(diameter*1.2), diameter*0.75, diameter*0.2);
 }

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
	// Loop through all the poses detected
	for (let i = 0; i < poses.length; i++) {
		// For each pose detected, loop through all the keypoints
		let pose = poses[i].pose;
		for (let j = 0; j < pose.keypoints.length; j++) {
			// A keypoint is an object describing a body part (like rightArm or leftShoulder)
			let keypoint = pose.keypoints[j];
			// Only draw an ellipse is the pose probability is bigger than 0.2
			if (keypoint.score > 0.5) {
				push();
				fill('rgba(255,255,255, 0.5)');
				noStroke();
				ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
				pop();
			}
		}
	}
}

// A function to draw the skeletons
function drawSkeleton(squatPos, backPos, upPos, kneePos) {
	// Loop through all the skeletons detected
	for (let i = 0; i < poses.length; i++) {
		let skeleton = poses[i].skeleton;
		// stroke('rgb(0,255,0)'); //to green
		// For every skeleton, loop through all body connections
		for (let j = 0; j < skeleton.length; j++) {
			let partA = skeleton[j][0];
			let partB = skeleton[j][1];
			push();
			if (squatPos > 0) {
				stroke('green');
				strokeWeight(6);
			}else {
				stroke('red')
				strokeWeight(1);
			}
			line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
			pop();
		}
	}
	
}
