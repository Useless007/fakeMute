import definePlugin from "@utils/types";
import { Logger } from "@utils/Logger";
import { wreq } from "@webpack";

let spoofMute = false;
let spoofDeafen = false;
let panel: HTMLDivElement | null = null;
let GatewayConnectionProto: any = null;
let originalVoiceStateUpdate: any = null;
let onMouseMove: ((e: MouseEvent) => void) | null = null;
let onMouseUp: (() => void) | null = null;
let currentGateway: any = null;
let lastVoiceState: any = null;

export default definePlugin({
    name: "FakeMute",
    description: "Fake Mute/Deafen by intercepting Discord Gateway voiceStateUpdate natively.",
    authors: [{
        name: "User",
        id: 0n
    }],
    start: () => {
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
            if (currentGateway && originalVoiceStateUpdate && lastVoiceState) {
                const payload = Object.assign({}, lastVoiceState);
                if (spoofMute) payload.selfMute = true;
                if (spoofDeafen) payload.selfDeaf = true;
                originalVoiceStateUpdate.call(currentGateway, payload);
                Logger.log("FakeMute: Sent immediate update to Discord server!", payload);
            } else {
                Logger.log("FakeMute: State saved. Will apply when you join a voice channel.");
            }
        };

        if (muteBtn) {
            muteBtn.onclick = () => {
                spoofMute = !spoofMute;
                updateButtons();
                Logger.log(`[FakeMute] Mute toggled: ${spoofMute ? "ON" : "OFF"}`);
                pushStateUpdate();
            };
        }

        if (deafenBtn) {
            deafenBtn.onclick = () => {
                spoofDeafen = !spoofDeafen;
                updateButtons();
                Logger.log(`[FakeMute] Deafen toggled: ${spoofDeafen ? "ON" : "OFF"}`);
                pushStateUpdate();
            };
        }

        try {
            // Find Discord's GatewayConnection class prototype from Webpack Cache
            if (wreq && wreq.c) {
                for (const key in wreq.c) {
                    const mod = wreq.c[key]?.exports;
                    if (!mod) continue;

                    // Discord modules might be exported directly, or in .Z / .default
                    const target = mod.default || mod.Z || mod;
                    // Check if it's the GatewayConnection prototype that handles voice state
                    if (target && target.prototype && target.prototype.voiceStateUpdate && target.prototype.sendPayload) {
                        GatewayConnectionProto = target.prototype;
                        originalVoiceStateUpdate = GatewayConnectionProto.voiceStateUpdate;
                        
                        // Patch the Gateway's voice state update payload
                        GatewayConnectionProto.voiceStateUpdate = function(args: any) {
                            currentGateway = this;
                            if (args) {
                                lastVoiceState = Object.assign({}, args);
                                if (spoofMute) args.selfMute = true;
                                if (spoofDeafen) args.selfDeaf = true;
                                Logger.log("FakeMute injected fake states:", args);
                            }
                            // Call original native method with modified args
                            return originalVoiceStateUpdate.call(this, args);
                        };
                        Logger.log("Succesfully hooked Discord's Gateway Connection.");
                        break;
                    }
                }
            } else {
                Logger.error("Could not find webpack require (wreq)!");
            }
        } catch (e) {
            Logger.error("Failed to run Webpack search for FakeMute:", e);
        }
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

        // Clean up the patch to prevent memory leak or crash
        if (GatewayConnectionProto && originalVoiceStateUpdate) {
            GatewayConnectionProto.voiceStateUpdate = originalVoiceStateUpdate;
            originalVoiceStateUpdate = null;
            GatewayConnectionProto = null;
        }
        
        spoofMute = false;
        spoofDeafen = false;
    }
});
