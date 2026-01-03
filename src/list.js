const modal = document.getElementById("taskModal");
const openBtn = document.getElementById("newTaskBtn");
const closeBtn = document.querySelector(".close");
const input = document.getElementById("taskInputField");
const addBtn = document.getElementById("addTaskBtn");
const taskListDiv = document.getElementById("taskList");

openBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const taskListEl = document.getElementById("taskUl");
  console.log("taskUl element:", taskListEl);

  let tasks = [];

  console.log("window.api:", window.api);

  // Helper to normalize older string-only tasks to object form { text, completed }
  function normalizeTasks(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => {
      if (typeof item === "string") return { text: item, completed: false };
      if (item && typeof item === "object") {
        return { text: item.text ?? "", completed: !!item.completed };
      }
      return { text: String(item), completed: false };
    });
  }

  // Load persisted tasks from main process (electron-store) on startup
  try {
    const loaded = await window.api.loadTasks();
    tasks = normalizeTasks(loaded);
  } catch (err) {
    console.error("Failed to load tasks from storage:", err);
  }

  function renderTasks() {
    console.log("Rendering tasks:", tasks);
    console.log("Target element:", taskListEl);

    if (!taskListEl) {
      console.error("taskUl element not found!");
      return;
    }

    taskListEl.innerHTML = "";
    tasks.forEach((task, index) => {
      console.log(`Creating li for task ${index}:`, task);
      const li = document.createElement("li");
      li.className = "task-item";

      li.innerHTML = `
        <div class="checkbox-wrapper">
          <input class="inp-cbx" id="cbx-${index}" type="checkbox" ${task.completed ? "checked" : ""}/>
          <label class="cbx" for="cbx-${index}">
            <span>
              <svg width="12px" height="9px" viewBox="0 0 12 9">
                <polyline points="1 5 4 8 11 1"></polyline>
              </svg>
            </span>
            <span>${task.text}</span>
          </label>
        </div>
      `;

      // Add click event to checkbox for task completion
      const checkbox = li.querySelector(".inp-cbx");
      const label = li.querySelector(".cbx");

      // Reflect initial completed state
      if (task.completed) {
        label.classList.add("completed");
      }

      checkbox.addEventListener("change", async () => {
        const checked = checkbox.checked;
        label.classList.toggle("completed", checked);
        console.log(`Task "${task.text}" completion toggled to ${checked}`);

        // Move the task to the correct section
        // completed tasks go to the bottom
        try {
          // Remove the task from its current index
          const [moved] = tasks.splice(index, 1);
          if (moved) {
            moved.completed = checked;

            if (checked) {
              // When completed, push to the end
              tasks.push(moved);
            } else {
              // When unchecking, insert before the first completed task
              // keep incomplete section together
              const firstCompletedIndex = tasks.findIndex((t) => t.completed);
              if (firstCompletedIndex === -1) {
                // No completed tasks, append to end (all incomplete)
                tasks.push(moved);
              } else {
                tasks.splice(firstCompletedIndex, 0, moved);
              }
            }

            // Persist new order
            await window.api.saveTasks(tasks);
            // Re-render to show updated order and re-bind handlers
            renderTasks();
          }
        } catch (err) {
          console.error("Failed to move/persist task:", err);
        }
      });

      // Double-click to delete
      li.addEventListener("dblclick", async () => {
        console.log(`Removing task at index ${index}`);
        const res = await window.api.removeTask(index);
        tasks = normalizeTasks(res);
        renderTasks();
      });
      taskListEl.appendChild(li);
    });

    console.log("Final taskListEl innerHTML:", taskListEl.innerHTML);
  }

  // Initial render
  renderTasks();

  addBtn.addEventListener("click", async () => {
    const taskText = input.value.trim();
    console.log("Add button clicked, task text:", taskText);

    if (taskText !== "") {
      try {
        console.log("Adding task:", taskText);
        const newTask = { text: taskText, completed: false };
        const res = await window.api.addTask(newTask);
        tasks = normalizeTasks(res);
        console.log("Tasks after adding:", tasks);
        input.value = "";
        renderTasks();
        modal.style.display = "none";
      } catch (error) {
        console.error("Error saving tasks:", error);
      }
    }
  });

  //Enter key to add task
  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      addBtn.click();
    }
  });

  // Clear All button (with confirmation)
  const clearAllBtn = document.getElementById("clearAllBtn");

  clearAllBtn?.addEventListener("click", async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all tasks? This cannot be undone."
    );
    if (!confirmed) return;
    try {
      await window.api.saveTasks([]);
      tasks = [];
      renderTasks();
      console.log("All tasks cleared");
    } catch (err) {
      console.error("Failed to clear tasks:", err);
    }
  });
});
