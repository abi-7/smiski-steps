import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import Store from "electron-store";

const store = new Store();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 700,
    webPreferences: {
      preload: path.join(process.cwd(), "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");
  win.setMenu(null); // hides menu bar
};

app.whenReady().then(createWindow);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("get-tasks", () => store.get("tasks", []));
ipcMain.handle("save-tasks", (event, tasks) => {
  store.set("tasks", tasks);
  return true;
});
