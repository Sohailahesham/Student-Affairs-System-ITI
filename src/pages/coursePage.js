import ApiService from "../services/apiService.js";
import Table from "../components/Table.js";
import Form from "../components/Form.js";
import Course from "../models/Course.js";
import scrollToForm from "../../helper/scrollToForm.js";

const courseFields = [
  { name: "name", label: "Course Name", type: "text", required: true },
  { name: "code", label: "Course Code", type: "text", required: true },
  { name: "credits", label: "Credits", type: "number", required: true },
  {
    name: "instructorId",
    label: "Instructor",
    tag: "select",
    required: false,
    options: [],
  },
];

export default class CoursesPage {
  constructor() {
    this.allCourses = [];
    this.filteredCourses = [];
    this.instructors = [];
    this.sortField = null;
    this.sortOrder = "asc";
    this.rowsPP = 10;
    this.curr = 1;
  }

  async load() {
    this.setupEventListeners();
    await this.loadData();
  }

  setupEventListeners() {
    const title = document.getElementById("pageName");
    title.innerText = "Courses";
    //& Search input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.placeholder = "Search by name, code, or credits";
      searchInput.value = "";
      searchInput.onkeyup = () => this.search();
    }

    //& Rows selector
    const rowsSelect = document.getElementById("rowsSelect");
    if (rowsSelect) {
      rowsSelect.value = this.rowsPP;
      rowsSelect.onchange = (e) => {
        this.rowsPP = Number(e.target.value);
        this.curr = 1;
        this.refreshTable();
      };
    }

