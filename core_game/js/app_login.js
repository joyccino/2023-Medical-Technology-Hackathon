var db = new Pouch('todos');
var remoteCouch = false;
var cookie;

var userExists = function(username){
    return db.get(username).then(function () {
        return Promise.resolve(true);
    }).catch(function () {
        return Promise.resolve(false);
    });
};

function addUser(text, score, playTime) {
	var todo = {
		_id: text,
		name: text,
		score: score,
		playTime: playTime
	};
	db.put(todo, function(err, result) {
		if (!err) {
			console.log('Successfully added a user!');
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
function syncError() {
	console.log('sync error');
}

function removeAll(db){
	db.allDocs({include_docs: true}, function(err, doc) {
		doc.rows.forEach(
			function(doc){
				doc = doc.doc;
				doc._deleted = true;
				db.put(doc);
			}
		);
	});
}
/*
db.allDocs({include_docs: true, startkey: "woah", endkey: "woah"}, function(err, doc) {
	doc.rows.forEach(
		function(doc){
			doc = doc.doc;
			console.log(doc);
		}
	);
});
*/

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
		if (newUserDom.value != ""){
			addUser(newUserDom.value, 0, 0);
		} else {
			/*
			db.allDocs({include_docs: true}, function(err, doc) {
				doc.rows.forEach(
					function(doc){
						//remember this!
						doc = doc.doc;
						console.log(doc);
						doc.playTime += 1;
						doc.score += 1;
						return db.put(doc);
					}
				);
			});
			*/
			alert("username cannot be empty");
		}

		redrawUserTables();
		newUserDom.value = '';
	}
}

let videoElement;
let canvasElement;
let canvasCtx;
let hands;
let camera;
function onResults(results) {
	canvasCtx.save();
	canvasCtx.clearRect(0, 0, canvasElement.width/5, canvasElement.height/5);
	canvasCtx.drawImage(
		results.image, 0, 0, canvasElement.width, canvasElement.height);
	if (results.multiHandLandmarks) {
		for (const landmarks of results.multiHandLandmarks) {
			drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
							{color: '#00FF00', lineWidth: 5});
			drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
		}
	}
	if (results.multiHandLandmarks.length > 0) {
		gestureAnalysis(results.multiHandLandmarks[0]);
	  };
	canvasCtx.restore();
}

//function setup() {
window.onload = function(){
	console.log("inside setup");
	videoElement = document.getElementById("in_video");
	canvasElement = document.getElementById("out_canvas");
	canvasCtx = canvasElement.getContext('2d');

	hands = new Hands({locateFile: (file) => {
		return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
	}});
	hands.setOptions({
		maxNumHands: 1,
		modelComplexity: 1,
		minDetectionConfidence: 0.9,
		minTrackingConfidence: 0.9
	});
	hands.onResults(onResults);
	
	camera = new Camera(videoElement, {
		onFrame: async () => {
			await hands.send({image: videoElement});
		},
		width: 1280,
		height: 720
	});
	camera.start();

	//draw table
	redrawUserTables();

	//adding new user
	newUserDom = document.getElementById('new_user');
	newUserDom.addEventListener('keypress', newUserKeyPressHandler, false);
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