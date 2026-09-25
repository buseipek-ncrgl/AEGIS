# 💻 AEGIS C4ISR Native Desktop Application (Electron.js / Windows .exe)

This directory contains the **Native Desktop Edition** of the **AEGIS C4ISR Tactical Command Center**. Built with Electron.js, it wraps the Next.js Command Center and .NET 9 API into an isolated, hardware-accelerated desktop window for Command Operations Rooms.

---

## ⚡ Quick Start (Desktop App)

### Prerequisites
- Node.js 18+ & npm
- AEGIS Web & Backend running (`docker compose up` or `npm run dev` in `apps/web`)

### 1. Install Desktop Dependencies
```bash
cd apps/desktop
npm install
```

### 2. Launch Desktop Application
```bash
npm start
```
*Launches the AEGIS C4ISR Tactical Command Center in a dedicated 1600x1000 native desktop application window with hardware GPU acceleration.*

---

## 📦 Build Windows Standalone Installer (.exe)

To package AEGIS into a single standalone Windows executable installer (`AEGIS-Command-Center-Setup.exe`):

```bash
npm run build:exe
```
The installer will be generated inside the `apps/desktop/dist/` directory.

---

## 🔒 Features
- **GPU Hardware Acceleration:** High-FPS Leaflet GIS map rendering.
- **IPC Context Bridge:** Native system notification and IPC hardware integration.
- **Frameless MIL-SPEC Styling:** Zero browser clutter or address bar distractions.
