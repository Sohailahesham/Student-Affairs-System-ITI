//* using fake server
//^ npx json-server db.json ==> run this command in terminal

import StudentsPage from "./pages/studentPage.js";
import CoursesPage from "./pages/coursePage.js";
import InstructorsPage from "./pages/instructorPage.js";
import EmployeesPage from "./pages/employeesPage.js";

const studentsPage = new StudentsPage();
const coursesPage = new CoursesPage();
const instructorsPage = new InstructorsPage();
const employeesPage = new EmployeesPage();

let currentPage = "students";

function clearAllContainers() {
  const app = document.getElementById("app");
  const header = document.getElementById("header");
  const formContainer = document.getElementById("form-container");

  if (app) app.innerHTML = "";
  if (header) header.innerHTML = "";
  if (formContainer) formContainer.innerHTML = "";
}

function loadPage(pageName) {
  currentPage = pageName;
  localStorage.setItem("currentPage", currentPage);

  clearAllContainers();

  const navButtons = document.querySelectorAll(".nav-link");
  for (let i = 0; i < navButtons.length; i++) {
    navButtons[i].classList.remove("active");
    if (navButtons[i].dataset.page === pageName) {
      navButtons[i].classList.add("active");
    }
  }

  if (pageName === "students") {
    studentsPage.load();
  } else if (pageName === "courses") {
    if (coursesPage) {
      coursesPage.load();
    } else {
      console.log("Courses page not implemented yet");
      document.getElementById("app").innerHTML =
        "<div class='empty-state'><span>📚</span><p>Courses page coming soon!</p></div>";
    }
  } else if (pageName === "instructors") {
    instructorsPage.load();
  } else if (pageName === "employees") {
    employeesPage.load();
  } else {
    console.log("Page not found:", pageName);
    document.getElementById("app").innerHTML =
      "<div class='empty-state'><span>❓</span><p>Page not found</p></div>";
  }
}

const navButtons = document.querySelectorAll(".nav-link");

for (let i = 0; i < navButtons.length; i++) {
  const button = navButtons[i];

  button.onclick = function () {
    loadPage(this.dataset.page);
  };
}

window.loadPage = loadPage;

const savedPage = localStorage.getItem("currentPage") || "students";
loadPage(savedPage);
