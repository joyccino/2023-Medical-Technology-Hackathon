var db = new Pouch('todos');
var remoteCouch = false;
var cookie;

function addUser(text, score, playTime) {
	var todo = {
		name: text,
    	score: score,
    	playTime: playTime
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

function removeAll(db){
	db.allDocs({include_docs: true}, function(err, doc) {
		doc.rows.forEach(
			function(doc){
				return db.remove(doc);
			}
		);
		console.log(doc);
	});
}

let currently_selected = -1;
let last_selected = -1;
let user_count;
function redrawUserTables(){
	var table = document.getElementById("user_data");
	table.innerHTML = "<thead><tr><th>Username</th><th>Average Score</th><th>Total Playtime</th></tr></thead><tbody></tbody>";
	table = document.getElementById('user_data').getElementsByTagName('tbody')[0];
	user_count = 0;
	db.allDocs({include_docs: true}, function(err, doc) {
		doc.rows.forEach(
			function(doc2){
				doc2 = doc2.doc;
				var row = table.insertRow();
				var name = row.insertCell();
				var score = row.insertCell();
				var playTime = row.insertCell();
				name.innerHTML = doc2.name;
				score.innerHTML = String(doc2.score);
				playTime.innerHTML = String(doc2.playTime);
				user_count += 1;
			}
		);
		if (user_count != 0){
			if (currently_selected == -1 || currently_selected >= user_count){
				currently_selected = 0;
				last_selected = 0;
			}
			highlightSelected();
		} else {
			currently_selected = -1;
			last_selected = -1;
		}
	});
}

function highlightSelected(){
	var table = document.getElementById('user_data').getElementsByTagName('tbody')[0];
	//dehighlight previous
	if (last_selected != -1){
		table.rows[last_selected].className = "";
	}
	//highlight current
	if (currently_selected != -1){
		table.rows[currently_selected].className = "user_selected";
	}
	last_selected = currently_selected;
}

let type;
let video;
let handPose;
let predictions = [];


var newUserDom;
function newUserKeyPressHandler( event ) {
	if (event.keyCode === 13) { //enter key
		addUser(newUserDom.value, 0, 0);
		redrawUserTables();
		newUserDom.value = '';
	}
}

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

	//draw table
	redrawUserTables();

	//adding new user
	newUserDom = document.getElementById('new_user');
	newUserDom.addEventListener('keypress', newUserKeyPressHandler, false);
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
