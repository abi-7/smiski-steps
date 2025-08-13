import { contextBridge } from "electron/renderer";
import Store from "electron-store";

const store = new Store();

contextBridge.exposeInMainWorld("api", {
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  },

  loadTasks: () => store.get("tasks", []),

  saveTasks: (tasks) => store.set("tasks", tasks),

  addTask: (task) => {
    const tasks = store.get("tasks", []);
    tasks.push(task);
    store.set("tasks", tasks);
  },

  removeTask: (index) => {
    const tasks = store.get("tasks", []);
    tasks.splice(index, 1);
    store.set("tasks", tasks);
  },
});
