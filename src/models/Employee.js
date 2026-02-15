import Person from "./Person.js";

export default class Employee extends Person {
  #position;
  #office;
  #salary;
  #startDate;

  constructor(name, age, position, office, salary, startDate) {
    super(name, age);
    this.position = position;
    this.office = office;
    this.salary = salary;
    this.startDate = startDate;
  }

  // position
  get position() {
    return this.#position;
  }
  set position(val) {
    if (!val) throw new Error("Position is required");
    this.#position = val;
  }

  // office
  get office() {
    return this.#office;
  }
  set office(val) {
    if (!val) throw new Error("Office is required");
    this.#office = val;
  }

  // salary
  get salary() {
    return this.#salary;
  }
  set salary(val) {
    const numVal = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(numVal) || numVal < 0)
      throw new Error("Salary must be a positive number");
    this.#salary = numVal;
  }
  // startDate
  get startDate() {
    return this.#startDate;
  }
  set startDate(val) {
    if (!val) throw new Error("Start date is required");
    this.#startDate = val;
  }

  toString() {
    return `${super.toString()} Position: ${this.#position} Office: ${this.#office} Salary: ${this.#salary} Start Date: ${this.#startDate}`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      position: this.#position,
      office: this.#office,
      salary: this.#salary,
      startDate: this.#startDate,
    };
  }

  static fromJSON(json) {
    return new Employee(
      json.name,
      json.age,
      json.position,
      json.office,
      json.salary,
      json.startDate,
      json.courses || [],
      json.students || [],
    );
  }
}
