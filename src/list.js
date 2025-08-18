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

  //load tasks, with error handling
  try {
    tasks = (await window.api.loadTasks()) || [];
    console.log("Loaded tasks:", tasks);
  } catch (error) {
    console.error("Error loading tasks:", error);
    tasks = [];
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

      // create the checkbox wrapper HTML structure
      li.innerHTML = `
        <div class="checkbox-wrapper">
          <input class="inp-cbx" id="cbx-${index}" type="checkbox"/>
          <label class="cbx" for="cbx-${index}">
            <span>
              <svg width="12px" height="9px" viewBox="0 0 12 9">
                <polyline points="1 5 4 8 11 1"></polyline>
              </svg>
            </span>
            <span>${task}</span>
          </label>
        </div>
      `;

      // Add click event to checkbox for task completion
      const checkbox = li.querySelector(".inp-cbx");
      const label = li.querySelector(".cbx");

      //handle checkbox toggle
      checkbox.addEventListener("change", () => {
        label.classList.toggle("completed", checkbox.checked);
        console.log(`Task "${task}" completion toggled`);
      });

      // Double-click to delete
      li.addEventListener("dblclick", async () => {
        console.log(`Removing task at index ${index}`);
        tasks = await window.api.removeTask(index);
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
        tasks = await window.api.addTask(taskText);
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
});
