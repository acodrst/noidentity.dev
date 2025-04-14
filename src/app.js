document.body.insertAdjacentHTML("beforeend", site.page);
const style = document.createElement("style");
style.textContent = site.css;
document.head.appendChild(style);
document.getElementById("mqtt_text").value=localStorage.getItem('mqtt_broker') || 'wss://broker.emqx.io:8084/mqtt'
localStorage.setItem('mqtt_broker',document.getElementById("mqtt_text").value)
document.getElementById("topic_text").value=localStorage.getItem('topic') || self.crypto.randomUUID();
localStorage.setItem('topic',document.getElementById("topic_text").value)
const client = mqtt.connect(localStorage.getItem('mqtt_broker'),{clean:true,clientId:localStorage.getItem('client_id'),connectTimeout:1000});
client.on("connect", function () {
  console.log(`Connected to:${localStorage.getItem('mqtt_broker')}`);
  client.subscribe(localStorage.getItem('topic'), function (err) {
    if (!err) {
    }
  });
});
const cur_map = localStorage.getItem("gs_map_Top")||`:: level\nTop\n
:: processes
Find Water Location
:: back
Human/Cultural Memory`
localStorage.setItem('gs_map_Top',cur_map)
client.on('message', function (topic, message) {
  localStorage.setItem('gs_map_Top',`${localStorage.getItem('gs_map_Top').trim()}\n${message.toString()}`)
    update_top('map') 
})
import mqtt from "mqtt/dist/mqtt.esm";
import { model_to_dots } from "text-model-dot";
import { gsdot_svg } from "gsdot-svg";
import fileSaver from "file-saver";
function update_top(kind) {
  const dots = model_to_dots(localStorage.getItem("gs_map_Top"), false).dots;
    gsdot_svg(dots["Top"], "default", kind).then((svg) =>
      localStorage.setItem("svg_content", svg)
    );
}
document.getElementById("save").addEventListener("click", (e) => {
  if (
    document.getElementById("map").style.display == "block" ||
    document.getElementById("key").style.display == ""
  ) {
    const save_name = prompt(
      "Enter the file name for saving the map in SVG format. This will save to your browser's download folder.",
      "logical_map.svg",
    );
    const blob_content = new Blob([localStorage.getItem("svg_content")], {
      type: "text/plain;charset=utf-8",
    });
    if (!(save_name === null)) fileSaver.saveAs(blob_content, save_name);
  }
  if (document.getElementById("key").style.display == "block") {
    const head =
      `<!DOCTYPE html><html lang="en"><head><style>table{ border: 2px solid; border-collapse: collapse;}
td{border: 2px solid; padding:7px;font-family: monospace;font-size:20px;}</style><title>Logical Map Key</title></head>`;
    const save_name = prompt(
      "Enter the file name for saving the key in HTML format. This will save to your browser's download folder.",
      "logical_map_key.html",
    );
    const blob_content = new Blob([
      `${head}\n${document.getElementById("key").innerHTML}</html>`,
    ], {
      type: "text/plain;charset=utf-8",
    });
    if (!(save_name === null)) saveAs(blob_content, save_name);
  }
});
update_top("map");
document.getElementById("key_toggle").addEventListener("click", () => {
  document.getElementById("legal").style.display = "none";
  if (
    document.getElementById("key").style.display == "none" ||
    document.getElementById("key").style.display == ""
  ) {
    document.getElementById("key").style.display = "block";
    document.getElementById("map").style.display = "none";
    update_top("key");
  } else {
    document.getElementById("key").style.display = "none";
    document.getElementById("map").style.display = "block";
    update_top("map");
  }
});
document.getElementById("home").addEventListener("click", () => {
  document.getElementById("key").style.display = "none";
  document.getElementById("map").style.display = "block";
  document.getElementById("legal").style.display = "none";
});
document.getElementById("legal_view").addEventListener("click", () => {
  document.getElementById("key").style.display = "none";
  document.getElementById("map").style.display = "none";
  document.getElementById("legal").style.display = "block";
});
document.getElementById("export").addEventListener("click", () => {
  const save_name = prompt(
    "Enter the file name for the graph stack format text export. This will save to your browser's download folder.",
    "gs_full.txt",
  );
  let blob = new Blob([localStorage.getItem("gs_map_Top")], {
    type: "text/plain;charset=utf-8",
  });
  if (!(save_name === null)) saveAs(blob, save_name);
});
document.getElementById("gs_text").addEventListener("keypress", (e) => {
  if (e.key=="Enter"){
      client.publish(localStorage.getItem('topic'), e.target.value.trim());
  }
});
document.getElementById("mqtt_text").addEventListener("input", (e) => {
  localStorage.setItem('mqtt_broker',e.target.value)
});
document.getElementById("topic_text").addEventListener("input", (e) => {
  localStorage.setItem('topic',e.target.value)
});
document.getElementById("import").addEventListener("click", (e) => { document.getElementById("file").click() })
document.getElementById("file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.clear();
    localStorage.setItem("gs_map_Top", reader.result);
    update_top("map");
  };
  reader.readAsText(file);
});
