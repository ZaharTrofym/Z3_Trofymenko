const BASE_URL = "https://wt1zadanie.iolab.sk/api";

async function request(path, options) {
  let response;
  try {
    response = await fetch(BASE_URL + path, options);
  } catch (error) {
    throw new Error("Server je nedostupný alebo chýba pripojenie k internetu.");
  }
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Neznámy identifikátor študenta.");
    }
    if (response.status === 404) {
      throw new Error("Úloha sa nenašla, možno už bola zmazaná.");
    }
    if (response.status === 422) {
      throw new Error("Server odmietol neplatné údaje úlohy.");
    }
    if (response.status >= 500) {
      throw new Error("Chyba servera, skúste to znova neskôr.");
    }
    throw new Error("Požiadavka zlyhala (HTTP " + response.status + ").");
  }
  if (response.status === 204) {
    return null;
  }
  return await response.json();
}

function userPath(name) {
  return "/" + encodeURIComponent(name);
}

export async function getTodos(name) {
  const data = await request(userPath(name));
  return data.todos;
}

export async function createTodo(name, todo) {
  return await request(userPath(name), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo)
  });
}

export async function updateTodo(name, id, todo) {
  return await request(userPath(name) + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo)
  });
}

export async function deleteTodo(name, id) {
  await request(userPath(name) + "/" + id, { method: "DELETE" });
}

export async function setDone(name, id, done) {
  const action = done ? "done" : "undone";
  await request(userPath(name) + "/" + id + "/" + action, { method: "PATCH" });
}

export async function resetTodos(name) {
  await request(userPath(name) + "/reset", { method: "POST" });
}
