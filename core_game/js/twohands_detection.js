var db = new Pouch('todos');
var remoteCouch = false;
var cookie;

let user_results = [];

const videoElementOfUser = document.getElementsByClassName('input_video')[0];
const videoElementOfDemo = document.getElementsByClassName('demo_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

let started = false, startTime = -1;
let points = 0;

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
  postureAnalysis(results);
  canvasCtx.restore();
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

function finaliseLevel(){
  //alert user
  alert("you are done!");
  //update database
  let username = window.location.search.split("=")[1];
  console.log(username);
  db.allDocs({include_docs: true, startkey: username, endkey: username}, function(err, doc) {
    doc.rows.forEach(
      function(doc){
        doc = doc.doc;
        console.log(doc);
        doc.playTime += Math.min(Math.ceil((Date.now() - startTime) / (1000 * 60)), 1);
        doc.score = Math.max(doc.score, points);
        return db.put(doc);
      }
    );
  });
  //redirect
  window.location.replace("./login.html");
}


function calculateAngle(a, b, c) {
  a = [a["x"], a["y"]]; // First
  b = [b["x"], b["y"]]; // Mid
  c = [c["x"], c["y"]]; // End

  const radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
      angle = 360 - angle;
  }

  return angle;
}

function postureAnalysis(results){
  if (results.multiHandLandmarks.length == 2) {
    let firstlandmarks = results.multiHandLandmarks[0];
    let seclandmarks = results.multiHandLandmarks[1];
  
    // thumb (432), index(765), middle(11109), ring(151413), pinky(191817) 
    const thumb1 = calculateAngle(firstlandmarks[4], firstlandmarks[3], firstlandmarks[2]);
    const thumb2 = calculateAngle(seclandmarks[4], seclandmarks[3], seclandmarks[2]);
    const index1 = calculateAngle(firstlandmarks[7], firstlandmarks[6], firstlandmarks[5]);
    const index2 = calculateAngle(seclandmarks[7], seclandmarks[6], seclandmarks[5]);
    const middle1 = calculateAngle(firstlandmarks[11], firstlandmarks[10], firstlandmarks[9]);
    const middle2 = calculateAngle(seclandmarks[11], seclandmarks[10], seclandmarks[9]);
    const ring1 = calculateAngle(firstlandmarks[15], firstlandmarks[14], firstlandmarks[13]);
    const ring2 = calculateAngle(seclandmarks[15], seclandmarks[14], seclandmarks[13]);
    const pinky1 = calculateAngle(firstlandmarks[19], firstlandmarks[18], firstlandmarks[17]);
    const pinky2 = calculateAngle(seclandmarks[19], seclandmarks[18], seclandmarks[17]);

  };
};
