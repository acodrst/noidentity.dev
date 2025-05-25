import { model_to_dots } from "text-model-dot";
import mqtt from "mqtt/dist/mqtt.esm";
import { gsdot_svg } from "gsdot-svg";
import fileSaver from "file-saver";
import { verifyEvent } from "nostr-tools/pure";
document.body.insertAdjacentHTML("beforeend", site.page);
const style = document.createElement("style");
style.textContent = site.css;
document.head.appendChild(style);
document.getElementById("mqtt_text").value =
  localStorage.getItem("mqtt_broker") || "wss://broker.emqx.io:8084/mqtt";
localStorage.setItem("mqtt_broker", document.getElementById("mqtt_text").value);
document.getElementById("topic_text").value = localStorage.getItem("topic") ||
  self.crypto.randomUUID();
localStorage.setItem("topic", document.getElementById("topic_text").value);
const client = mqtt.connect(localStorage.getItem("mqtt_broker"), {
  clean: true,
  clientId: localStorage.getItem("client_id"),
  connectTimeout: 1000,
});
client.on("connect", function () {
  console.log(`Connected to:${localStorage.getItem("mqtt_broker")}`);
  client.subscribe(localStorage.getItem("topic"), function (err) {
    if (!err) {
    }
  });
});
const cur_map = localStorage.getItem("gs_map_Top") || `:: level\nTop\n
:: processes
Find Water Location
:: back
Human/Cultural Memory`;
localStorage.setItem("gs_map_Top", cur_map);
client.on("message", function (topic, message) {
  const mess_string = message.toString();
  if (mess_string.match(/^\{.+\}$/)) {
    const mess = JSON.parse(mess_string);
    if (verifyEvent(mess)) {
      localStorage.setItem(
        "gs_map_Top",
        `${localStorage.getItem("gs_map_Top").trim()}\n${
          JSON.parse(mess_string).content
        }`,
      );
    } else {
      localStorage.setItem(
        "gs_map_Top",
        ":: level\nTop\n:: processes\nInvalid message",
      );
    }
  } else {localStorage.setItem(
      "gs_map_Top",
      `${localStorage.getItem("gs_map_Top").trim()}\n${mess_string}`,
    );}
  update_top("map");
});
function update_top(kind) {
  const levs = model_to_dots(localStorage.getItem("gs_map_Top"), false);
  gsdot_svg(levs["Top"].dots, "default", kind, "Top", levs).then((svg) =>
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
function select(d) {
  for (let i of ["map", "key", "legal"]) {
    if (i == d) document.getElementById(i).style.display = "block";
    else document.getElementById(i).style.display = "none";
  }
}
update_top("map");
document.getElementById("key_toggle").addEventListener("click", () => {
  select("key");
  update_top("key");
});
document.getElementById("home").addEventListener("click", () => {
  select("map");
  update_top("map");
});
document.getElementById("legal_view").addEventListener("click", () => {
  select("legal");
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
document.getElementById("gs_text").addEventListener("input", async (e) => {
  if (e.data) {
    if (e.data.includes("`")) {
      const ss = e.target.selectionStart;
      const val = e.target.value.slice(0, ss - 1) + e.target.value.slice(ss);
      e.target.value = val;
      e.target.selectionEnd = ss - 1;
      if (globalThis.nostr) {
        const pub = await globalThis.nostr.getPublicKey();
        const signed_event = await globalThis.nostr.signEvent({
          "pubkey": pub,
          "created_at": Math.floor(Date.now() / 1000),
          "kind": 1,
          "tags": [],
          "content": val.trim(),
        });
        client.publish(
          localStorage.getItem("topic"),
          JSON.stringify(signed_event),
        );
      } else {
        client.publish(localStorage.getItem("topic"), val.trim());
      }
    }
  }
});
document.getElementById("mqtt_text").addEventListener("input", (e) => {
  localStorage.setItem("mqtt_broker", e.target.value);
});
document.getElementById("topic_text").addEventListener("input", (e) => {
  localStorage.setItem("topic", e.target.value);
});
document.getElementById("import").addEventListener("click", (e) => {
  document.getElementById("file").click();
});
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
