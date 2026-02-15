const BASE_URL = "http://localhost:3000";

export default class ApiService {
  static async getAll(endpoint) {
    const res = await fetch(`${BASE_URL}/${endpoint}`);
    if (!res.ok) throw new Error("Failed to fetch data");
    return await res.json();
  }
  static async getById(endpoint, id) {
    const res = await fetch(`${BASE_URL}/${endpoint}/${id}`);
    return await res.json();
  }

  static async create(endpoint, data) {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create");
    return await res.json();
  }

  static async update(endpoint, id, data) {
    const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update");
    return await res.json();
  }

  static async delete(endpoint, id) {
    const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete");
  }
}
