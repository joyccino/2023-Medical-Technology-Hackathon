var db = new Pouch('todos');
var remoteCouch = false;
var cookie;

let user_results = [];

const videoElementOfUser = document.getElementsByClassName('input_video')[0];
const videoElementOfDemo = document.getElementsByClassName('demo_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

let started = false, startTime = -1, done = false;

//get data raw
var frameData = JSON.parse(demostvid_data);
var currentDataFrame = 0;
var totalScore = 0;
var count = 0;

function onResults(results) {
  if (!started){
    started = true;
    document.getElementById("board").innerHTML = "SCORE:";
    document.getElementById("score").innerHTML = "0%";
    startTime = Date.now();
    videoElementOfDemo.addEventListener('ended', finaliseLevel, false);
    videoElementOfDemo.play();
  }
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                      {color: '#00FF00', lineWidth: 5});
      drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
    }
  }
  canvasCtx.restore();
  
  if(!done){
    //get closest frame to right now
    var timeOffset = Date.now() - startTime;
    //increment framecount if necessary
    while (currentDataFrame < frameData.length - 1){
      if (frameData[currentDataFrame + 1].time < timeOffset){
        currentDataFrame += 1;
      } else {
        break;
      }
    }
    //get postures of the current camera and the current dataFrame
    var data = results.multiHandLandmarks;
    var posCamera = {
      left: data.length > 0 ? getBentStraight(data[0]) : [null, null, null, null, null],
      right: data.length > 1 ? getBentStraight(data[1]) : [null, null, null, null, null],
    }
    data = frameData[currentDataFrame].multiHandLandmarks;
    var posDataFrame = {
      left: data.length > 0 ? getBentStraight(data[0]) : [null, null, null, null, null],
      right: data.length > 1 ? getBentStraight(data[1]) : [null, null, null, null, null],
    }
    //calculate score
    count += 1;
    for (var i = 0; i < 5; i++){
      if (posCamera.left[i] == posDataFrame.left[i]){
        totalScore += 10;
      }
      if (posCamera.right[i] == posDataFrame.right[i]){
        totalScore += 10;
      }
    }
    document.getElementById("score").innerHTML = Number.parseFloat(totalScore / count).toFixed(2);
  }
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onResults);

camera = new Camera(videoElementOfUser, {
  onFrame: async () => {
    await hands.send({image: videoElementOfUser});
  },
  width: 1280,
  height: 720
});
camera.start();

let username = window.location.search.split("=")[1];
var user_doc;
db.allDocs({include_docs: true, startkey: username, endkey: username}, function(err, doc) {
	doc.rows.forEach(
		function(doc){
			user_doc = doc.doc;
			console.log(user_doc);
		}
	);
});

async function finaliseLevel(){
  //update database
  done = true;
  user_doc.playTime += (Date.now() - startTime) / (1000 * 60);
  user_doc.score += totalScore / count;
  console.log(user_doc);
  db.put(user_doc);
  //alert user
  document.getElementById("board").innerHTML = "finished!";
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  await sleep(3000);

  //redirect
  window.location.replace("./login.html");
}
