var db = new Pouch('todos');
var remoteCouch = false;
var cookie;

function addTodo(text) {
	var todo = {
		title: text,
		completed: false
	};
	db.post(todo, function(err, result) {
		if (!err) {
		console.log('Successfully posted a todo!');
		}
	});
}

function sync() {
	console.log('syncing');
	var remote = new PouchDB(remoteCouch, {headers: {'Cookie': cookie}});
	var pushRep = db.replicate.to(remote, {
		continuous: true,
		complete: syncError
	});
	var pullRep = db.replicate.from(remote, {
		continuous: true,
		complete: syncError
	});
}

// EDITING STARTS HERE (you dont need to edit anything below this line)

// There was some form or error syncing
function syncError() {
	console.log('sync error');
}


db.allDocs({include_docs: true}, function(err, doc) {
	doc.rows.forEach(
		function(doc){
			doc._deleted = true;
			return db.remgiove(doc);
		}
	);
	console.log(doc);
});

db.allDocs({include_docs: true}, function(err, doc) {
	console.log(doc);
});

let type;
let video;
let handPose;
let predictions = [];


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
		predictions = results;
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

	if (predictions.length > 0) {
		drawKeypoints();
	}
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
	for (let i = 0; i < predictions.length; i += 1) {
		const prediction = predictions[i];
		for (let j = 0; j < prediction.landmarks.length; j += 1) {
		const keypoint = prediction.landmarks[j];
		fill(0, 255, 0);
		noStroke();
		ellipse(keypoint[0], keypoint[1], 10, 10);
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
