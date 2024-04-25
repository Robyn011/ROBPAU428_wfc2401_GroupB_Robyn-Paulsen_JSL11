// TASK: import helper functions from utils - solved
import {
  getTasks, 
  createNewTask, 
  patchTask, 
  putTask, 
  deleteTask
} from "/utils/taskFunctions.js"

// TASK: import initialData - solved
import {initialData} from "/initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// localStorage.clear() // clear storage

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    // Load initial data into local storage
    localStorage.setItem('tasks', JSON.stringify(initialData.tasks)); // Store only the 'tasks' array
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// Call initializeData before elements in DOM
initializeData();
// TASK: Get elements from the DOM - solved
const elements = {
  headerBoardName: document.querySelector("#header-board-name"),
  columnDivs: document.querySelectorAll(".column-div"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  filterDiv: document.querySelector("#filterDiv"),
  hideSideBarBtn: document.querySelector("#hide-side-bar-btn"),
  showSideBarBtn: document.querySelector("#show-side-bar-btn"),
  themeSwitch: document.querySelector("#switch"),
  createNewTaskBtn: document.querySelector("#add-new-task-btn"),
  modalWindow: document.querySelector(".modal-window"),
  deleteBoardBtn: document.getElementById('deleteBoardBtn'),
};
let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task && task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}
// Creates different boards in the DOM - solved
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {  // added eventListener, arrow function
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task && task.board === boardName); // Add null check

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.setAttribute("class", "tasks-container")
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task && task.status === status).forEach(task => { // Add null check
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => {
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active')   // added classList
    }
    else {
      btn.classList.remove('active');  // added classList
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');

  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.classList.add('task-div');
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);

  
  tasksContainer.appendChild(taskElement);
  refreshTasksUI();  // added


initialData.push(task); // added
localStorage.setItem('tasks',JSON.stringify(initialData)) // added

}



function setupEventListeners() {
  // Cancel editing task event listener - solved
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => { // added evnetListener
    toggleModal(false, elements.editTaskModal)
  });

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false)); // added eventListener
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));  // added eventListener

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';   // changed => to :
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object - solved
    const task = {
      title: document.getElementById("title-input").value,
      description: document.getElementById("desc-input").value,
      status : document.getElementById("select-status").value,
      board : activeBoard
    };
    
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}

// Sidebar - solved
function toggleSidebar(show) {
  const sidebar = document.querySelector(".side-bar")
  sidebar.style.display = show ? 'block' : 'none';
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
}

// Theme - solved
function toggleTheme() {
  const logo = document.getElementById("logo")

  if(document.body.classList.toggle('light-theme') === true) {
    logo.setAttribute('src', "./assets/logo-light.svg")
  } else {
    logo.setAttribute('src', "./assets/logo-dark.svg")
  }
}


// TaskModal - unsolved
function openEditTaskModal(task) {
  // Set task details in modal inputs
  const editTaskTitleInput = document.getElementById('edit-task-title-input');
  const editTaskDescInput = document.getElementById('edit-task-desc-input');
  const editSelectStatus = document.getElementById('edit-select-status');

  editTaskTitleInput.value = task.title;
  editTaskDescInput.value = task.description;
  editSelectStatus.value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);
    toggleModal(false, elements.editTaskModal); // Close the edit task modal
  });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal); // Close the edit task modal
  });

  // Close the modal when the cancel button is clicked
  cancelEditBtn.addEventListener('click', () => {
    toggleModal(false, elements.editTaskModal); // Close the edit task modal
  });

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}
// Function to save changes to a task

function saveTaskChanges(taskId) {
  // Get new user inputs
  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: titleInput.value,
    description: descInput.value,
    status: statusSelect.value,
  };

  // Update task using a hlper functoin
  patchTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}
