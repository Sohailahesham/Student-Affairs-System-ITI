import Person from "./Person.js";

export default class Student extends Person {
  #grade;
  #major; 
  #advisorId; 
  #courses; 

  constructor(name, age, grade, major, advisorId = null, courses) {
    super(name, age);
    this.grade = grade;
    this.major = major;
    this.advisorId = advisorId;
    this.courses = courses || []; 
  }

  // grade
  get grade() {
    return this.#grade;
  }
  set grade(val) {
    if (!val) throw new Error("Grade is required");
    this.#grade = val;
  }

  // major
  get major() {
    return this.#major;
  }
  set major(val) {
    if (!val) throw new Error("Major is required");
    this.#major = val;
  }

  // advisorId
  get advisorId() {
    return this.#advisorId;
  }
  set advisorId(val) {
    this.#advisorId = val;
  }

  // courses
  get courses() {
    return this.#courses;
  }
  set courses(val) {
    this.#courses = Array.isArray(val) ? val : [];
  }

  // Methods
  addCourse(courseId) {
    if (!this.#courses.includes(courseId)) {
      this.#courses.push(courseId);
    }
  }

  removeCourse(courseId) {
    this.#courses = this.#courses.filter((id) => id !== courseId);
  }

  toString() {
    return `${super.toString()} Grade: ${this.#grade} Major: ${this.#major} Advisor: ${this.#advisorId || "None"}`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      grade: this.#grade,
      major: this.#major,
      advisorId: this.#advisorId,
      courses: this.#courses,
    };
  }

  static fromJSON(obj) {
    const student = new Student(
      obj.name,
      obj.age,
      obj.grade,
      obj.major,
      obj.advisorId,
    );
    student.courses = obj.courses || [];
    return student;
  }
}
