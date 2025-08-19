import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import Store from "electron-store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize electron-store
const store = new Store();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 700,
    resizable: false,
    movable: true,
    webPreferences: {
      preload: path.join(process.cwd(), "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.loadFile("index.html");
  // win.webContents.openDevTools();
  win.setMenu(null); // hides menu bar
};

app.whenReady().then(createWindow);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Add ALL the IPC handlers:
ipcMain.handle("get-tasks", () => {
  const tasks = store.get("tasks", []);
  console.log("Main process - Loading tasks:", tasks);
  return tasks;
});

ipcMain.handle("save-tasks", (event, tasks) => {
  console.log("Main process - Saving tasks:", tasks);
  store.set("tasks", tasks);
  return true;
});

ipcMain.handle("add-task", (event, task) => {
  const tasks = store.get("tasks", []);
  tasks.push(task);
  console.log("Main process - Adding task, new array:", tasks);
  store.set("tasks", tasks);
  return tasks;
});

ipcMain.handle("remove-task", (event, index) => {
  const tasks = store.get("tasks", []);
  tasks.splice(index, 1);
  console.log("Main process - Removing task, new array:", tasks);
  store.set("tasks", tasks);
  return tasks;
});
