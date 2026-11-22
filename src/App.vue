<script setup>
import { ref, computed, onMounted } from "vue";
import { getTodos, createTodo, deleteTodo, setDone, updateTodo, resetTodos } from "./services/api.js";
import { toInputValue } from "./utils/dates.js";

import LoginForm from "./components/LoginForm.vue";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import TodoCalendar from "./components/TodoCalendar.vue";
import TodoDetail from "./components/TodoDetail.vue";
import TodoForm from "./components/TodoForm.vue";
import TodoList from "./components/TodoList.vue";

const student = ref(localStorage.getItem("student") ?? "");
const loginError = ref("");
const loginBusy = ref(false);

const todos = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

function emptyTodo() {
  return { title: "", description: "", date_from: "", date_to: "", is_finished: false };
}

const formTodo = ref(emptyTodo());
const editingId = ref(null);
const saving = ref(false);
const formError = ref("");

const selectedId = ref(null);
const selectedTodo = computed(() => todos.value.find((t) => t.id === selectedId.value) ?? null);

async function loadTodos() {
  loading.value = true;
  errorMessage.value = "";
  try {
    todos.value = await getTodos(student.value);
  } catch (error) {
    errorMessage.value = "Chyba: " + error.message;
  } finally {
    loading.value = false;
  }
}

async function saveTodo(data) {
  formError.value = "";
  saving.value = true;
  try {
    const wasEditing = editingId.value !== null;
    if (wasEditing) {
      await updateTodo(student.value, editingId.value, data);
    } else {
      await createTodo(student.value, data);
    }
    editingId.value = null;
    formTodo.value = emptyTodo();
    await loadTodos();
    showSuccess(wasEditing ? "Úloha bola upravená." : "Úloha bola vytvorená.");
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
    await deleteTodo(student.value, todo.id);
    await loadTodos();
    showSuccess("Úloha bola zmazaná.");
  } catch (error) {
    errorMessage.value = "Chyba: " + error.message;
  }
}

async function toggleDone(todo) {
  try {
    const text = todo.is_finished ? "Úloha bola znovu otvorená." : "Úloha bola dokončená.";
    await setDone(student.value, todo.id, !todo.is_finished);
    await loadTodos();
    showSuccess(text);
  } catch (error) {
    errorMessage.value = "Chyba: " + error.message;
  }
}

function scrollToForm() {
  document.getElementById("todo-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function startEdit(todo) {
  editingId.value = todo.id;
  formError.value = "";
  formTodo.value = {
    title: todo.title,
    description: todo.description,
    date_from: toInputValue(todo.date_from),
    date_to: toInputValue(todo.date_to),
    is_finished: todo.is_finished
  };
  scrollToForm();
}

function startCreate(range) {
  editingId.value = null;
  formError.value = "";
  formTodo.value = {
    title: "",
    description: "",
    date_from: toInputValue(range.from.toISOString()),
    date_to: toInputValue(range.to.toISOString()),
    is_finished: false
  };
  scrollToForm();
}

function cancelEdit() {
  editingId.value = null;
  formError.value = "";
  formTodo.value = emptyTodo();
}

async function resetAll() {
  if (!confirm("Všetky vaše úlohy budú odstránené a nahradené piatimi ukážkovými úlohami. Pokračovať?")) {
    return;
  }
  try {
    await resetTodos(student.value);
    selectedId.value = null;
    await loadTodos();
    showSuccess("Ukážkové úlohy boli obnovené.");
  } catch (error) {
    errorMessage.value = "Chyba: " + error.message;
  }
}

async function login(name) {
  loginError.value = "";
  if (name === "") {
    loginError.value = "Zadajte identifikátor študenta.";
    return;
  }
  loginBusy.value = true;
  try {
    todos.value = await getTodos(name);
    student.value = name;
    localStorage.setItem("student", name);
  } catch (error) {
    loginError.value = error.message;
  } finally {
    loginBusy.value = false;
  }
}

function logout() {
  student.value = "";
  localStorage.removeItem("student");
  todos.value = [];
  selectedId.value = null;
  editingId.value = null;
  formTodo.value = emptyTodo();
}

function showSuccess(text) {
  successMessage.value = text;
  setTimeout(() => {
    successMessage.value = "";
  }, 3000);
}

onMounted(() => {
  if (student.value !== "") {
    loadTodos();
  }
});
</script>

<template>
  <LoginForm v-if="!student" :error="loginError" :busy="loginBusy" @login="login" />

  <main v-else class="container py-3">
    <AppHeader :student="student" @reset="resetAll" @logout="logout" />

    <p v-if="loading" class="text-muted">
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Načítavam…
    </p>
    <div v-if="errorMessage" class="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-2" role="alert">
      <span>{{ errorMessage }}</span>
      <button type="button" class="btn btn-sm btn-outline-danger" @click="loadTodos">Skúsiť znova</button>
    </div>
    <p v-if="successMessage" class="alert alert-success toast-msg" role="status">{{ successMessage }}</p>

    <div class="layout">
      <TodoCalendar :todos="todos" @select="selectedId = $event" @create="startCreate" />

      <aside>
        <TodoDetail
          v-if="selectedTodo"
          :todo="selectedTodo"
          @toggle="toggleDone"
          @edit="startEdit"
          @remove="removeTodo"
          @close="selectedId = null"
        />
        <TodoForm
          :todo="formTodo"
          :editing="editingId !== null"
          :saving="saving"
          :error="formError"
          @submit="saveTodo"
          @cancel="cancelEdit"
        />
      </aside>
    </div>

    <TodoList :todos="todos" :loading="loading" @toggle="toggleDone" @edit="startEdit" @remove="removeTodo" />
  </main>

  <AppFooter />
</template>

<style scoped>
.toast-msg {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1050;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  align-items: start;
}

.layout > * {
  min-width: 0;
}

@media (max-width: 800px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
