import ApiService from "../services/apiService.js";
import Table from "../components/Table.js";
import Form from "../components/Form.js";
import Student from "../models/Student.js";
import scrollToForm from "../../helper/scrollToForm.js";

const studentFields = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "age", label: "Age", type: "number", required: true },
  { name: "grade", label: "Grade", type: "text", required: true },
  { name: "major", label: "Major", type: "text", required: true },
  {
    name: "advisorId",
    label: "Advisor",
    tag: "select",
    required: false,
    options: [],
  },
  {
    name: "courses",
    label: "Courses",
    tag: "select-multiple",
    required: false,
    options: [],
  },
];

export default class StudentsPage {
  constructor() {
    this.allStudents = [];
    this.filteredStudents = [];
    this.courses = [];
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
    title.innerText = "Students";
    //& Search input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.placeholder = "Search by name or major";
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

    //& Add button
    const addBtn = document.getElementById("addElementBtn");
    if (addBtn) {
      addBtn.textContent = "Add New Student";
      addBtn.onclick = () => this.add();
    }
  }

  //^ Load Data Method
  async loadData() {
    try {
      const [students, courses, instructors] = await Promise.all([
        ApiService.getAll("students"),
        ApiService.getAll("courses"),
        ApiService.getAll("instructors"),
      ]);

      this.allStudents = students;
      this.courses = courses;
      this.instructors = instructors;
      this.filteredStudents = [...this.allStudents];
      await this.refreshTable();
    } catch (error) {
      console.log("Error loading data:", error);
      alert("Failed to load data. Make sure json-server is running.");
    }
  }

  //^ Preparing the table data
  async prepareTableData(students) {
    const tableData = [];

    const instructorMap = {};
    this.instructors.forEach((inst) => {
      instructorMap[inst.id] = inst.name;
    });

    for (const std of students) {
      const row = {
        id: std.id,
        name: std.name,
        age: std.age,
        grade: std.grade,
        major: std.major,
        advisorName: std.advisorId
          ? instructorMap[std.advisorId] || "No Advisor"
          : "No Advisor",
        coursesCount: std.courses?.length || 0,
      };

      tableData.push(row);
    }

    return tableData;
  }

  //^ Refresh Table
  async refreshTable() {
    let tableData = await this.prepareTableData(this.filteredStudents);

    if (this.sortField) {
      tableData = this.sortData(tableData, this.sortField, this.sortOrder);
    }

    this.renderTable(tableData);
    this.renderPagination(tableData.length);
  }

