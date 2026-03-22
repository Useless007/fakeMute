import definePlugin from "@utils/types";
import { Logger } from "@utils/Logger";
import { findByProps } from "@webpack";

let spoofMute = false;
let spoofDeafen = false;
let panel: HTMLDivElement | null = null;
let originalSend: any = null;

let onMouseMove: ((e: MouseEvent) => void) | null = null;
let onMouseUp: (() => void) | null = null;

let lastWs: WebSocket | null = null;
let lastVoiceStateJson: any = null;

const logger = new Logger("FakeMute");

export default definePlugin({
    name: "FakeMute",
    description: "Fake Mute/Deafen (Supports Browser + Desktop/Binary).",
    authors: [{ name: "User", id: 0n }],
    start: () => {
        const msgpack = findByProps("pack", "unpack");

        if (!originalSend) {
            originalSend = WebSocket.prototype.send;
        }

        panel = document.createElement("div");
        panel.style.position = "fixed";
        panel.style.bottom = "20px";
        panel.style.right = "20px";
        panel.style.background = "#2f3136";
        panel.style.border = "1px solid #555";
        panel.style.padding = "10px";
        panel.style.borderRadius = "8px";
        panel.style.zIndex = "9999";
        panel.style.color = "white";
        panel.style.fontFamily = "sans-serif";
        panel.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
        panel.innerHTML = `
            <div id="fakeMuteHeader" style="font-weight:bold;margin-bottom:5px;cursor:grab;user-select:none;">🎭 Fake Mute/Deafen</div>
            <button id="fakeMuteBtn" style="background: #4f545c; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer; margin-right: 5px;">🎤 Mute: OFF</button>
            <button id="fakeDeafenBtn" style="background: #4f545c; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer;">🎧 Deafen: OFF</button>
        `;
        document.body.appendChild(panel);

        const header = panel.querySelector("#fakeMuteHeader") as HTMLDivElement;
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        header.onmousedown = (e) => {
            isDragging = true;
            header.style.cursor = "grabbing";
            if (panel) {
                offsetX = e.clientX - panel.getBoundingClientRect().left;
                offsetY = e.clientY - panel.getBoundingClientRect().top;
            }
        };

        onMouseMove = (e: MouseEvent) => {
            if (!isDragging || !panel) return;
            panel.style.right = "auto";
            panel.style.bottom = "auto";
            panel.style.left = `${e.clientX - offsetX}px`;
            panel.style.top = `${e.clientY - offsetY}px`;
        };

        onMouseUp = () => {
            isDragging = false;
            header.style.cursor = "grab";
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        const muteBtn = panel.querySelector("#fakeMuteBtn") as HTMLButtonElement;
        const deafenBtn = panel.querySelector("#fakeDeafenBtn") as HTMLButtonElement;

        const updateButtons = () => {
            if (muteBtn) muteBtn.textContent = `🎤 Mute: ${spoofMute ? "ON" : "OFF"}`;
            if (deafenBtn) deafenBtn.textContent = `🎧 Deafen: ${spoofDeafen ? "ON" : "OFF"}`;
        };

        const pushStateUpdate = () => {
            if (lastWs && lastVoiceStateJson) {
                const payload = JSON.parse(JSON.stringify(lastVoiceStateJson));
                payload.d.self_mute = spoofMute;
                payload.d.self_deaf = spoofDeafen;
                
                let outData;
                if (typeof msgpack !== "undefined" && msgpack.pack) {
                    outData = msgpack.pack(payload);
                    if (outData.buffer) outData = outData.buffer;
                } else {
                    outData = JSON.stringify(payload);
                }
                
                originalSend.call(lastWs, outData);
                logger.info("Sent immediate payload to Discord:", payload);
            } else {
                logger.info("No active VoiceState payload saved yet. Will apply when you join a channel.");
            }
        };

        if (muteBtn) {
            muteBtn.onclick = () => {
                spoofMute = !spoofMute;
                updateButtons();
                logger.info(`Mute toggled: ${spoofMute ? "ON" : "OFF"}`);
                pushStateUpdate();
            };
        }

        if (deafenBtn) {
            deafenBtn.onclick = () => {
                spoofDeafen = !spoofDeafen;
                updateButtons();
                logger.info(`Deafen toggled: ${spoofDeafen ? "ON" : "OFF"}`);
                pushStateUpdate();
            };
        }

        WebSocket.prototype.send = function (data) {
            try {
                let json;
                let isBuffer = false;

                if (typeof data === "string") {
                    json = JSON.parse(data);
                } else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
                    if (msgpack && msgpack.unpack) {
                        json = msgpack.unpack(data instanceof ArrayBuffer ? new Uint8Array(data) : data);
                        isBuffer = true;
                    }
                }

                if (json && json.op === 4 && json.d) {
                    // This is our Voice State Update OP code
                    lastWs = this; // Capture the WebSocket instance handling Voice State
                    lastVoiceStateJson = JSON.parse(JSON.stringify(json));

                    if (typeof json.d.self_mute === "boolean") {
                        json.d.self_mute = spoofMute;
                    }
                    if (typeof json.d.self_deaf === "boolean") {
                        json.d.self_deaf = spoofDeafen;
                    }
                    
                    if (isBuffer) {
                        data = msgpack.pack(json);
                        if (data.buffer) data = data.buffer;
                    } else {
                        data = JSON.stringify(json);
                    }
                    logger.info("Spoofed outgoing voice state:", json);
                }
            } catch (err) {
                logger.warn("Failed to process packet:", err);
            }

            return originalSend.call(this, data);
        };

        logger.info("FakeMute is ready (Hooked WebSocket.send securely)");
    },
    stop: () => {
        if (panel && panel.parentElement) {
            panel.parentElement.removeChild(panel);
            panel = null;
        }

        if (onMouseMove) document.removeEventListener("mousemove", onMouseMove);
        if (onMouseUp) document.removeEventListener("mouseup", onMouseUp);

        onMouseMove = null;
        onMouseUp = null;

        if (originalSend) {
            WebSocket.prototype.send = originalSend;
            originalSend = null;
        }
        
        lastWs = null;
        lastVoiceStateJson = null;
        spoofMute = false;
        spoofDeafen = false;
    }
});
