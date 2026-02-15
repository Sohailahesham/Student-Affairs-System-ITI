import ApiService from "../services/apiService.js";
import Table from "../components/Table.js";
import Form from "../components/Form.js";
import Instructor from "../models/Instructor.js";

const instructorFields = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "age", label: "Age", type: "number", required: true },
  {
    name: "specialization",
    label: "Specialization",
    type: "text",
    required: true,
  },
  { name: "position", label: "Position", type: "text", required: true },
  { name: "office", label: "Office", type: "text", required: true },
  { name: "salary", label: "Salary", type: "number", required: true },
  { name: "startDate", label: "Start Date", type: "date", required: true },
  { name: "department", label: "Department", type: "text", required: true },
];

export default class InstructorsPage {
  constructor() {
    this.allInstructors = [];
    this.filteredInstructors = [];
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
    //& Search input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.placeholder =
        "Search by name, specialization, position, department, or office";
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
      addBtn.textContent = "Add New Instructor";
      addBtn.onclick = () => this.add();
    }
  }

  async loadData() {
    try {
      this.allInstructors = await ApiService.getAll("instructors");
      this.allInstructors = this.allInstructors.map((inst) =>
        Instructor.fromJson(inst),
      );
      this.filteredInstructors = [...this.allInstructors];
      await this.refreshTable();
    } catch (err) {
      console.log("Failed to load instructors: " + err.message);
    }
  }

  //^ Prepare table data
  prepareTableData(instructors) {
    return instructors.map((inst) => ({
      id: inst.id,
      name: inst.name,
      age: inst.age,
      specialization: inst.specialization,
      position: inst.position,
      office: inst.office,
      salary: inst.salary,
      startDate: inst.startDate,
      department: inst.department,
      coursesCount: inst.courses?.length || 0,
      studentsCount: inst.students?.length || 0,
    }));
  }

  //^ Sort data
  sortData(data, field, order) {
    return [...data].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      //~ Sort numbers
      if (
        field === "age" ||
        field === "salary" ||
        field === "coursesCount" ||
        field === "studentsCount"
      ) {
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

  //^ Refresh Table
  async refreshTable() {
    let tableData = this.prepareTableData(this.filteredInstructors);

    if (this.sortField) {
      tableData = this.sortData(tableData, this.sortField, this.sortOrder);
    }

    this.renderTable(tableData);
    this.renderPagination(tableData.length);
  }

  //^ Render Table
  renderTable(tableData) {
    const start = (this.curr - 1) * this.rowsPP;
    const end = start + this.rowsPP;
    const dataToShow = tableData.slice(start, end);

    const columns = [
      "id",
      "name",
      "age",
      "specialization",
      "position",
      "office",
      "salary",
      "startDate",
      "department",
      "coursesCount",
      "studentsCount",
    ];

    const table = new Table(
      "app",
      columns,
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
      this.filteredInstructors = [...this.allInstructors];
    } else {
      this.filteredInstructors = this.allInstructors.filter((inst) => {
        const nameMatch =
          inst.name?.toLowerCase().includes(searchValue) || false;
        const specMatch =
          inst.specialization?.toLowerCase().includes(searchValue) || false;
        const posMatch =
          inst.position?.toLowerCase().includes(searchValue) || false;
        const deptMatch =
          inst.department?.toLowerCase().includes(searchValue) || false;
        const officeMatch =
          inst.office?.toLowerCase().includes(searchValue) || false;
        return nameMatch || specMatch || posMatch || deptMatch || officeMatch;
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

  //^ Add Instructor
  async add() {
    const form = new Form(
      "form-container",
      instructorFields,
      async (data) => {
        try {
          const validationResult = this.validate(
            data.name,
            data.age,
            data.specialization,
            data.position,
            data.office,
            data.salary,
            data.startDate,
            data.department,
          );

          if (validationResult !== true) {
            validationResult.forEach((err) => {
              const input = document.querySelector(`[name="${err.input}"]`);
              if (input) {
                form.showError(input, err.msg);
              }
            });
            return;
          }

          const instructor = new Instructor(
            data.name,
            parseInt(data.age),
            data.specialization,
            data.position,
            data.office,
            parseFloat(data.salary),
            data.startDate,
            data.department,
            [],
            [],
          );

          // إنشاء instructor في السيرفر (في instructors)
          const newInstructor = await ApiService.create(
            "instructors",
            instructor.toJSON(),
          );

          try {
            await ApiService.create("employees", instructor.toJSON());
          } catch (error) {
            console.log("Employee creation skipped:", error);
          }

          this.allInstructors.push(Instructor.fromJson(newInstructor));
          this.filteredInstructors = [...this.allInstructors];
          await this.refreshTable();
          form.clearForm();
        } catch (error) {
          alert("Error adding instructor: " + error.message);
        }
      },
      "create",
    );

    form.render();
  }

  //^ Edit Instructor
  async edit(id) {
    const data = await ApiService.getById("instructors", id);
    const instructor = Instructor.fromJson(data);

    const form = new Form(
      "form-container",
      instructorFields,
      async (updatedData) => {
        try {
          const validationResult = this.validate(
            updatedData.name,
            updatedData.age,
            updatedData.specialization,
            updatedData.position,
            updatedData.office,
            updatedData.salary,
            updatedData.startDate,
            updatedData.department,
          );

          if (validationResult !== true) {
            validationResult.forEach((err) => {
              const input = document.querySelector(`[name="${err.input}"]`);
              if (input) form.showError(input, err.msg);
            });
            return;
          }

          const updatedInstructor = new Instructor(
            updatedData.name,
            parseInt(updatedData.age),
            updatedData.specialization,
            updatedData.position,
            updatedData.office,
            parseFloat(updatedData.salary),
            updatedData.startDate,
            updatedData.department,
            instructor.courses,
            instructor.students,
          );
          updatedInstructor.id = id;

          const savedInstructor = await ApiService.update(
            "instructors",
            id,
            updatedInstructor.toJSON(),
          );

          try {
            await ApiService.update(
              "employees",
              id,
              updatedInstructor.toJSON(),
            );
          } catch {
            console.log("Employee update skipped - not found");
          }

          const index = this.allInstructors.findIndex((i) => i.id == id);
          this.allInstructors[index] = Instructor.fromJson(savedInstructor);
          this.filteredInstructors = [...this.allInstructors];
          await this.refreshTable();
          form.clearForm();
        } catch (error) {
          alert("Error updating instructor: " + error.message);
        }
      },
      "edit",
      instructor.toJSON(),
    );

    form.render();
  }

  //^ Delete Instructor
  async delete(id) {
    if (!confirm("Are you sure you want to delete this instructor?")) return;

    try {
      //* Check if instructor has students
      const instructor = this.allInstructors.find((i) => i.id == id);
      if (instructor.students && instructor.students.length > 0) {
        alert(
          `Cannot delete: This instructor advises ${instructor.students.length} student(s).`,
        );
        return;
      }

      //* Check if instructor teaches courses
      if (instructor.courses && instructor.courses.length > 0) {
        alert(
          `Cannot delete: This instructor teaches ${instructor.courses.length} course(s).`,
        );
        return;
      }

      //* Delete from instructors
      await ApiService.delete("instructors", id);

      //* Also try to delete from employees if exists
      try {
        await ApiService.delete("employees", id);
      } catch {
        console.log("Employee delete skipped - not found");
      }

      this.allInstructors = this.allInstructors.filter((i) => i.id != id);
      this.filteredInstructors = [...this.allInstructors];
      await this.refreshTable();
    } catch (error) {
      alert("Error deleting instructor: " + error.message);
    }
  }

  //^ Validate
  validate(
    name,
    age,
    specialization,
    position,
    office,
    salary,
    startDate,
    department,
  ) {
    const errors = [];

    // Name validation
    if (!name || name.trim() === "") {
      errors.push({ input: "name", msg: "Name is required." });
    } else {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(name)) {
        errors.push({
          input: "name",
          msg: "Name can only contain letters and spaces.",
        });
      }
    }

    // Age validation
    if (!age) {
      errors.push({ input: "age", msg: "Age is required." });
    } else {
      const ageNum = Number(age);
      if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
        errors.push({ input: "age", msg: "Age must be a whole number." });
      } else if (ageNum < 18 || ageNum > 70) {
        errors.push({ input: "age", msg: "Age must be between 18 and 70." });
      }
    }

    // Specialization validation
    if (!specialization || specialization.trim() === "") {
      errors.push({
        input: "specialization",
        msg: "Specialization is required.",
      });
    }

    // Position validation
    if (!position || position.trim() === "") {
      errors.push({ input: "position", msg: "Position is required." });
    } else {
      const positionRegex = /^[A-Za-z\s]+$/;
      if (!positionRegex.test(position)) {
        errors.push({
          input: "position",
          msg: "Position can only contain letters and spaces.",
        });
      }
    }

    // Office validation
    if (!office || office.trim() === "") {
      errors.push({ input: "office", msg: "Office is required." });
    }

    // Salary validation
    if (!salary) {
      errors.push({ input: "salary", msg: "Salary is required." });
    } else {
      const salaryNum = Number(salary);
      if (isNaN(salaryNum) || salaryNum < 0) {
        errors.push({
          input: "salary",
          msg: "Salary must be a positive number.",
        });
      }
    }

    // Start Date validation
    if (!startDate) {
      errors.push({ input: "startDate", msg: "Start date is required." });
    }

    // Department validation
    if (!department || department.trim() === "") {
      errors.push({ input: "department", msg: "Department is required." });
    }

    return errors.length > 0 ? errors : true;
  }
}
