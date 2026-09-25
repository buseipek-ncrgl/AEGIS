const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");

let mainWindow;

function createMainWindow() {
  Menu.setApplicationMenu(null); // MIL-SPEC Clean Window Interface (Suppress standard menus)

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1280,
    minHeight: 800,
    title: "AEGIS TAKTİK KOMUTA MERKEZİ - MASAÜSTÜ SÜRÜMÜ (v3.0)",
    icon: path.join(__dirname, "icon.png"),
    backgroundColor: "#050913",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    show: false,
  });

  const targetUrl = process.env.AEGIS_WEB_URL || "http://localhost:3000";

  mainWindow.loadURL(targetUrl);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Window IPC Event Handlers
ipcMain.on("window-minimize", () => mainWindow && mainWindow.minimize());
ipcMain.on("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});
ipcMain.on("window-close", () => mainWindow && mainWindow.close());

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
