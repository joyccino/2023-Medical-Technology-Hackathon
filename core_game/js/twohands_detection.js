let user_results = [];

const videoElementOfUser = document.getElementsByClassName('input_video')[0];
const videoElementOfDemo = document.getElementsByClassName('demo_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onResults(results) {
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

async function onFrame() {
  if (!videoElementOfDemo.paused && !videoElementOfDemo.ended) {
    await hands.send({
      image: videoElementOfDemo
    });
  // https://stackoverflow.com/questions/65144038/how-to-use-requestanimationframe-with-promise    
    await new Promise(requestAnimationFrame);
    onFrame();
  } else
    setTimeout(onFrame, 500);
}
/*
videoElementOfDemo.src = "../resources/demosvid.mp4";
//videoElementOfDemo.src = "https://github.com/joyccino/2023-Medical-Technology-Hackathon/blob/main/resources/demosvid.mp4";
videoElementOfDemo.onloadeddata = (evt) => {
  videoElementOfDemo.play();
  onFrame();
}
*/

camera = new Camera(videoElementOfUser, {
  onFrame: async () => {
    await hands.send({image: videoElementOfUser});
  },
  width: 1280,
  height: 720
});
camera.start();


function postureAnalysis(results){
  if (results.multiHandLandmarks.length > 0) {
    console.log(results.multiHandLandmarks.length);
  };
};