  //^ Sort data
  sortData(data, field, order) {
    return [...data].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      //~ Sort numbers
      if (field === "age" || field === "coursesCount") {
        return order === "asc" ? valA - valB : valB - valA;
      }

      //~ Sort strings
      valA = valA?.toString().toLowerCase() || "";
      valB = valB?.toString().toLowerCase() || "";

      if (valA > valB) return order === "asc" ? 1 : -1;
      if (valA < valB) return order === "asc" ? -1 : 1;
      return 0;
    });
  }

  //^ Render Table
  renderTable(tableData) {
    const start = (this.curr - 1) * this.rowsPP;
    const end = start + this.rowsPP;
    const dataToShow = tableData.slice(start, end);

    const table = new Table(
      "app",
      ["name", "age", "grade", "major", "advisorName", "coursesCount"],
      dataToShow,
      (id) => this.edit(id),
      (id) => this.delete(id),
      (field) => this.handleSort(field),
      this.sortField,
      this.sortOrder,
    );

    table.render();
  }

  //^ Handle Sort
  handleSort(field) {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    } else {
      this.sortField = field;
      this.sortOrder = "asc";
    }

    this.refreshTable();
  }

  //^ Search
  search() {
    const searchValue =
      document.getElementById("searchInput")?.value.toLowerCase() || "";

    if (!searchValue) {
      this.filteredStudents = [...this.allStudents];
    } else {
      this.filteredStudents = this.allStudents.filter((student) => {
        const nameMatch =
          student.name?.toLowerCase().includes(searchValue) || false;
        const majorMatch =
          student.major?.toLowerCase().includes(searchValue) || false;
        return nameMatch || majorMatch;
      });
    }

    this.curr = 1;
    this.refreshTable();
  }

  //^ Pagination
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

  //^ Add Student
  async add() {
    const advisorOptions = this.instructors.map((inst) => ({
      value: inst.id,
      label: inst.name,
    }));

    const courseOptions = this.courses.map((course) => ({
      value: course.id,
      label: `${course.name} (${course.code})`,
    }));

    const fieldsWithOptions = studentFields.map((field) => {
      if (field.name === "advisorId") {
        return { ...field, options: advisorOptions };
      }
      if (field.name === "courses") {
        return { ...field, options: courseOptions };
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
            data.age,
            data.grade,
            data.major,
          );

          if (validationResult !== true) {
            validationResult.forEach((err) => {
              const input = document.querySelector(`[name="${err.input}"]`);
              if (input) form.showError(input, err.msg);
            });
            return;
          }

          const student = new Student(
            data.name,
            parseInt(data.age),
            data.grade,
            data.major,
            data.advisorId || null,
          );

          student.courses = data.courses || [];

          const savedStudent = await ApiService.create(
            "students",
            student.toJSON(),
          );

          //* update advisor
          if (savedStudent.advisorId) {
            try {
              const instructor = await ApiService.getById(
                "instructors",
                savedStudent.advisorId,
              );
              if (instructor) {
                if (!instructor.students) instructor.students = [];
                instructor.students.push(savedStudent.id);
                await ApiService.update(
                  "instructors",
                  savedStudent.advisorId,
                  instructor,
                );
              }
            } catch (error) {
              console.log("Error updating instructor:", error);
            }
          }

          //* update courses
          if (savedStudent.courses && savedStudent.courses.length > 0) {
            for (const crsId of savedStudent.courses) {
              try {
                const course = await ApiService.getById("courses", crsId);
                if (course) {
                  if (!course.students) course.students = [];
                  course.students.push(savedStudent.id);
                  await ApiService.update("courses", crsId, course);
                }
              } catch (error) {
                console.log(`Error updating course ${crsId}:`, error);
              }
            }
          }

          await this.loadData();
          form.clearForm();
        } catch (error) {
          console.log(error);
          alert("Error adding student: " + error.message);
        }
      },
      "create",
    );
    form.render();
    scrollToForm();
  }

  //^ Edit Student
  async edit(id) {
    const oldData = this.allStudents.find((s) => s.id == id);
    if (!oldData) {
      alert("Student not found");
      return;
    }

    const advisorOptions = this.instructors.map((inst) => ({
      value: inst.id,
      label: inst.name,
    }));

    const courseOptions = this.courses.map((course) => ({
      value: course.id,
      label: `${course.name} (${course.code})`,
    }));

    const fieldsWithOptions = studentFields.map((field) => {
      if (field.name === "advisorId") {
        return { ...field, options: advisorOptions };
      }
      if (field.name === "courses") {
        return { ...field, options: courseOptions };
      }
      return field;
    });

    const formData = {
      ...oldData,
      courses: oldData.courses || [],
    };

    const form = new Form(
      "form-container",
      fieldsWithOptions,
      async (updatedData) => {
        try {
          const validationResult = this.validate(
            updatedData.name,
            updatedData.age,
            updatedData.grade,
            updatedData.major,
          );

          if (validationResult !== true) {
            validationResult.forEach((err) => {
              const input = document.querySelector(`[name="${err.input}"]`);
              if (input) form.showError(input, err.msg);
            });
            return;
          }

          const student = new Student(
            updatedData.name,
            parseInt(updatedData.age),
            updatedData.grade,
            updatedData.major,
            updatedData.advisorId || null,
          );
          student.id = id;
          student.courses = updatedData.courses || [];

          if (
            oldData.advisorId
            && oldData.advisorId !== updatedData.advisorId
          ) {
            try {
              const oldInstructor = await ApiService.getById(
                "instructors",
                oldData.advisorId,
              );
              if (oldInstructor && oldInstructor.students) {
                oldInstructor.students = oldInstructor.students.filter(
                  (sId) => sId !== id,
                );
                await ApiService.update(
                  "instructors",
                  oldData.advisorId,
                  oldInstructor,
                );
              }
            } catch (error) {
              console.log("Error updating old instructor:", error);
            }
          }

          if (updatedData.advisorId) {
            try {
              const newInstructor = await ApiService.getById(
                "instructors",
                updatedData.advisorId,
              );
              if (newInstructor) {
                if (!newInstructor.students) newInstructor.students = [];
                if (!newInstructor.students.includes(id)) {
                  newInstructor.students.push(id);
                  await ApiService.update(
                    "instructors",
                    updatedData.advisorId,
                    newInstructor,
                  );
                }
              }
            } catch (error) {
              console.log("Error updating new instructor:", error);
            }
          }

          const coursesToRemove =
            oldData.courses?.filter((c) => !updatedData.courses?.includes(c))
            || [];
          const coursesToAdd =
            updatedData.courses?.filter((c) => !oldData.courses?.includes(c))
            || [];

          for (const crsId of coursesToRemove) {
            try {
              const course = await ApiService.getById("courses", crsId);
              if (course && course.students) {
                course.students = course.students.filter((sId) => sId !== id);
                await ApiService.update("courses", crsId, course);
              }
            } catch (error) {
              console.log(`Error removing from course ${crsId}:`, error);
            }
          }

          for (const crsId of coursesToAdd) {
            try {
              const course = await ApiService.getById("courses", crsId);
              if (course) {
                if (!course.students) course.students = [];
                if (!course.students.includes(id)) {
                  course.students.push(id);
                  await ApiService.update("courses", crsId, course);
                }
              }
            } catch (error) {
              console.log(`Error adding to course ${crsId}:`, error);
            }
          }

          await ApiService.update("students", id, student.toJSON());

          await this.loadData();
          form.clearForm();
        } catch (error) {
          alert(error.message);
        }
      },
      "edit",
      formData,
    );
    form.render();
    scrollToForm();
  }

  //^ Delete Student
  async delete(id) {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        const student = await ApiService.getById("students", id);

        if (student.advisorId) {
          try {
            const instructor = await ApiService.getById(
              "instructors",
              student.advisorId,
            );
            if (instructor && instructor.students) {
              const index = instructor.students.indexOf(id);
              if (index !== -1) {
                instructor.students.splice(index, 1);
                await ApiService.update(
                  "instructors",
                  student.advisorId,
                  instructor,
                );
              }
            }
          } catch (error) {
            console.log("Instructor not found or error updating:", error);
          }
        }

        if (student.courses && student.courses.length > 0) {
          for (const crsId of student.courses) {
            try {
              const course = await ApiService.getById("courses", crsId);
              if (course && course.students) {
                const index = course.students.indexOf(id);
                if (index !== -1) {
                  course.students.splice(index, 1);
                  await ApiService.update("courses", crsId, course);
                }
              }
            } catch (error) {
              console.log(
                `Course ${crsId} not found or error updating:`,
                error,
              );
            }
          }
        }

        await ApiService.delete("students", id);

        await this.loadData();
      } catch (error) {
        alert("Error deleting student: " + error.message);
      }
    }
  }

  //^ Validate
  validate(name, age, grade, major) {
    const errors = [];

    if (!name || name.trim() === "") {
      errors.push({ input: "name", msg: "Name is required." });
    } else {
      for (let char of name) {
        if (
          !(
            (char >= "A" && char <= "Z")
            || (char >= "a" && char <= "z")
            || char === " "
          )
        ) {
          errors.push({
            input: "name",
            msg: "Name can only contain letters and spaces.",
          });
          break;
        }
      }
    }

    if (!age) {
      errors.push({ input: "age", msg: "Age is required." });
    } else if (isNaN(age)) {
      errors.push({ input: "age", msg: "Age must be a number." });
    } else if (age < 5 || age > 35) {
      errors.push({ input: "age", msg: "Age must be between 5 and 35." });
    }

    if (!grade || grade.trim() === "") {
      errors.push({ input: "grade", msg: "Grade is required." });
    } else {
      const validGrade = /^[A-Fa-f][+-]?$/;
      if (!validGrade.test(grade)) {
        errors.push({
          input: "grade",
          msg: "Grade must be A-F with optional + or - (e.g., A, B+, C-)",
        });
      }
    }

    if (!major || major.trim() === "") {
      errors.push({ input: "major", msg: "Major is required." });
    } else {
      for (let char of major) {
        if (
          !(
            (char >= "A" && char <= "Z")
            || (char >= "a" && char <= "z")
            || char === " "
          )
        ) {
          errors.push({
            input: "major",
            msg: "Major can only contain letters and spaces.",
          });
          break;
        }
      }
    }

    return errors.length > 0 ? errors : true;
  }
}
