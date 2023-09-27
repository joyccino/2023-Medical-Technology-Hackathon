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
  user_results.push(results);
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

var mediaLinkDom;
mediaLinkDom = document.getElementById('video_url');
mediaLinkDom.addEventListener('keypress', linkEnteredKeyPressHandler, false);

function linkEnteredKeyPressHandler(event){
  if (event.keyCode === 13) { //enter key
		if (mediaLinkDom.value != ""){
			videoElementOfDemo.src = mediaLinkDom.value;
		} else {
      alert("video link cannot be empty");
    }
  }
}

//videoElementOfDemo.src = "../resources/demosvid.mp4";
//videoElementOfDemo.src = "https://github.com/joyccino/2023-Medical-Technology-Hackathon/blob/main/resources/demosvid.mp4";
videoElementOfDemo.onloadeddata = (evt) => {
  user_results.length = 0; //clears the array
  videoElementOfDemo.addEventListener('ended', generateFileDownloadLink, false);
  videoElementOfDemo.play();
  onFrame();
}

var textFile = null,
  makeTextFile = function (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
  };

function generateFileDownloadLink(e){
  var link = document.getElementById('downloadlink');
  console.log(user_results);
  link.href = makeTextFile(JSON.stringify(user_results));
  link.style.display = 'block';
}

function postureAnalysis(results){
  if (results.multiHandLandmarks.length > 0) {
    console.log(results.multiHandLandmarks.length);
  };
};