    const addBtn = document.getElementById("addElementBtn");
    if (addBtn) {
      addBtn.textContent = "Add New Course";
      addBtn.onclick = () => this.add();
    }
  }

  async loadData() {
    try {
      const [courses, instructors] = await Promise.all([
        ApiService.getAll("courses"),
        ApiService.getAll("instructors"),
      ]);

      this.allCourses = courses.map((course) => Course.fromJson(course));
      this.instructors = instructors;
      this.filteredCourses = [...this.allCourses];
      await this.refreshTable();
    } catch (err) {
      alert("Failed to load courses: " + err.message);
    }
  }

  prepareTableData(courses) {
    const instructorMap = {};
    this.instructors.forEach((inst) => {
      instructorMap[inst.id] = inst.name;
    });

    return courses.map((course) => ({
      id: course.id,
      name: course.name,
      code: course.code,
      credits: course.credits,
      instructorName: instructorMap[course.instructorId] || "No Instructor",
      studentsCount: course.students?.length || 0,
    }));
  }

  sortData(data, field, order) {
    return [...data].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (field === "credits" || field === "studentsCount") {
        return order === "asc" ? valA - valB : valB - valA;
      }

      valA = valA?.toString().toLowerCase() || "";
      valB = valB?.toString().toLowerCase() || "";

      if (valA > valB) return order === "asc" ? 1 : -1;
      if (valA < valB) return order === "asc" ? -1 : 1;
      return 0;
    });
  }

  async refreshTable() {
    let tableData = this.prepareTableData(this.filteredCourses);

    if (this.sortField) {
      tableData = this.sortData(tableData, this.sortField, this.sortOrder);
    }

    this.renderTable(tableData);
    this.renderPagination(tableData.length);
  }

  renderTable(tableData) {
    const start = (this.curr - 1) * this.rowsPP;
    const end = start + this.rowsPP;
    const dataToShow = tableData.slice(start, end);

    const table = new Table(
      "app",
      ["name", "code", "credits", "instructorName", "studentsCount"],
      dataToShow,
      (id) => this.edit(id),
      (id) => this.delete(id),
      (field) => this.handleSort(field),
      this.sortField,
      this.sortOrder,
    );

    table.render();
  }

  handleSort(field) {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    } else {
      this.sortField = field;
      this.sortOrder = "asc";
    }

    this.refreshTable();
  }

  search() {
    const searchValue =
      document.getElementById("searchInput")?.value.toLowerCase() || "";

    if (!searchValue) {
      this.filteredCourses = [...this.allCourses];
    } else {
      this.filteredCourses = this.allCourses.filter((course) => {
        const nameMatch =
          course.name?.toLowerCase().includes(searchValue) || false;
        const codeMatch =
          course.code?.toLowerCase().includes(searchValue) || false;
        const creditsMatch =
          course.credits?.toString().includes(searchValue) || false;
        return nameMatch || codeMatch || creditsMatch;
      });
    }

    this.curr = 1;
    this.refreshTable();
  }

  renderPagination(totalItems) {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    const total = Math.ceil(totalItems / this.rowsPP);

    for (let i = 1; i <= total; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.id = "pageBtn";

      if (i === this.curr) {
        btn.style.backgroundColor = "#4d96d2";
        btn.style.color = "white";
      }

      btn.onclick = () => {
        this.curr = i;
        this.refreshTable();
      };

      paginationContainer.appendChild(btn);
    }
  }

  async add() {
    const instructorOptions = this.instructors.map((inst) => ({
      value: inst.id,
      label: `${inst.name} (${inst.department || "No Dept"})`,
    }));

    const fieldsWithOptions = courseFields.map((field) => {
      if (field.name === "instructorId") {
        return { ...field, options: instructorOptions };
      }
      return field;
    });

    const form = new Form(
      "form-container",
      fieldsWithOptions,
      async (data) => {
        try {
          const validationResult = this.validate(
            data.name,
            data.code,
            data.credits,
            data.instructorId,
          );

          if (validationResult !== true) {
            validationResult.forEach((err) => {
              const input = document.querySelector(`[name="${err.input}"]`);
              if (input) form.showError(input, err.msg);
            });
            return;
          }

          const course = new Course(
            data.name,
            data.code,
            parseInt(data.credits),
            data.instructorId || null,
            [],
          );

          const newCourse = await ApiService.create("courses", course.toJSON());

          if (newCourse.instructorId) {
            try {
              const instructor = await ApiService.getById(
                "instructors",
                newCourse.instructorId,
              );
              if (instructor) {
                if (!instructor.courses) instructor.courses = [];
                instructor.courses.push(newCourse.id);
                await ApiService.update(
                  "instructors",
                  newCourse.instructorId,
                  instructor,
                );
              }
            } catch (error) {
              console.log("Error updating instructor:", error);
            }
          }

          this.allCourses.push(Course.fromJson(newCourse));
          this.filteredCourses = [...this.allCourses];
          await this.refreshTable();
          form.clearForm();
        } catch (error) {
          alert("Error adding course: " + error.message);
        }
      },
      "create",
    );

    form.render();
    scrollToForm();
  }

  async edit(id) {
    const data = await ApiService.getById("courses", id);
    const course = Course.fromJson(data);

    const instructorOptions = this.instructors.map((inst) => ({
      value: inst.id,
      label: `${inst.name} (${inst.department || "No Dept"})`,
    }));

    const fieldsWithOptions = courseFields.map((field) => {
      if (field.name === "instructorId") {
        return { ...field, options: instructorOptions };
      }
      return field;
    });

    const form = new Form(
      "form-container",
      fieldsWithOptions,
      async (updatedData) => {
        try {
          const validationResult = this.validate(
            updatedData.name,
            updatedData.code,
            updatedData.credits,
            updatedData.instructorId,
          );

          if (validationResult !== true) {
            validationResult.forEach((err) => {
              const input = document.querySelector(`[name="${err.input}"]`);
              if (input) form.showError(input, err.msg);
            });
            return;
          }

          const updatedCourse = new Course(
            updatedData.name,
            updatedData.code,
            parseInt(updatedData.credits),
            updatedData.instructorId || null,
            course.students,
          );
          updatedCourse.id = id;

          if (course.instructorId !== updatedData.instructorId) {
            if (course.instructorId) {
              try {
                const oldInstructor = await ApiService.getById(
                  "instructors",
                  course.instructorId,
                );
                if (oldInstructor && oldInstructor.courses) {
                  oldInstructor.courses = oldInstructor.courses.filter(
                    (cId) => cId !== id,
                  );
                  await ApiService.update(
                    "instructors",
                    course.instructorId,
                    oldInstructor,
                  );
                }
              } catch (error) {
                console.log("Error updating old instructor:", error);
              }
            }

            if (updatedData.instructorId) {
              try {
                const newInstructor = await ApiService.getById(
                  "instructors",
                  updatedData.instructorId,
                );
                if (newInstructor) {
                  if (!newInstructor.courses) newInstructor.courses = [];
                  if (!newInstructor.courses.includes(id)) {
                    newInstructor.courses.push(id);
                    await ApiService.update(
                      "instructors",
                      updatedData.instructorId,
                      newInstructor,
                    );
                  }
                }
              } catch (error) {
                console.log("Error updating new instructor:", error);
              }
            }
          }

          const savedCourse = await ApiService.update(
            "courses",
            id,
            updatedCourse.toJSON(),
          );

          const index = this.allCourses.findIndex((c) => c.id == id);
          this.allCourses[index] = Course.fromJson(savedCourse);
          this.filteredCourses = [...this.allCourses];
          await this.refreshTable();
          form.clearForm();
        } catch (error) {
          alert("Error updating course: " + error.message);
        }
      },
      "edit",
      {
        ...course.toJSON(),
        instructorId: course.instructorId || "",
      },
    );

    form.render();
    scrollToForm();
  }

  async delete(id) {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      // Check if course has students
      const course = this.allCourses.find((c) => c.id == id);
      if (course.students && course.students.length > 0) {
        alert(
          `Cannot delete: This course has ${course.students.length} enrolled student(s).`,
        );
        return;
      }

      if (course.instructorId) {
        try {
          const instructor = await ApiService.getById(
            "instructors",
            course.instructorId,
          );
          if (instructor && instructor.courses) {
            instructor.courses = instructor.courses.filter((cId) => cId !== id);
            await ApiService.update(
              "instructors",
              course.instructorId,
              instructor,
            );
          }
        } catch (error) {
          console.log("Error updating instructor:", error);
        }
      }

      await ApiService.delete("courses", id);

      this.allCourses = this.allCourses.filter((c) => c.id != id);
      this.filteredCourses = [...this.allCourses];
      await this.refreshTable();
    } catch (err) {
      alert("Error deleting course: " + err.message);
    }
  }

  validate(name, code, credits, instructorId) {
    const errors = [];

    // Name validation
    if (!name || name.trim() === "") {
      errors.push({ input: "name", msg: "Course name is required." });
    } else {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(name)) {
        errors.push({
          input: "name",
          msg: "Name can only contain letters and spaces.",
        });
      }
    }

    // Code validation
    if (!code || code.trim() === "") {
      errors.push({ input: "code", msg: "Course code is required." });
    } else {
      const codeRegex = /^[A-Z0-9]+$/;
      if (!codeRegex.test(code)) {
        errors.push({
          input: "code",
          msg: "Course code must contain only uppercase letters and numbers.",
        });
      }
    }

    // Credits validation
    if (!credits) {
      errors.push({ input: "credits", msg: "Credits are required." });
    } else {
      const creditsNum = Number(credits);
      if (isNaN(creditsNum)) {
        errors.push({ input: "credits", msg: "Credits must be a number." });
      } else if (!Number.isInteger(creditsNum)) {
        errors.push({
          input: "credits",
          msg: "Credits must be a whole number.",
        });
      } else if (creditsNum < 1 || creditsNum > 6) {
        errors.push({
          input: "credits",
          msg: "Credits must be between 1 and 6.",
        });
      }
    }

    return errors.length > 0 ? errors : true;
  }
}
