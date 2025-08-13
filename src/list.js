const modal = document.getElementById("taskModal");
const openBtn = document.getElementById("newTaskBtn");
const closeBtn = document.querySelector(".close");

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
  let tasks = await window.taskAPI.getTasks();

  function renderTasks() {
    taskListEl.innerHTML = "";
    tasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.textContent = task;
      li.addEventListener("click", () => {
        tasks.splice(index, 1);
        window.taskAPI.saveTasks(tasks);
        renderTasks();
      });
      taskListEl.appendChild(li);
    });
  }

  // Initial render
  renderTasks();

  const input = document.getElementById("taskInputField");
  const addBtn = document.getElementById("addTaskBtn");

  addBtn.addEventListener("click", async () => {
    const taskText = input.value.trim();
    if (taskText !== "") {
      tasks.push(taskText);
      await window.taskAPI.saveTasks(tasks);
      input.value = "";
      renderTasks();
      modal.style.display = "none"; // Close modal after adding task
    }
  });
});
