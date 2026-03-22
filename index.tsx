import definePlugin from "@utils/types";

let originalSend: any = null;
let spoofMute = false;
let spoofDeafen = false;
let panel: HTMLDivElement | null = null;

export default definePlugin({
    name: "FakeMute",
    description: "Fake Mute/Deafen by intercepting WebSocket payloads.",
    authors: [{
        name: "User",
        id: 0n
    }],
    start: () => {
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
            <div style="font-weight:bold;margin-bottom:5px;">🎭 Fake Mute/Deafen</div>
            <button id="fakeMuteBtn" style="background: #4f545c; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer; margin-right: 5px;">🎤 Mute: OFF</button>
            <button id="fakeDeafenBtn" style="background: #4f545c; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer;">🎧 Deafen: OFF</button>
        `;
        document.body.appendChild(panel);

        const muteBtn = panel.querySelector("#fakeMuteBtn") as HTMLButtonElement;
        const deafenBtn = panel.querySelector("#fakeDeafenBtn") as HTMLButtonElement;

        const updateButtons = () => {
            if (muteBtn) muteBtn.textContent = `🎤 Mute: ${spoofMute ? "ON" : "OFF"}`;
            if (deafenBtn) deafenBtn.textContent = `🎧 Deafen: ${spoofDeafen ? "ON" : "OFF"}`;
        };

        muteBtn.onclick = () => {
            spoofMute = !spoofMute;
            updateButtons();
        };

        deafenBtn.onclick = () => {
            spoofDeafen = !spoofDeafen;
            updateButtons();
        };

        WebSocket.prototype.send = function (data) {
            try {
                if (typeof data === "string") {
                    const json = JSON.parse(data);
                    if (json && json.op === 4 && json.d) {
                        if (typeof json.d.self_mute === "boolean") {
                            json.d.self_mute = spoofMute;
                        }
                        if (typeof json.d.self_deaf === "boolean") {
                            json.d.self_deaf = spoofDeafen;
                        }
                        data = JSON.stringify(json);
                        console.log("[FakeMuteDeafen] ส่งปลอม:", data);
                    }
                }
            } catch (err) {
                // Ignore parse errors (e.g. if data is not JSON)
            }

            return originalSend.call(this, data);
        };

        console.log("%c[FakeMuteDeafen] พร้อมใช้งาน (WebSocket v9+)", "color: lime; font-weight: bold;");
    },
    stop: () => {
        if (originalSend) {
            WebSocket.prototype.send = originalSend;
            originalSend = null;
        }
        if (panel && panel.parentElement) {
            panel.parentElement.removeChild(panel);
            panel = null;
        }
        spoofMute = false;
        spoofDeafen = false;
        console.log("%c[FakeMuteDeafen] ปิดการใช้งาน", "color: red; font-weight: bold;");
    }
});
