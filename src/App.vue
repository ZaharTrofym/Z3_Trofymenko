<script setup>
import { ref, computed, onMounted } from "vue";
import { getTodos, createTodo, deleteTodo, setDone, updateTodo } from "./services/api.js";

const student = "xtrofymenko";
const todos = ref([]);
const loading = ref(false);
const errorMessage = ref("");

const newTodo = ref({ title: "", description: "", date_from: "", date_to: "" });
const saving = ref(false);
const formError = ref("");

const editingId = ref(null);

async function loadTodos() {
  loading.value = true;
  errorMessage.value = "";
  try {
    todos.value = await getTodos(student);
  } catch (error) {
    errorMessage.value = "Chyba: " + error.message;
  } finally {
    loading.value = false;
  }
}

async function addTodo() {
  formError.value = "";
  const from = new Date(newTodo.value.date_from);
  const to = new Date(newTodo.value.date_to);
  if (to < from) {
    formError.value = "Koniec nesmie byť skôr ako začiatok.";
    return;
  }
  saving.value = true;
  try {
    const data = {
      title: newTodo.value.title,
      description: newTodo.value.description,
      date_from: from.toISOString(),
      date_to: to.toISOString(),
      is_finished: false
    };
    if (editingId.value === null) {
      await createTodo(student, data);
    } else {
      const old = todos.value.find((t) => t.id === editingId.value);
      data.is_finished = old.is_finished;
      await updateTodo(student, editingId.value, data);
    }
    editingId.value = null;
    newTodo.value = { title: "", description: "", date_from: "", date_to: "" };
    await loadTodos();
  } catch (error) {
    formError.value = "Chyba: " + error.message;
  } finally {
    saving.value = false;
  }
}

async function removeTodo(todo) {
  if (!confirm("Naozaj chcete zmazať úlohu „" + todo.title + "“?")) {
    return;
  }
  try {
    await deleteTodo(student, todo.id);
    await loadTodos();
  } catch (error) {
    errorMessage.value = "Chyba: " + error.message;
  }
}

async function toggleDone(todo) {
  try {
    await setDone(student, todo.id, !todo.is_finished);
    await loadTodos();
  } catch (error) {
    errorMessage.value = "Chyba: " + error.message;
  }
}

const sortedTodos = computed(() => {
  return [...todos.value].sort((a, b) => new Date(a.date_from) - new Date(b.date_from));
});


function toInputValue(iso) {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

function startEdit(todo) {
  editingId.value = todo.id;
  newTodo.value = {
    title: todo.title,
    description: todo.description,
    date_from: toInputValue(todo.date_from),
    date_to: toInputValue(todo.date_to)
  };
}

function cancelEdit() {
  editingId.value = null;
  newTodo.value = { title: "", description: "", date_from: "", date_to: "" };
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("sk-SK", { dateStyle: "short", timeStyle: "short" });
}

onMounted(loadTodos);
</script>

<template>
  <main>
    <h1>Môj TODO List</h1>
    <p v-if="loading">Načítavam…</p>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <ul>
      <li v-for="todo in sortedTodos" :key="todo.id" :class="{ done: todo.is_finished }">
        <input type="checkbox" :checked="todo.is_finished" @change="toggleDone(todo)">
        {{ todo.title }} {{ todo.description }}
        ({{ formatDate(todo.date_from) }} – {{ formatDate(todo.date_to) }})
        <button type="button" @click="startEdit(todo)">Upraviť</button>
        <button type="button" @click="removeTodo(todo)">Zmazať</button>
      </li>
    </ul>
    <form @submit.prevent="addTodo">
      <input v-model="newTodo.title" placeholder="Názov" maxlength="200" required>
      <textarea v-model="newTodo.description" placeholder="Popis" maxlength="1000"></textarea>
      <input v-model="newTodo.date_from" type="datetime-local" required>
      <input v-model="newTodo.date_to" type="datetime-local" required>
      <button type="submit" :disabled="saving">{{ editingId === null ? "Pridať" : "Uložiť" }}</button>
      <button v-if="editingId !== null" type="button" @click="cancelEdit">Zrušiť</button>
      <p v-if="formError">{{ formError }}</p>
    </form>
  </main>
</template>

<style scoped>
  .done {
    text-decoration: line-through;
    color: gray;
  }
</style>