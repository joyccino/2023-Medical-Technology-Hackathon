var db = new Pouch('todos');
var remoteCouch = false;
var cookie;

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
let user_count = 0;
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
				score.innerHTML = Number.parseFloat(doc2.score).toFixed(2);
				playTime.innerHTML = Number.parseFloat(doc2.playTime).toFixed(2);
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
let upCount = 0;
let downCount = 0;
let okCount = 0;

let action = 0, count = 0;

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
	let res = -1;

	

	if (results.multiHandLandmarks.length > 0) {

		let gesture = gestureAnalysis(results.multiHandLandmarks[0]);

		function move(width) {
			const elem = document.getElementById("myBar");
			elem.style.width = width + "%";
		}

		if (gesture == 0) {
			okCount++;
			upCount = 0;
			downCount = 0;
			if(okCount > 50) {
				okCount = 0;
				// redirect to the game screen now.
				let selectedUser = document.querySelector("tr.user_selected > td:nth-child(1)").innerHTML;
				window.location.href = "index.html?" + encodeURIComponent(selectedUser);
			}
			move(Math.round((okCount / 50) * 100));
		}
		else if (gesture == 1) {
			upCount++;
			okCount = 0;
			downCount = 0;
			if (upCount > 25) {
				upCount = 0;
				let selectedRow = document.querySelector("tr.user_selected");
				let allRows = document.querySelectorAll("table#user_data tbody tr");
  				let selectedIndex = Array.from(allRows).indexOf(selectedRow);
				if (selectedIndex !== -1 && selectedIndex > 0) {
				// 선택된 행이 테이블 내에 있고, 첫 행이 아닌 경우
				selectedRow.classList.remove("user_selected"); // user_selected 클래스 제거
				let prevRow = allRows[selectedIndex - 1]; // 다음 행 선택
				prevRow.classList.add("user_selected"); // user_selected 클래스 추가
				}
				console.log("selected Row "+ selectedIndex);
			}
			move(Math.round((upCount / 25) * 100));

		}
		else if (gesture == 2) {
			downCount ++;
			okCount = 0;
			upCount = 0;
			if(downCount > 25) {
				downCount = 0;
				let selectedRow = document.querySelector("tr.user_selected");
				let allRows = document.querySelectorAll("table#user_data tbody tr");
  				let selectedIndex = Array.from(allRows).indexOf(selectedRow);
				  
				if (selectedIndex !== -1 && selectedIndex < allRows.length - 1) {
					// 선택된 행이 테이블 내에 있고, 마지막 행이 아닌 경우
					selectedRow.classList.remove("user_selected"); // user_selected 클래스 제거
					let nextRow = allRows[selectedIndex + 1]; // 다음 행 선택
					nextRow.classList.add("user_selected"); // user_selected 클래스 추가
				}
				console.log("selected Row "+ selectedIndex);
			}
			move(Math.round((downCount / 25) * 100));
		}
		else {
			okCount = 0;
			upCount = 0;
			downCount = 0;
			move(Math.round((downCount / 25) * 100));

		}
	  };
	canvasCtx.restore();
	//count the things
	if (res != action){
		action = res;
		count = 0;
	} else if (res >= 0) {
		count += 1;
	}
	//activate
	if (count >= 10){
		count = 0;
		switch (res){
			case 0: //ok
				if (user_count != 0){
					var table = document.getElementById('user_data').getElementsByTagName('tbody')[0];
					let username = table.rows[currently_selected].cells[0].innerHTML;
					window.location.replace("./index.html?name=" + username);
				}
				break;
			case 1:
				if (user_count != 0){
					currently_selected = (currently_selected + 1) % user_count;
				}
				redrawUserTables();
				break; 
			case 2:
				if (user_count != 0){
					currently_selected = (currently_selected + user_count - 1) % user_count;
				}
				redrawUserTables();
				break;

		}
	}
}

//function setup() {
window.onload = function(){
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
