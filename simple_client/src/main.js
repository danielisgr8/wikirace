import WebSocketEventManager from "./websocket-event-manager.js";

const logEl = document.getElementById("log");

const wsem = new WebSocketEventManager(`ws://${window.location.hostname}:81`);
wsem.onLog = (msg) => logEl.value += `${msg}\n`;

const eventDataGetters = {};
for(const eventEl of document.getElementsByClassName("event")) {
  const eventName = `c_${eventEl.id}`;
  eventDataGetters[eventName] = () => null;
  eventEl.addEventListener("click", () => {
    wsem.sendMessage(eventName, eventDataGetters[eventName]());
  });
}

eventDataGetters["c_join"] = () => ({ name: document.getElementById("name").value });
eventDataGetters["c_reconnect"] = () => JSON.parse(document.getElementById("reconnectText").value);
eventDataGetters["c_setSource"] = () => ({ path: document.getElementById("source").value });
eventDataGetters["c_setDest"] = () => ({ path: document.getElementById("dest").value });
