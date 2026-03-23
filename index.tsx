import definePlugin from "@utils/types";
import { Logger } from "@utils/Logger";
import ErrorBoundary from "@components/ErrorBoundary";
import { findByProps, find } from "@webpack";

import { FakeMuteButton } from "./components/FakeMuteButton";

let spoofMute = false;
let spoofDeafen = false;
let originalSend: any = null;
let lastWs: WebSocket | null = null;
let msgpack: any = null;

const logger = new Logger("FakeMute");

// ─── Exported state accessors (for FakeMuteButton component) ───

export function getSpoofMute() { return spoofMute; }
export function getSpoofDeafen() { return spoofDeafen; }

export function toggleMute() {
    spoofMute = !spoofMute;
    logger.info(`Mute toggled: ${spoofMute}`);
    sendVoiceStateUpdate();
}

export function toggleDeafen() {
    spoofDeafen = !spoofDeafen;
    logger.info(`Deafen toggled: ${spoofDeafen}`);
    sendVoiceStateUpdate();
}

// ─── Voice State Update ───

function sendVoiceStateUpdate() {
    if (!lastWs) {
        logger.warn("No WebSocket connection available, will retry later");
        let retries = 0;
        const maxRetries = 20;
        const interval = setInterval(() => {
            if (lastWs) {
                clearInterval(interval);
                sendVoiceStateUpdateNow();
            } else if (++retries >= maxRetries) {
                clearInterval(interval);
                logger.error("Timeout: No WebSocket available after 10 seconds");
            }
        }, 500);
        return;
    }
    sendVoiceStateUpdateNow();
}

function sendVoiceStateUpdateNow() {
    if (!lastWs) {
        logger.error("No WebSocket connection");
        return;
    }

    const SelectedChannelStore = findByProps("getVoiceChannelId");
    const ChannelStore = findByProps("getChannel", "hasChannel");

    if (!SelectedChannelStore || !ChannelStore) {
        logger.error("Could not find required stores");
        return;
    }

    const currentChannelId = SelectedChannelStore.getVoiceChannelId();
    if (!currentChannelId) {
        logger.warn("Not in a voice channel (no channel id)");
        return;
    }

    const channel = ChannelStore.getChannel(currentChannelId);
    if (!channel) {
        logger.warn("Not in a voice channel (channel not found)");
        return;
    }

    const currentGuildId = channel.guild_id || null;

    const payload = {
        op: 4,
        d: {
            guild_id: currentGuildId,
            channel_id: currentChannelId,
            self_mute: spoofMute,
            self_deaf: spoofDeafen,
        },
    };

    let outData: any;
    if (msgpack && msgpack.pack) {
        outData = msgpack.pack(payload);
        if (outData.buffer) outData = outData.buffer;
    } else {
        outData = JSON.stringify(payload);
    }

    try {
        originalSend.call(lastWs, outData);
        logger.info("Sent voice state update:", payload);
    } catch (err) {
        logger.error("Failed to send voice state update:", err);
    }
}

// ─── Find Existing WebSocket ───

function findExistingWebSocket(): WebSocket | null {
    try {
        const gateway = findByProps("socket", "CONNECTING");
        if (gateway && gateway.socket instanceof WebSocket) {
            return gateway.socket;
        }

        const wsModule = findByProps("ws", "getWS");
        if (wsModule && wsModule.ws instanceof WebSocket) {
            return wsModule.ws;
        }

        const candidate = findByProps("send", "close");
        if (candidate && candidate.send && candidate.close && candidate instanceof WebSocket) {
            return candidate;
        }

        const found = find(m => m?.socket instanceof WebSocket || m?.ws instanceof WebSocket);
        if (found) {
            if (found.socket instanceof WebSocket) return found.socket;
            if (found.ws instanceof WebSocket) return found.ws;
        }

        const native = (window as any).DiscordNative;
        if (native?.gateway?.ws instanceof WebSocket) {
            return native.gateway.ws;
        }

        logger.warn("Could not find existing WebSocket instance");
    } catch (e) {
        logger.warn("findExistingWebSocket error:", e);
    }
    return null;
}

// ─── Plugin Definition ───

export default definePlugin({
    name: "FakeMute",
    description: "Fake Mute/Deafen - Works on Browser & Desktop (Vencord)",
    authors: [{ name: "User", id: 0n }],

    patches: [
        {
            find: '?"BACK_FORWARD_NAVIGATION":',
            replacement: {
                match: /(?<=trailing:.{0,50})\i\.Fragment,(?=\{children:\[)/,
                replace: "$self.TrailingWrapper,"
            }
        }
    ],

    TrailingWrapper({ children }: any) {
        return (
            <>
                {children}
                <ErrorBoundary key="vc-fakemute" noop>
                    <FakeMuteButton type="top-bar" />
                </ErrorBoundary>
            </>
        );
    },

    start() {
        logger.info("Starting FakeMute...");

        // erlpack / msgpack module
        let packer = findByProps("pack", "unpack");
        if (!packer && (window as any).DiscordNative?.nativeModules?.requireModule) {
            try {
                packer = (window as any).DiscordNative.nativeModules.requireModule("discord_erlpack");
            } catch (e) { }
        }
        msgpack = packer;
        if (!msgpack) logger.warn("erlpack/msgpack not found, using JSON only");

        if (!originalSend) {
            originalSend = WebSocket.prototype.send;
        }

        // Hook WebSocket.send
        WebSocket.prototype.send = function (data) {
            try {
                let json;
                let isBuffer = false;

                if (this.url && typeof this.url === "string" && this.url.includes("gateway.discord.gg")) {
                    lastWs = this;
                }

                if (typeof data === "string") {
                    json = JSON.parse(data);
                } else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
                    if (msgpack && msgpack.unpack) {
                        json = msgpack.unpack(data instanceof ArrayBuffer ? new Uint8Array(data) : data);
                        isBuffer = true;
                    }
                }

                if (json && json.op === 4 && json.d) {
                    logger.info("Intercepted op 4 packet");
                    lastWs = this;

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

        // Patch existing WebSocket instance
        const existingWs = findExistingWebSocket();
        if (existingWs) {
            lastWs = existingWs;
            logger.info("Found existing WebSocket instance, patching its send method");
            const origInstanceSend = existingWs.send;
            existingWs.send = function (data: any) {
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
                        logger.info("Intercepted op 4 from existing WS");
                        if (typeof json.d.self_mute === "boolean") json.d.self_mute = spoofMute;
                        if (typeof json.d.self_deaf === "boolean") json.d.self_deaf = spoofDeafen;
                        if (isBuffer) {
                            data = msgpack.pack(json);
                            if (data.buffer) data = data.buffer;
                        } else {
                            data = JSON.stringify(json);
                        }
                        logger.info("Spoofed (existing WS) voice state:", json);
                    }
                } catch (e) { logger.warn("Existing WS patch error:", e); }
                return origInstanceSend.call(this, data);
            };
        } else {
            logger.info("No existing WebSocket found, will wait for first op 4 packet");
        }

        logger.info("FakeMute started successfully");
    },

    stop() {
        if (originalSend) {
            WebSocket.prototype.send = originalSend;
            originalSend = null;
        }

        lastWs = null;
        spoofMute = false;
        spoofDeafen = false;

        logger.info("FakeMute stopped");
    },
});
