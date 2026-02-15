class Course {
  #id;
  #code;
  #credits;

  constructor(name, code, credits, instructorId, students = []) {
    this.id = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000) + "";
    this.name = name;
    this.#code = code;
    this.#credits = credits;
    this.instructorId = instructorId;
    this.students = students;
  }
  set id(val) {
    this.#id = val;
  }

  get id() {
    return this.#id;
  }

  set code(val) {
    if (!val) throw new Error("Course code is required");
    this.#code = val;
  }

  get code() {
    return this.#code;
  }

  set credits(val) {
    if (typeof val !== "number" || val <= 0)
      throw new Error("Invalid credits value");
    this.#credits = val;
  }

  get credits() {
    return this.#credits;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.#code,
      credits: this.#credits,
      instructorId: this.instructorId,
      students: this.students,
    };
  }

  static fromJson(json) {
    let course = new Course(
      json.name,
      json.code,
      json.credits,
      json.instructorId,
      json.students,
    );
    course.id = json.id;
    return course;
  }
}
export default Course;
