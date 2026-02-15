export default class Person {
  #id;
  #name;
  #age;

  constructor(_name, _age) {
    if (this.constructor.name === "Person")
      throw new Error("Cannot instantiate Person directly");

    this.id = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000) + "";
    this.name = _name;
    this.age = _age;
  }

  set id(val) {
    this.#id = val;
  }

  get id() {
    return this.#id;
  }

  set name(val) {
    if (!val) throw new Error("Name is required");
    this.#name = val;
  }

  get name() {
    return this.#name;
  }

  set age(val) {
    if (!Number.isInteger(val) || val <= 0)
      throw new Error("Age must be positive integer");
    this.#age = val;
  }

  get age() {
    return this.#age;
  }

  toString() {
    return `ID: ${this.#id} Name: ${this.#name} Age: ${this.#age}`;
  }

  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      age: this.#age,
    };
  }
}
