import {
  getGpuInfo,
  getRobustPublicIP,
  getOSVersion,
  getHashes,
} from "@keqingrong/fingerprint";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
const btoa = (str) => new Buffer.from(str, "binary").toString("base64");
export default async () => {
  // Get the visitor identifier when you need it.
  // Initialize an agent at application startup.
  const fpPromise = FingerprintJS.load();
  const fp = await fpPromise;
  const fpjs = await fp.get();
  const fpcustom = await collectInfo();
  axios
    .post(process.env.PUBLIC_URL + "/done.svg", {
      fp: btoa(JSON.stringify({ fpjs, fpcustom })),
    })
    .then((res) => {
      document.getElementById("expand-image").innerHTML = res.data;
      checkAmbientLight();
    });
};

function collectOSVersion() {
  try {
    return { os_info: getOSVersion() };
  } catch (e) {
    console.log("Error in getGpuInfo", e);
  }
}

function collectGpuInfo() {
  try {
    const { renderer, vendor } = getGpuInfo();
    return { gpuInfo: { renderer, vendor } };
  } catch (e) {
    console.log("Error in getGpuInfo", e);
  }
}

async function collectRobustPublicIP() {
  try {
    let res = await getRobustPublicIP();
    return { ip: { public_ip: res } };
  } catch (e) {
    console.log("Error in getRobustPublicIP", e);
  }
}

async function collectJA3Hash() {
  try {
    let res = await axios.get("https://ja3er.com/json");
    return { tls: { ...res.data } };
  } catch (e) {
    console.log("Error in collectJA3Hash", e);
  }
}

async function collectHashes() {
  try {
    let res = await getHashes();
    return { hashes: { ...res } };
  } catch (e) {
    console.log("Error in getHashes", e);
  }
}

async function collectNetworkInfo() {
  try {
    const { effectiveType, rtt, downlink } = window.navigator.connection;
    return {
      network: {
        effectiveType: effectiveType,
        rtt: rtt,
        downlink: downlink,
      },
    };
  } catch (e) {
    console.log("Error in getNetworkInfo", e);
  }
}

async function checkBattery() {
  try {
    let res = await navigator.getBattery();
    let { chargingTime, charging, dischargingTime, level } = res;
    return { battery: { chargingTime, charging, dischargingTime, level } };
  } catch (e) {
    console.log("Error in checkBattery", e);
  }
}

function checkOrientation() {
  try {
    if ("screen" in window) {
      const scr = window["screen"];
      const { type, angle } = scr.orientation;
      const { height, width, pixelDepth, colorDepth } = scr;
      return {
        screen: {
          ...{ height, width, pixelDepth, colorDepth },
          orientation: { type, angle },
        },
      };
    }
  } catch (e) {
    console.log("Error in checkOrientation", e);
  }
}

async function checkSensors() {
  try {
    let accelerometer_res = await navigator.permissions.query({
      name: "accelerometer",
    });
    let magnetometer_res = await navigator.permissions.query({
      name: "magnetometer",
    });
    let gyroscope_res = await navigator.permissions.query({
      name: "gyroscope",
    });
    return {
      sensors: {
        accelerometer: accelerometer_res.state,
        magnetometer: magnetometer_res.state,
        gyroscope: gyroscope_res.state,
      },
    };
  } catch (e) {
    console.log("Error in checkSensors", e);
  }
}

function checkBrowserMode() {
  return "no";
  //code from this blog https://fingerprintjs.com/blog/incognito-mode-detection/ is not working fine
}

async function checkMediaCapabilities() {
  try {
    if ("mediaCapabilities" in navigator) {
      let contentType = "audio/mp3";
      const audioFileConfiguration = {
        type: "file",
        audio: {
          contentType: contentType,
          channels: 2,
          bitrate: 132700,
          samplerate: 5200,
        },
      };

      let res = await navigator.mediaCapabilities.decodingInfo(
        audioFileConfiguration
      );
      let { supported, smooth, powerEfficient } = res;
      return { mediaCapabilities: { supported, smooth, powerEfficient } };
    }
  } catch (e) {
    console.log("Error in checkMediaCapabilities", e);
  }
}

async function collectInfo() {
  let data = {};
  try {
    data = { ...data, ...collectGpuInfo() };
    data = { ...data, ...collectOSVersion() };
    data = { ...data, ...(await collectRobustPublicIP()) };
    data = { ...data, ...(await collectHashes()) };
    data = { ...data, ...(await collectNetworkInfo()) };
    data = { ...data, ...(await checkSensors()) };
    data = { ...data, ...checkOrientation() };
    data = { ...data, ...checkBrowserMode() };
    data = { ...data, ...(await checkMediaCapabilities()) };
    data = { ...data, ...(await checkBattery()) };
    // data = { ...data, ...(await collectJA3Hash()) };
    return data;
  } catch (e) {
    console.log("collectInfo error: " + e);
  }
}

function checkAmbientLight() {
  try {
    if ("AmbientLightSensor" in window) {
      const sensor = new window["AmbientLightSensor"]();
      sensor.onreading = () => {
        console.log("Current light level:", sensor.illuminance);
        axios.post("/collect", {
          "ambient-light-sensor": sensor.illuminance,
        });
      };
      sensor.onerror = (event) => {
        console.log(event.error.name, event.error.message);
      };
      sensor.start();
    }
  } catch (e) {
    console.log("Error in checkAmbientLight", e);
  }
}
