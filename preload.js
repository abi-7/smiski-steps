import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  },

  loadTasks: () => ipcRenderer.invoke("get-tasks"),

  saveTasks: (tasks) => ipcRenderer.invoke("save-tasks", tasks),

  addTask: (task) => ipcRenderer.invoke("add-task", task),

  removeTask: (index) => ipcRenderer.invoke("remove-task", index),
});
