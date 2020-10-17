import {
  html,
  render,
  useState,
  useEffect,
  useRef,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import ow from "https://unpkg.com/oceanwind";
import "https://unpkg.com/ramda@0.27.1/dist/ramda.js";

document.body.className = ow`min-h-screen bg-purple-500 text-white text-center flex justify-center items-center text-4xl`;

/** @type {HTMLAudioElement} */
const output = document.querySelector("#output");

/** @type {import('ramda')}  */
const R = window.R;
const isAudio = R.propEq("kind", "audioinput");
const filterAudio = R.filter(isAudio);

const audioCtx = new AudioContext();
const numberOfNodes = 16;
const data = new Uint8Array(numberOfNodes * 4);

const analyserNode = new AnalyserNode(audioCtx, {
  fftSize: Math.max(numberOfNodes * 4, 32),
  maxDecibels: -20,
  minDecibels: -100,
  smoothingTimeConstant: 0.8,
});
const connectSource = (source) => source.connect(analyserNode);

const elVisualizer = document.querySelector(".visualizer");

const elNodes = Array.from({ length: numberOfNodes }, (n, i) => {
  let node = document.createElement("div");
  node.className = "node";
  node.style.setProperty("--i", i.toString());
  elVisualizer.appendChild(node);
  return node;
});

function updateVisualizer() {
  requestAnimationFrame(updateVisualizer);

  console.info("setup once, right?");

  analyserNode.getByteFrequencyData(data);

  elNodes.forEach((node, i) => {
    node.style.setProperty("--c", data[i].toString());
    node.style.setProperty(
      "--level",
      (
        (data[i] / 255) *
        // Attempt a log-ish scale for sensitivity in higher registers
        (1 + i / numberOfNodes)
      ).toString()
    );
  });

  //window.volume.textContent = Math.round( (data[0] / 255) * 10) / 10;
}

/**
 * @returns {Promise}
 */
const getDevices = () => navigator.mediaDevices.enumerateDevices().then(filterAudio);
const setDevice = (deviceId) => navigator.mediaDevices.getUserMedia({ audio: { deviceId } });

const USBDevice = () => {
  const [audioDevices, setAudioDevices] = useState([]);
  const [userAudioDevice, setUserAudioDevice] = useState(null);

  /**
   * List devices on mount
   */
  useEffect(() => {
    getDevices().then(setAudioDevices);
  }, []);

  /**
   * Set device when a device is picked
   */
  useEffect(() => {
    if (!userAudioDevice) return;
  }, [userAudioDevice]);

  const setupAudio = (device) => (e) => {
    audioCtx.resume();

    console.info("setup once, right?");

    setUserAudioDevice(device);
    setDevice(device.deviceId)
      .then((stream) => {
        output.srcObject = stream;
        output.play();
        return audioCtx.createMediaStreamSource(stream);
      })
      .then(connectSource)
      .then(updateVisualizer);
  };

  const shouldPickDevice = audioDevices.length > 0 && !userAudioDevice;

  return html`
    <div>
      ${shouldPickDevice &&
      html`<div>
        <h2>Pick a device:</h2>
        <ul>
          ${audioDevices.map(
            (device) => html`<li>
              <button onClick=${setupAudio(device)} type="button">${device.label}</button>
            </li>`
          )}
        </ul>
      </div>`}
    </div>
  `;
};

const app = html`
  <div>
    <h1>USB Audio Testing!</h1>
    <${USBDevice} />
  </div>
`;

render(app, document.querySelector("#app"));
