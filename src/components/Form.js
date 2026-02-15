export default class Form {
  constructor(
    containerId,
    fields,
    onSubmit,
    mode = "create",
    initialData = {},
  ) {
    this.container = document.getElementById(containerId);
    this.fields = fields;
    this.onSubmit = onSubmit;
    this.mode = mode;
    this.initialData = initialData;
  }

  render() {
    const form = document.createElement("form");

    const title = document.createElement("h3");
    title.textContent = this.mode === "edit" ? "Edit Record" : "Add New Record";
    form.appendChild(title);

    this.fields.forEach((field) => {
      const div = document.createElement("div");
      div.className = "form-group";

      const label = document.createElement("label");
      label.textContent = field.label;
      label.htmlFor = field.name;
      let input;

      if (field.tag === "select" || field.tag === "select-multiple") {
        input = document.createElement("select");
        input.name = field.name;
        input.id = field.name;

        if (field.tag === "select-multiple") {
          input.multiple = true;
          input.size = 4;
        }

        //^ Add empty option for single select
        if (field.tag === "select" && !field.required) {
          const emptyOption = document.createElement("option");
          emptyOption.value = "";
          emptyOption.textContent = "-- Select Advisor --";
          input.appendChild(emptyOption);
        }

        //^ Add options
        if (field.options && field.options.length > 0) {
          field.options.forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt.value;
            option.textContent = opt.label;

            //* Check if selected
            if (this.initialData[field.name]) {
              if (Array.isArray(this.initialData[field.name])) {
                //* For multiple select
                if (this.initialData[field.name].includes(opt.value)) {
                  option.selected = true;
                }
              } else {
                if (this.initialData[field.name] === opt.value) {
                  option.selected = true;
                }
              }
            }

            input.appendChild(option);
          });
        }
      } else {
        input = document.createElement("input");
        input.type = field.type || "text";
        input.name = field.name;
        input.id = field.name;
        input.value = this.initialData[field.name] || "";
      }

      if (field.required) {
        input.required = true;
      }

      input.addEventListener("input", () => {
        this.clearError(input);
      });

      div.appendChild(label);
      div.appendChild(input);
      form.appendChild(div);
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "10px";
    buttonContainer.style.marginTop = "20px";

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.textContent = "Save";
    saveBtn.className = "btn btn-primary";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "btn btn-secondary";
    cancelBtn.onclick = () => this.clearForm();

    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(cancelBtn);
    form.appendChild(buttonContainer);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });

    this.container.innerHTML = "";
    this.container.appendChild(form);
  }

  handleSubmit(form) {
    const formData = {};
    let hasErrors = false;

    this.fields.forEach((field) => {
      const input = form.elements[field.name];

      if (!input) {
        console.error(`Input with name ${field.name} not found`);
        return;
      }

      this.clearError(input);

      if (field.tag === "select-multiple") {
        const selectedValues = [];
        for (let i = 0; i < input.options.length; i++) {
          if (input.options[i].selected) {
            selectedValues.push(input.options[i].value);
          }
        }
        formData[field.name] = selectedValues;
      } else if (field.tag === "select") {
        formData[field.name] = input.value;

        if (field.required && !input.value) {
          this.showError(input, `${field.label} is required`);
          hasErrors = true;
          return;
        }
      } else {
        const value = input.value.trim();
        if (field.required && value === "") {
          this.showError(input, `${field.label} is required`);
          hasErrors = true;
          return;
        }

        if (field.type === "number" && value !== "" && isNaN(value)) {
          this.showError(input, `${field.label} must be a number`);
          hasErrors = true;
          return;
        }

        formData[field.name] =
          field.type === "number" && value !== "" ? Number(value) : value;
      }
    });

    if (!hasErrors) {
      this.onSubmit(formData);
    }
  }

  showError(input, message) {
    if (!input) {
      console.error("Cannot show error: input is undefined");
      return;
    }

    this.clearError(input);

    input.style.border = "1px solid red";

    const error = document.createElement("small");
    error.className = "error-message";
    error.style.color = "red";
    error.style.display = "block";
    error.style.marginTop = "5px";
    error.textContent = message;

    if (input.parentElement) {
      input.parentElement.appendChild(error);
    }
  }

  clearError(input) {
    if (!input) {
      return;
    }

    input.style.border = "";

    if (input.parentElement) {
      const error = input.parentElement.querySelector(".error-message");
      if (error) error.remove();
    }
  }

  clearForm() {
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
}
