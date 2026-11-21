<script setup>
import { ref, onMounted } from "vue";
import { getTodos, createTodo  } from "./services/api.js";
const todos = ref([]);
const loading = ref(false);
const errorMessage = ref("");

async function loadTodos() {
  loading.value = true;
  errorMessage.value = "";
  try {
    todos.value = await getTodos("xtrofymenko");
  } catch (error) {
    errorMessage.value = "Chyba: " + error.message;
  } finally {
    loading.value = false;
  }
}

const newTodo = ref({ title: "", description: "", date_from: "", date_to: "" });
const saving = ref(false);
const formError = ref("");

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
    await createTodo("xtrofymenko", {
      title: newTodo.value.title,
      description: newTodo.value.description,
      date_from: from.toISOString(),
      date_to: to.toISOString(),
      is_finished: false
    });
    newTodo.value = { title: "", description: "", date_from: "", date_to: "" };
    await loadTodos();
  } catch (error) {
    formError.value = "Chyba: " + error.message;
  } finally {
    saving.value = false;
  }
}

onMounted(loadTodos);
</script>

<template>
  <main>
    <h1>Môj TODO List</h1>
    <p v-if="loading">Načítavam…</p>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <ul>
      <li v-for="todo in todos" :key="todo.id">{{ todo.title }} {{ todo.description }}</li>
    </ul>
    <form @submit.prevent="addTodo">
      <input v-model="newTodo.title" placeholder="Názov" maxlength="200" required>
      <textarea v-model="newTodo.description" placeholder="Popis" maxlength="1000"></textarea>
      <input v-model="newTodo.date_from" type="datetime-local" required>
      <input v-model="newTodo.date_to" type="datetime-local" required>
      <button type="submit" :disabled="saving">Pridať</button>
      <p v-if="formError">{{ formError }}</p>
    </form>
  </main>
</template>