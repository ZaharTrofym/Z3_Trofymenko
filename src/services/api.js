const BASE_URL = "https://wt1zadanie.iolab.sk/api";

export async function getTodos(name) {
  const response = await fetch(BASE_URL + "/" + encodeURIComponent(name));
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }
  const data = await response.json();
  return data.todos;
}

export async function createTodo(name, todo) {
  const response = await fetch(BASE_URL + "/" + encodeURIComponent(name), { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify(todo), 
  });

  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }
  return await response.json();
}

export async function deleteTodo(name, id) {
  const response = await fetch(BASE_URL + "/" + encodeURIComponent(name) + "/" + id, {
    method: "DELETE"
  });
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }
}

export async function setDone(name, id, done) {
  const action = done ? "done" : "undone";
  const response = await fetch(BASE_URL + "/" + encodeURIComponent(name) + "/" + id + "/" + action, {
    method: "PATCH"
  });
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }
}

export async function updateTodo(name, id, todo) {
  const response = await fetch(BASE_URL + "/" + encodeURIComponent(name) + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo)
  });
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }
  return await response.json();
}

export async function resetTodos(name) {
  const response = await fetch(BASE_URL + "/" + encodeURIComponent(name) + "/reset", {
    method: "POST"
  });
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }
}