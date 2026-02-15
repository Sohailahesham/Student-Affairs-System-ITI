import ApiService from "../services/apiService.js";
import Table from "../components/Table.js";
import Form from "../components/Form.js";
import Employee from "../models/Employee.js";
import Instructor from "../models/Instructor.js";

const employeeFields = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "age", label: "Age", type: "number", required: true },
  { name: "position", label: "Position", type: "text", required: true },
  { name: "office", label: "Office", type: "text", required: true },
  { name: "salary", label: "Salary", type: "number", required: true },
  { name: "startDate", label: "Start Date", type: "date", required: true },
];

const allFields = [
  {
    name: "type",
    label: "Type",
    tag: "select",
    required: true,
    options: [
      { value: "employee", label: "Employee" },
      { value: "instructor", label: "Instructor" },
    ],
  },
  ...employeeFields,
  {
    name: "specialization",
    label: "Specialization",
    type: "text",
    required: false,
  },
  { name: "department", label: "Department", type: "text", required: false },
];

export default class EmployeesPage {
  constructor() {
    this.allEmployees = [];
    this.filteredEmployees = [];
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
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.placeholder = "Search by name, position, or office";
      searchInput.value = "";
      searchInput.onkeyup = () => this.search();
    }

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
      addBtn.textContent = "Add New Employee / Instructor";
      addBtn.onclick = () => this.add();
    }
  }

  async loadData() {
    try {
      this.allEmployees = await ApiService.getAll("employees");
      this.filteredEmployees = this.allEmployees;
      await this.refreshTable();
    } catch (error) {
      console.log("Error loading employees:", error);
      alert("Failed to load employees");
    }
  }

  async prepareTableData(employees) {
    return employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      age: emp.age,
      position: emp.position,
      office: emp.office,
      salary: emp.salary,
      startDate: emp.startDate,
    }));
  }

  async refreshTable() {
    let tableData = await this.prepareTableData(this.filteredEmployees);

    if (this.sortField) {
      tableData = this.sortData(tableData, this.sortField, this.sortOrder);
    }

    this.renderTable(tableData);
    this.renderPagination(tableData.length);
  }

  sortData(data, field, order) {
    return [...data].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (field === "age" || field === "salary") {
        return order === "asc" ? valA - valB : valB - valA;
      }

      valA = valA?.toString().toLowerCase() || "";
      valB = valB?.toString().toLowerCase() || "";

      if (valA > valB) return order === "asc" ? 1 : -1;
      if (valA < valB) return order === "asc" ? -1 : 1;
      return 0;
    });
  }

  renderTable(tableData) {
    const start = (this.curr - 1) * this.rowsPP;
    const end = start + this.rowsPP;
    const dataToShow = tableData.slice(start, end);

    const table = new Table(
      "app",
      ["id", "name", "age", "position", "office", "salary", "startDate"],
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
      this.filteredEmployees = this.allEmployees;
    } else {
      this.filteredEmployees = this.allEmployees.filter((emp) => {
        const nameMatch =
          emp.name?.toLowerCase().includes(searchValue) || false;
        const positionMatch =
          emp.position?.toLowerCase().includes(searchValue) || false;
        const officeMatch =
          emp.office?.toLowerCase().includes(searchValue) || false;
        return nameMatch || positionMatch || officeMatch;
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
      btn.id = "pageBtn";
      btn.textContent = i;

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
    const form = new Form(
      "form-container",
      allFields,
      async (data) => {
        try {
          const baseValidation = this.validateBaseFields(
            data.name,
            data.age,
            data.position,
            data.office,
            data.salary,
            data.startDate,
          );

          if (baseValidation !== true) {
            baseValidation.forEach((err) => {
              const input = document.querySelector(`[name="${err.input}"]`);
              if (input) form.showError(input, err.msg);
            });
            return;
          }

          if (data.type === "instructor") {
            if (!data.specialization || data.specialization.trim() === "") {
              form.showError(
                document.querySelector('[name="specialization"]'),
                "Specialization is required for instructors",
              );
              return;
            }
            if (!data.department || data.department.trim() === "") {
              form.showError(
                document.querySelector('[name="department"]'),
                "Department is required for instructors",
              );
              return;
            }
          }

          const employee = new Employee(
            data.name,
            parseInt(data.age),
            data.position,
            data.office,
            parseFloat(data.salary),
            data.startDate,
          );

          const savedEmployee = await ApiService.create(
            "employees",
            employee.toJSON(),
          );

          if (data.type === "instructor") {
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
            instructor.id = savedEmployee.id;

            await ApiService.create("instructors", instructor.toJSON());
          }

          await this.loadData();
          form.clearForm();
        } catch (error) {
          alert("Error: " + error.message);
        }
      },
      "create",
    );
    form.render();
  }

  async edit(id) {
    const data = await ApiService.getById("employees", id);

    const form = new Form(
      "form-container",
      employeeFields,
      async (updatedData) => {
        try {
          const baseValidation = this.validateBaseFields(
            updatedData.name,
            updatedData.age,
            updatedData.position,
            updatedData.office,
            updatedData.salary,
            updatedData.startDate,
          );

          if (baseValidation !== true) {
            baseValidation.forEach((err) => {
              const input = document.querySelector(`[name="${err.input}"]`);
              if (input) form.showError(input, err.msg);
            });
            return;
          }

          const employee = new Employee(
            updatedData.name,
            parseInt(updatedData.age),
            updatedData.position,
            updatedData.office,
            parseFloat(updatedData.salary),
            updatedData.startDate,
          );
          employee.id = id;

          await ApiService.update("employees", id, employee.toJSON());

          try {
            const instructor = await ApiService.getById("instructors", id);
            if (instructor) {
              instructor.name = updatedData.name;
              instructor.age = parseInt(updatedData.age);
              instructor.position = updatedData.position;
              instructor.office = updatedData.office;
              instructor.salary = parseFloat(updatedData.salary);
              instructor.startDate = updatedData.startDate;

              await ApiService.update("instructors", id, instructor);
            }
          } catch {
            // Not an instructor, continue
          }

          await this.loadData();
          form.clearForm();
        } catch (error) {
          alert(error.message);
        }
      },
      "edit",
      data,
    );
    form.render();
  }

  async delete(id) {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        try {
          const instructor = await ApiService.getById("instructors", id);
          if (instructor.students && instructor.students.length > 0) {
            alert(
              `Cannot delete: This instructor advises ${instructor.students.length} student(s).`,
            );
            return;
          }
          await ApiService.delete("instructors", id);
        } catch {
          // Not an instructor, continue
        }

        await ApiService.delete("employees", id);
        await this.loadData();
      } catch (error) {
        alert("Error deleting: " + error.message);
      }
    }
  }

  //^ Validate base fields (employee)
  validateBaseFields(name, age, position, office, salary, startDate) {
    const errors = [];

    if (!name || name.trim() === "") {
      errors.push({ input: "name", msg: "Name is required." });
    } else {
      for (let char of name) {
        if (
          !(
            (char >= "A" && char <= "Z") ||
            (char >= "a" && char <= "z") ||
            char === " "
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
    } else if (age < 18 || age > 70) {
      errors.push({ input: "age", msg: "Age must be between 18 and 70." });
    }

    if (!position || position.trim() === "") {
      errors.push({ input: "position", msg: "Position is required." });
    } else {
      for (let char of position) {
        if (
          !(
            (char >= "A" && char <= "Z") ||
            (char >= "a" && char <= "z") ||
            char === " "
          )
        ) {
          errors.push({
            input: "position",
            msg: "Position can only contain letters and spaces.",
          });
          break;
        }
      }
    }

    if (!office || office.trim() === "") {
      errors.push({ input: "office", msg: "Office is required." });
    }

    if (!salary) {
      errors.push({ input: "salary", msg: "Salary is required." });
    } else if (isNaN(salary) || salary < 0) {
      errors.push({
        input: "salary",
        msg: "Salary must be a positive number.",
      });
    }

    if (!startDate) {
      errors.push({ input: "startDate", msg: "Start date is required." });
    }

    return errors.length > 0 ? errors : true;
  }
}
