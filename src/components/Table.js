export default class Table {
  constructor(
    containerId,
    columns,
    data,
    onEdit,
    onDelete,
    onSort,
    sortField = null,
    sortOrder = "asc",
  ) {
    this.container = document.getElementById(containerId);
    this.columns = columns;
    this.data = data;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.onSort = onSort;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
  }

  render() {
    let table = document.createElement("table");
    table.border = "1";

    let headerRow = document.createElement("tr");

    this.columns.forEach((col) => {
      let th = document.createElement("th");
      th.classList.add("sortable");
      th.dataset.field = col;

      let icon = "↕";
      if (col === this.sortField) {
        icon = this.sortOrder === "asc" ? "▲" : "▼";
      }

      th.innerHTML = `${col} <span>${icon}</span>`;
      headerRow.appendChild(th);
    });

    let actionsTh = document.createElement("th");
    actionsTh.textContent = "Actions";
    headerRow.appendChild(actionsTh);

    table.appendChild(headerRow);

    this.data.forEach((item) => {
      let tr = document.createElement("tr");

      this.columns.forEach((col) => {
        let td = document.createElement("td");

        td.textContent = item[col];

        tr.appendChild(td);
      });

      let actionsTd = document.createElement("td");

      let editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.classList.add("edit");
      editBtn.dataset.id = item.id;

      let deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("delete");
      deleteBtn.dataset.id = item.id;

      actionsTd.appendChild(editBtn);
      actionsTd.appendChild(deleteBtn);
      tr.appendChild(actionsTd);

      table.appendChild(tr);
    });

    this.container.innerHTML = "";
    this.container.appendChild(table);

    this.attachEvents();
  }

  attachEvents() {
    //* Edit
    this.container.querySelectorAll(".edit").forEach((btn) => {
      btn.onclick = () => this.onEdit(btn.dataset.id);
    });

    //* Delete
    this.container.querySelectorAll(".delete").forEach((btn) => {
      btn.onclick = () => this.onDelete(btn.dataset.id);
    });

    //* Sort
    this.container.querySelectorAll(".sortable").forEach((th) => {
      th.onclick = () => {
        if (this.onSort) {
          this.onSort(th.dataset.field);
        }
      };
    });
  }
}
