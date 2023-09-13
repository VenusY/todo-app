// Retrive theme from local storage
function retrieveTheme() {
  const activeTheme = localStorage.getItem("theme") || "dark";
  const inactiveTheme = activeTheme === "dark" ? "light" : "dark";
  const htmlTag = document.querySelector("html");
  htmlTag.classList.add(activeTheme);
  htmlTag.classList.remove(inactiveTheme);
}

window.onload = retrieveTheme();

// Switch theme button
function switchThemeButton() {
  // Toggle between light and dark classes on html tag
  const htmlTag = document.querySelector("html");
  htmlTag.classList.toggle("dark");
  htmlTag.classList.toggle("light");

  // Toggle --hidden class on both theme button icons
  const hiddenIcon = document.querySelector(".theme-button__icon--hidden");
  const adjacentIcon =
    hiddenIcon.nextElementSibling || hiddenIcon.previousElementSibling;
  hiddenIcon.classList.toggle("theme-button__icon--hidden");
  adjacentIcon.classList.toggle("theme-button__icon--hidden");

  // Update preferred theme in local storage
  if (htmlTag.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

const themeButton = document.querySelector(".theme-button");
themeButton.addEventListener("click", switchThemeButton);

// Render tasks from local storage
const existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];
existingTasks.forEach(existingTask =>
  createTask(null, existingTask.task, existingTask.completionStatus)
);

// Update items left counter
function calculateItemsLeft() {
  const itemsLeft = document.querySelector(".bottom-section__items-left");
  const tasks = document.querySelectorAll(".task__text");

  let itemsLeftCount = 0;
  tasks.forEach(task => {
    if (!task.classList.contains("task__text--completed")) {
      itemsLeftCount++;
    }
  });

  itemsLeft.textContent = `${itemsLeftCount} ${
    itemsLeftCount === 1 ? "item" : "items"
  } left`;
}

calculateItemsLeft(); // Calculate items left on first render

// Create task, add to local storage, and display on webpage
function createTask(
  e,
  taskText = null,
  taskCompletionStatus = null,
  existingTasks = JSON.parse(localStorage.getItem("tasks")) || []
) {
  // IF the function was called manually OR triggered by user pressing enter
  if (!((e && e.key === "Enter") || !e)) {
    return;
  }

  // IF function was triggered by user adding a new task via input field
  if (e) {
    if (!this.value) {
      return;
    }

    taskText = this.value; // Assign this.value to the task variable
    this.value = ""; // Reset the input field

    const newTaskCheckbox = this.previousElementSibling;

    taskCompletionStatus =
      newTaskCheckbox.ariaChecked === "false" ? "active" : "completed";

    // Reset state of checkbox
    const innerCircle = newTaskCheckbox.firstElementChild;
    const checkMark = innerCircle.firstElementChild;
    newTaskCheckbox.classList.remove("checkbox--completed");
    innerCircle.classList.remove("checkbox__inner-circle--completed");
    checkMark.classList.remove("checkbox__check-mark--completed");

    newTaskCheckbox.ariaChecked = "false";

    // Add the new task to local storage
    const taskObject = {
      task: taskText,
      completionStatus: taskCompletionStatus,
    };

    existingTasks.push(taskObject);

    localStorage.setItem("tasks", JSON.stringify(existingTasks));
  }

  // Create custom checkbox
  const checkbox = document.createElement("div");
  const isChecked = taskCompletionStatus === "active" ? "false" : "true";
  checkbox.classList.add("checkbox");
  checkbox.setAttribute("role", "checkbox");
  checkbox.setAttribute("aria-checked", isChecked);
  checkbox.setAttribute("tabindex", "0");

  const innerCircle = document.createElement("div");
  innerCircle.classList.add("checkbox__inner-circle");

  const checkMark = document.createElement("img");
  checkMark.classList.add("checkbox__check-mark");
  checkMark.setAttribute("src", "images/icon-check.svg");
  checkMark.setAttribute("alt", "Check mark");

  innerCircle.appendChild(checkMark);
  checkbox.appendChild(innerCircle);

  if (checkbox.ariaChecked === "true") {
    checkbox.classList.add("checkbox--completed");
    innerCircle.classList.add("checkbox__inner-circle--completed");
    checkMark.classList.add("checkbox__check-mark--completed");
  }

  // Create task text element
  const textElement = document.createElement("p");
  textElement.classList.add("task__text");

  isChecked === "true"
    ? textElement.classList.add("task__text--completed")
    : null;

  textElement.setAttribute("contenteditable", "false");
  textElement.textContent = taskText; // Set the value of the p element to the value of the input field

  // Create edit button
  const editButton = document.createElement("button");
  editButton.classList.add("task__button", "task__edit-button");

  const editIcon = document.createElement("img");
  editIcon.setAttribute("src", "images/icon-pencil.svg");
  editIcon.setAttribute("alt", "Edit");

  editButton.appendChild(editIcon);

  // Create edit submit button
  const editSubmitButton = document.createElement("button");
  editSubmitButton.classList.add(
    "task__button",
    "task__submit-button",
    "task__submit-button--hidden"
  );

  const editSubmitIcon = document.createElement("img");
  editSubmitIcon.setAttribute("src", "images/icon-check-thin.svg");
  editSubmitIcon.setAttribute("alt", "Submit edit");

  editSubmitButton.appendChild(editSubmitIcon);

  // Create delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("task__button", "task__delete-button");

  const crossIcon = document.createElement("img");
  crossIcon.setAttribute("src", "images/icon-cross.svg");
  crossIcon.setAttribute("alt", "Delete");

  deleteButton.appendChild(crossIcon);

  // Assemble task parts
  const newTask = document.createElement("div");
  newTask.classList.add("task");
  newTask.setAttribute("draggable", "true");
  newTask.appendChild(checkbox);
  newTask.appendChild(textElement);
  newTask.appendChild(editButton);
  newTask.appendChild(editSubmitButton);
  newTask.appendChild(deleteButton);

  // Add new task to DOM
  const taskList = document.querySelector(".tasks");
  const bottomSection = document.querySelector(".bottom-section");
  taskList.insertBefore(newTask, bottomSection);

  // Attach event listeners to new elements
  checkbox.addEventListener("click", toggleTaskState);
  checkbox.addEventListener("keydown", toggleTaskState);

  textElement.addEventListener("keydown", submitEdit);
  editButton.addEventListener("click", allowEdit);
  editSubmitButton.addEventListener("click", submitEdit);

  deleteButton.addEventListener("click", deleteTask);

  newTask.addEventListener("dragenter", allowDrop);
  newTask.addEventListener("dragover", allowDrop);
  newTask.addEventListener("dragstart", addDraggingClass);
  newTask.addEventListener("dragstart", removeGhostImage);
  newTask.addEventListener("dragenter", removeIndicatorOnEnter);
  newTask.addEventListener("dragover", addDropIndicator);
  newTask.addEventListener("dragleave", removeIndicatorOnLeave);
  newTask.addEventListener("dragend", removeDraggingClass);
  newTask.addEventListener("dragend", removeAllIndicators);
  newTask.addEventListener("drop", removeDropIndicator);
  newTask.addEventListener("drop", moveToNewPosition);
  newTask.addEventListener("drop", updateLocalStorage);

  // Update items left counter
  calculateItemsLeft();
}

const newTask = document.querySelector(".new-task__task");
newTask.addEventListener("keydown", createTask);

// Change state of checkbox and new task
function toggleNewTaskState(e) {
  if (!(e.type === "click" || e.key === "Enter")) {
    return;
  }

  this.ariaChecked === "false"
    ? (this.ariaChecked = "true")
    : (this.ariaChecked = "false");

  const innerCircle = this.firstElementChild;
  const checkMark = innerCircle.firstElementChild;

  this.classList.toggle("checkbox--completed");
  innerCircle.classList.toggle("checkbox__inner-circle--completed");
  checkMark.classList.toggle("checkbox__check-mark--completed");

  calculateItemsLeft();
}

const newTaskCheckbox = document.querySelector(".new-task__checkbox");
newTaskCheckbox.addEventListener("click", toggleNewTaskState);
newTaskCheckbox.addEventListener("keydown", toggleNewTaskState);

// Change state of checkboxes and related tasks
function toggleTaskState(
  e,
  existingTasks = JSON.parse(localStorage.getItem("tasks")) || []
) {
  // Check if the checkbox is next to a task
  if (!this.nextElementSibling.classList.contains("task__text")) {
    return;
  }

  // Check if checkbox was clicked or if enter key was pressed
  if (!(e.type === "click" || e.key === "Enter")) {
    return;
  }

  // Toggle aria-checked attribute
  this.ariaChecked === "false"
    ? (this.ariaChecked = "true")
    : (this.ariaChecked = "false");

  // Toggle classes for checkbox and related elements
  const innerCircle = this.firstElementChild;
  const checkMark = innerCircle.firstElementChild;

  this.classList.toggle("checkbox--completed");
  innerCircle.classList.toggle("checkbox__inner-circle--completed");
  checkMark.classList.toggle("checkbox__check-mark--completed");

  // IF checkbox next element sibling is existing task
  if (this.nextElementSibling.classList.contains("task__text")) {
    const task = this.nextElementSibling;
    task.classList.toggle("task__text--completed");
  }

  // Update completion status in existingTasks array and local storage
  const checkboxes = [...document.querySelectorAll(".task > .checkbox")];
  const taskIndex = checkboxes.indexOf(this);

  existingTasks[taskIndex].completionStatus === "active"
    ? (existingTasks[taskIndex].completionStatus = "completed")
    : (existingTasks[taskIndex].completionStatus = "active");

  localStorage.setItem("tasks", JSON.stringify(existingTasks));

  // Update items left counter
  calculateItemsLeft();
}

// Allow user to edit task
function allowEdit() {
  this.classList.add("task__edit-button--hidden");

  const editSubmitButton = this.nextElementSibling;
  editSubmitButton.classList.remove("task__submit-button--hidden");

  const taskText = this.previousElementSibling;
  taskText.contentEditable = true;
  taskText.focus();
}

// Submit edit
function submitEdit(
  e,
  existingTasks = JSON.parse(localStorage.getItem("tasks")) || []
) {
  if (!(e.type === "click" || e.key === "Enter")) {
    return;
  }

  let editButton;
  let editSubmitButton;
  let taskText;

  if (e.type === "click") {
    editButton = this.previousElementSibling;
    editSubmitButton = this;
    taskText = editButton.previousElementSibling;
  } else {
    editButton = this.nextElementSibling;
    editSubmitButton = editButton.nextElementSibling;
    taskText = this;
  }

  editSubmitButton.classList.add("task__submit-button--hidden");
  editButton.classList.remove("task__edit-button--hidden");
  taskText.contentEditable = false;

  const taskArray = [...document.querySelectorAll(".task__text")];
  const taskIndex = taskArray.indexOf(taskText);
  existingTasks[taskIndex].task = taskText.textContent;
  localStorage.setItem("tasks", JSON.stringify(existingTasks));
}

// Remove task from local storage and DOM when deleted
function deleteTask(
  e,
  existingTasks = JSON.parse(localStorage.getItem("tasks")) || []
) {
  // Remove task from local storage
  const deleteButtons = [...document.querySelectorAll(".task__delete-button")];
  const taskIndex = deleteButtons.indexOf(this);

  existingTasks.splice(taskIndex, 1);
  localStorage.setItem("tasks", JSON.stringify(existingTasks));

  // Remove task from DOM
  const taskToDelete = this.parentElement;
  taskToDelete.remove();

  calculateItemsLeft();
}

// Clear all completed tasks when user clicks 'Clear Completed' button
function clearCompletedTasks(
  e,
  existingTasks = JSON.parse(localStorage.getItem("tasks")) || []
) {
  const tasksInDOM = document.querySelectorAll(".task");

  existingTasks.forEach((existingTask, indexToRemove) => {
    if (existingTask.completionStatus === "completed") {
      tasksInDOM[indexToRemove].remove();
      existingTasks.splice(indexToRemove, 1);
      localStorage.setItem("tasks", JSON.stringify(existingTasks));
      return clearCompletedTasks(e, existingTasks);
    }
  });
}

const clearButton = document.querySelector(".bottom-section__clear-button");
clearButton.addEventListener("click", clearCompletedTasks);

// Only display tasks with required completion status when filter is applied
function filterTasks() {
  // Change styling of filter buttons to display current active filter
  const filterButtons = document.querySelectorAll(".filters__filter");

  filterButtons.forEach(filterButton => {
    filterButton.classList.remove("filters__filter--selected");
    filterButton.removeAttribute("tabindex");
  });

  this.classList.add("filters__filter--selected");
  this.setAttribute("tabindex", "-1");

  // Toggle visibility of tasks
  const taskArray = document.querySelectorAll(".task__text");

  if (this.id === "active-filter-button") {
    taskArray.forEach(taskText => {
      if (taskText.classList.contains("task__text--completed")) {
        taskText.parentElement.classList.add("task--hidden"); // Add 'task--completed' class to 'task' element
      } else {
        taskText.parentElement.classList.remove("task--hidden");
      }
    });
  } else if (this.id === "completed-filter-button") {
    taskArray.forEach(taskText => {
      if (!taskText.classList.contains("task__text--completed")) {
        taskText.parentElement.classList.add("task--hidden"); // Add 'task--completed' class to 'task' element
      } else {
        taskText.parentElement.classList.remove("task--hidden");
      }
    });
  } else {
    taskArray.forEach(taskText => {
      taskText.parentElement.classList.remove("task--hidden");
    });
  }
}

const filterButtons = document.querySelectorAll(".filters__filter");
filterButtons.forEach(filterButton =>
  filterButton.addEventListener("click", filterTasks)
);

// Drag and drop feature
function allowDrop(e) {
  e.preventDefault();
}

function addDraggingClass(e) {
  this.classList.add("task--dragging");
}

function removeGhostImage(e) {
  const img = document.createElement("img");
  e.dataTransfer.setDragImage(img, 0, 0);
}

function removeDraggingClass(e) {
  this.classList.remove("task--dragging");
}

function removeIndicatorOnEnter(e) {
  const tasks = [...document.querySelectorAll(".task")];
  const firstTask = tasks[0];
  const lastTask = tasks[tasks.length - 1];

  if (e.target !== this) {
    return;
  }

  // User must enter target through either left or right side
  if (e.offsetX !== 0 && e.offsetX !== this.offsetWidth - 1) {
    // Otherwise target must be either first or last element
    if (this !== firstTask && this !== lastTask) {
      return;
    }
    // Target must be the first element and user must enter from the top
    else if (this === firstTask && e.offsetY !== 0) {
      return;
    }
    // Target must be the last element and user must enter from the bottom
    else if (this === lastTask && e.offsetY !== this.offsetHeight - 1) {
      return;
    }
  }

  if (this === firstTask) {
    tasks.forEach((task, index) => {
      if (index === 0) {
        return;
      }

      task.classList.remove("task--dragover-bottom");
    });
  } else {
    const currentIndex = tasks.indexOf(this);
    const previousIndex = currentIndex - 1;

    tasks.forEach((task, index) => {
      if (index === previousIndex || index === 0) {
        task.classList.remove("task--dragover-top");
        return;
      }

      if (index === currentIndex) {
        return;
      }

      task.classList.remove("task--dragover-bottom");
    });
  }
}

function addDropIndicator(e) {
  const target = this.previousElementSibling || this;
  const halfHeight = halfHeightOf(e.target);

  // IF user is dragging over the first task in the list
  if (target === this) {
    // IF user is dragging over top half of element
    if (e.offsetY < halfHeight) {
      target.classList.add("task--dragover-top");
      target.classList.remove("task--dragover-bottom");
    } else {
      target.classList.add("task--dragover-bottom");
      target.classList.remove("task--dragover-top");
    }
  } else {
    if (e.offsetY < halfHeight) {
      target.classList.add("task--dragover-bottom");
      target.classList.remove("task--dragover-top");
      this.classList.remove("task--dragover-bottom");
    } else {
      this.classList.add("task--dragover-bottom");
      target.classList.remove("task--dragover-bottom");
    }
  }
}

function removeIndicatorOnLeave(e) {
  const tasks = [...document.querySelectorAll(".task")];
  const firstTask = tasks[0];
  const lastTask = tasks[tasks.length - 1];

  // Target must be a .task element
  if (e.target !== this) {
    return;
  }

  // User must leave target through either left or right side
  if (e.offsetX !== -1 && e.offsetX !== this.offsetWidth) {
    // Otherwise target must be either first or last element
    if (this !== firstTask && this !== lastTask) {
      return;
    }
    // Target must be the first element and user must leave from the top
    else if (this === firstTask && e.offsetY !== -1) {
      return;
    }
    // Target must be the last element and user must leave from the bottom
    else if (this === lastTask && !(e.offsetY >= this.offsetHeight)) {
      return;
    }
  }

  tasks.forEach(task => {
    task.classList.remove("task--dragover-top", "task--dragover-bottom");
  });
}

function removeDropIndicator() {
  this.classList.remove("task--dragover-top", "task--dragover-bottom");
}

function removeAllIndicators() {
  const tasks = document.querySelectorAll(".task");
  tasks.forEach(task => {
    task.classList.remove("task--dragover-top", "task--dragover-bottom");
  });
}

function moveToNewPosition(e) {
  const taskList = document.querySelector(".tasks");
  const dragging = document.querySelector(".task--dragging");
  const halfHeight = halfHeightOf(e.target);

  if (e.offsetY < halfHeight) {
    taskList.insertBefore(dragging, this);
  } else {
    this.insertAdjacentElement("afterend", dragging);
  }

  dragging.classList.remove("dragging");
}

function updateLocalStorage() {
  const tasksInDOM = document.querySelectorAll(".task");
  const tasksArray = [];

  tasksInDOM.forEach(taskElement => {
    const taskText = taskElement.querySelector(".task__text").textContent;
    const completionStatus =
      taskElement.querySelector(".checkbox").ariaChecked === "true"
        ? "completed"
        : "active";
    const taskObject = { task: taskText, completionStatus: completionStatus };
    tasksArray.push(taskObject);
  });

  localStorage.setItem("tasks", JSON.stringify(tasksArray));
}

function halfHeightOf(element) {
  const totalBorderHeight = element.offsetHeight - element.clientHeight;
  const heightOfItem = element.scrollHeight;
  const totalHeight = heightOfItem + totalBorderHeight;
  const halfHeight = totalHeight / 2;

  return halfHeight;
}

// Change layout of filters and bottom section when the desktop version is active
function changePageLayout() {
  const minWidthMediaQuery = window.matchMedia("(min-width: 650px)");
  const main = document.querySelector("main");
  const itemsLeftCounter = document.querySelector(
    ".bottom-section__items-left"
  );
  const filters = document.querySelector(".filters");

  if (minWidthMediaQuery.matches) {
    itemsLeftCounter.insertAdjacentElement("afterend", filters);
  } else {
    main.insertAdjacentElement("afterend", filters);
  }
}

window.addEventListener("resize", changePageLayout);

changePageLayout(); // Call function on load