/*
// Function to save changes to a task
function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = document.getElementById("edit-task-title-input").value;
  const updatedDescription = document.getElementById("edit-task-desc-input").value;
  const updatedStatus = document.getElementById("edit-select-status").value;

  // Get the tasks from local storage
  let tasks = getTasks();

  // Check if a task with the same ID already exists
  const existingTaskIndex = tasks.findIndex(task => task.id === taskId);

  if (existingTaskIndex !== -1) {
    // If the task already exists, update its properties
    tasks[existingTaskIndex].title = updatedTitle;
    tasks[existingTaskIndex].description = updatedDescription;
    tasks[existingTaskIndex].status = updatedStatus;
  } else {
    // If the task doesn't exist, create a new task object
    const newTask = {
      id: taskId,
      title: updatedTitle,
      description: updatedDescription,
      status: updatedStatus
    };

    // Add the new task to the tasks array
    tasks.push(newTask);
  }

  // Save the updated tasks array back to local storage
  localStorage.setItem("tasks", JSON.stringify(tasks));

  // Call putTask to update the task in your storage mechanism
  putTask(taskId, tasks[existingTaskIndex]);

  // Refresh the UI to reflect the changes
  refreshTasksUI();

  // Close the modal
  toggleModal(false, elements.editTaskModal);
}

*/

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}

/*

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const LightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", LightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
 */


// tester code for delete button

//deleteBoardBtn: document.getElementById('deleteBoardBtn'),

// Add event listener to the delete board button
// Select the delete board button element

// Add event listener to the delete board button


// tester code for delete button
const deleteButton = document.getElementById('delete-task-btn');

// Add event listener outside the loop
deleteButton.addEventListener('click', function() {
    // Assuming initialData is an array of tasks
    // Find index of the task to delete
    const indexToDelete = initialData.findIndex(taskId => {
        // Add your condition to identify the task here
        // For example, if task.id is unique identifier
        // return task.id === taskIdToDelete;
    });

    if (indexToDelete !== -1) {
        // Remove the task from initialData
        initialData.splice(indexToDelete, 1);
        
        // Update localStorage if needed
        // localStorage.setItem('tasks', JSON.stringify(initialData));

        console.log('Task deleted successfully');
    } else {
        console.log('Task not found');
    }
});




/*deleteBoardBtn.addEventListener('click', function() {
  console.log("Setting up event listener for delete board button...");
  // Assuming initialData is an array of boards
  const boards = JSON.parse(localStorage.getItem('tasks'));
  console.log("Retrieved boards from local storage:", boards);
  const activeBoard = document.getElementById('header-board-name').textContent;
  console.log("Active board:", activeBoard);

  // Find index of the board to delete
  const indexToDelete = boards.findIndex(board => board.name === activeBoard);
  console.log("Index to delete:", indexToDelete);

  if (indexToDelete !== -1) {
      // Remove the board from initialData
      boards.splice(indexToDelete, 1);
      console.log("Updated boards array after deletion:", boards);

      // Update localStorage
      localStorage.setItem('tasks', JSON.stringify(boards));

      // Optionally, you can clear the tasks associated with the deleted board from localStorage

      console.log('Board deleted successfully');
  } else {
      console.log('Board not found');
  }
});


// Add event listener to the delete board button
elements.deleteBoardBtn.addEventListener('click', function() {
  console.log("Delete button clicked!"); // Check if the event listener is triggered

  // Assuming initialData is an array of boards
  const boards = JSON.parse(localStorage.getItem('tasks'));
  console.log("Boards from localStorage:", boards); // Check if the boards are retrieved correctly

  const activeBoard = elements.headerBoardName.textContent;
  console.log("Active board:", activeBoard); // Check if the active board is correctly identified

  // Find index of the board to delete
  const indexToDelete = boards.findIndex(board => board.name === activeBoard);
  console.log("Index to delete:", indexToDelete); // Check if the index to delete is correct

  if (indexToDelete !== -1) {
      // Remove the board from initialData
      boards.splice(indexToDelete, 1);

      // Update localStorage
      localStorage.setItem('tasks', JSON.stringify(boards));
      console.log("Board deleted successfully:", activeBoard); // Log success message
  } else {
      console.log('Board not found');
  }
});*/