import Employee from "./Employee.js";

class Instructor extends Employee {
  #specialization;
  #department;
  #courses;
  #students;

  constructor(
    name,
    age,
    specialization,
    position,
    office,
    salary,
    startDate,
    department,
    courses = [],
    students = [],
  ) {
    super(name, age, position, office, salary, startDate);
    this.specialization = specialization;
    this.department = department;
    this.courses = courses;
    this.students = students;
  }

  // specialization
  set specialization(val) {
    if (!val) throw new Error("Specialization is required");
    this.#specialization = val;
  }
  get specialization() {
    return this.#specialization;
  }

  // department
  set department(val) {
    if (!val) throw new Error("Department is required");
    this.#department = val;
  }
  get department() {
    return this.#department;
  }

  // courses
  set courses(val) {
    this.#courses = Array.isArray(val) ? val : [];
  }
  get courses() {
    return this.#courses;
  }

  // students
  set students(val) {
    this.#students = Array.isArray(val) ? val : [];
  }
  get students() {
    return this.#students;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      specialization: this.#specialization,
      department: this.#department,
      courses: this.#courses,
      students: this.#students,
    };
  }

  static fromJson(json) {
    const instructor = new Instructor(
      json.name,
      json.age,
      json.specialization,
      json.position,
      json.office,
      json.salary,
      json.startDate,
      json.department,
      json.courses || [],
      json.students || [],
    );
    instructor.id = json.id;
    return instructor;
  }
}

export default Instructor;
