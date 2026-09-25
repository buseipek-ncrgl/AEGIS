const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aegisDesktop", {
  isDesktop: true,
  appVersion: "3.0.0 (Enterprise Desktop Edition)",
  platform: process.platform,
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close")
});
