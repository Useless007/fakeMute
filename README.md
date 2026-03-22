# 🎭 FakeMute (Vencord Plugin)

FakeMute is a custom plugin for Vencord that allows you to spoof your voice state (Mute and Deafen) perfectly without actually disconnecting your microphone or audio output from Discord. 

This means you can appear to be Muted or Deafened to others in the voice channel, while still being able to speak and hear everyone normally!

## ✨ Features
- **UI Integration**: Adds a sleek, native-feeling button to the top Discord title bar (next to the Inbox icon).
- **Modern Popout Dialog**: Click the button to reveal a gorgeous glassmorphism dialog.
- **Independent Toggles**: 
  - 🎤 **Fake Mute**: Appear muted to everyone else.
  - 🎧 **Fake Deafen**: Appear completely deafened to everyone else.
- **Real-time WebSocket Interception**: Modifies outgoing voice state updates seamlessly without touching Discord's internal audio streams.

## 🚀 Installation 
1. Place the `fakeMute` folder inside your Vencord `src/userplugins/` directory:
   `Vencord/src/userplugins/fakeMute`
2. Build Vencord with your tool of choice (e.g. `pnpm build` or fast refresh if using dev mode).
3. Restart or Refresh your Discord client.
4. Go to **Settings > Plugins**, find **FakeMute** and enable it.

## 💡 Usage
Once enabled, look at the **top right corner** of your Discord window (next to the Inbox and Help icons). 

1. You will see a microphone icon with a slash.
2. Click it to open the **Fake Voice** menu.
3. Toggle the switches for Mute or Deafen as desired.
4. The button icon will turn **Red** to indicate that spoofing is currently active!

## ⚙️ Technical Details
FakeMute works by intercepting the `WebSocket.prototype.send` function. 
When Discord tries to send an Opcode 4 (Voice State Update) packet to the gateway, the plugin hijacks the packet and overrides the `self_mute` and `self_deaf` boolean properties before it reaches the server.
