# 🎭 Vencord FakeMute Plugin Installer

Automated installer for the [fakeMute](https://github.com/Useless007/fakeMute) Vencord plugin that handles all prerequisites and setup automatically.

## ✨ Features

- **🔄 One-Line Installation** - Simple copy-paste command
- **🔧 Auto-Prerequisites** - Installs Git, Node.js, pnpm if missing
- **📁 Vencord Setup** - Clones Vencord to Desktop automatically
- **🔌 Plugin Installation** - Installs fakeMute plugin in correct location
- **🏗️ Complete Build** - Runs pnpm i, pnpm build, and pnpm inject
- **🎯 Zero Configuration** - Works out of the box

## 🚀 Quick Start

### Option 1: PowerShell One-Liner (Recommended)
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/jxyluvcode/fakeMute-installer/main/vencord-fakemute-complete-installer.bat | iex"
```

### Option 2: Command Prompt One-Liner
```cmd
curl -o install.bat https://raw.githubusercontent.com/jxyluvcode/fakeMute-installer/main/vencord-fakemute-complete-installer.bat && install.bat
```

### Option 3: Manual Download
1. Download `vencord-fakemute-complete-installer.bat`
2. Double-click to run
3. Follow the prompts

## 📋 Available Installers

| File | Description | Use Case |
|------|-------------|----------|
| `vencord-fakemute-complete-installer.bat` | **Complete external installer** | Full automated setup with prerequisites |
| `github-one-line-installer.bat` | **Compact one-line version** | GitHub deployment, minimal output |
| `install-fakemute.ps1` | **PowerShell version** | Alternative for PowerShell users |

## 🔧 What Gets Installed

### Prerequisites (Auto-installed if missing)
- **Git** - Version control system
- **Node.js** - JavaScript runtime
- **npm** - Node package manager
- **pnpm** - Fast, disk space efficient package manager

### Vencord Setup
- **Vencord** cloned to `Desktop\Vencord`
- **fakeMute plugin** installed in `src\userplugins\fakeMute`
- **Dependencies** installed via `pnpm i`
- **Build** completed via `pnpm build`
- **Injection** into Discord via `pnpm inject`

## 🎯 After Installation

1. **Restart Discord** completely
2. Go to **Settings > Plugins**
3. Find **"FakeMute"** and enable it
4. Look for the **microphone icon with slash** in the top right corner

## 🎭 About fakeMute Plugin

The fakeMute plugin allows you to:
- 🎤 **Fake Mute** - Appear muted to others while still hearing them
- 🎧 **Fake Deafen** - Appear deafened while still hearing everything
- 🎨 **UI Integration** - Native Discord button in title bar
- 🔒 **WebSocket Interception** - Seamless voice state modification

## 🛠️ Technical Details

- **Auto-detection** of existing Vencord installations
- **Silent installation** of prerequisites
- **Error handling** with user-friendly messages
- **PATH management** for new installations
- **Cleanup** of temporary files

## ⚠️ Requirements

- **Windows** (Windows 10/11 recommended)
- **Administrator privileges** (for prerequisite installation)
- **Internet connection** (for downloads)
- **Discord** (will be modified by Vencord)

## 🚨 Troubleshooting

### "Git installation failed"
- Install Git manually from [git-scm.com](https://git-scm.com/)
- Restart terminal and try again

### "Node.js installation failed"
- Install Node.js manually from [nodejs.org](https://nodejs.org/)
- Restart terminal and try again

### "Build failed"
- Ensure you have administrator privileges
- Check internet connection
- Try manual build: `cd Desktop\Vencord && pnpm build`

### "Injection failed"
- Close Discord completely before running installer
- Run as administrator
- Try manual injection: `cd Desktop\Vencord && pnpm inject`

### Plugin not showing in Discord
1. Restart Discord completely
2. Check Settings > Plugins
3. Ensure Vencord is properly injected
4. Try re-running the installer

## 📁 File Structure

```
Vencord/
├── src/
│   └── userplugins/
│       └── fakeMute/
│           ├── index.ts
│           ├── manifest.json
│           └── ...plugin files
├── package.json
├── pnpm-lock.yaml
└── ...vencord files
```

## 🔗 Links

- **fakeMute Plugin**: https://github.com/Useless007/fakeMute
- **Vencord**: https://github.com/Vendicated/Vencord
- **Discord**: https://discord.com/

## 📝 License

This installer is provided as-is for educational and personal use. Use at your own risk.

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure you're running as administrator
3. Try the manual installation steps
4. Check the original plugin repository for updates

---

**Made with ❤️ for the Vencord community**
