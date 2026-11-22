<script setup>
import { ref, computed, onMounted } from "vue";
import { getTodos, createTodo, deleteTodo, setDone, updateTodo, resetTodos } from "./services/api.js";

import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import skLocale from "@fullcalendar/core/locales/sk";

import "bootstrap/dist/css/bootstrap.min.css";

const student = ref(localStorage.getItem("student") ?? "");
const studentInput = ref("");
const loginError = ref("");

const todos = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const newTodo = ref({ title: "", description: "", date_from: "", date_to: "" });
const saving = ref(false);
const formError = ref("");

const editingId = ref(null);

const filter = ref("all");
const search = ref("");
const sortBy = ref("date_from");

const selectedId = ref(null);
const selectedTodo = computed(() => todos.value.find((t) => t.id === selectedId.value) ?? null);

const visibleTodos = computed(() => {
  let list = [...todos.value];
  if (filter.value === "open") {
    list = list.filter((t) => !t.is_finished);
  }
  if (filter.value === "done") {
    list = list.filter((t) => t.is_finished);
  }
  const text = search.value.trim().toLowerCase();
  if (text !== "") {
    list = list.filter((t) => t.title.toLowerCase().includes(text));
  }
  list.sort((a, b) => new Date(a[sortBy.value]) - new Date(b[sortBy.value]));
  return list;
});

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  locale: skLocale,
  height: 600,
  displayEventTime: false,
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay"
  },
  events: todos.value.map((t) => {
    let color = "#0d6efd";
    if (t.is_finished) {
      color = "#6c757d";
    } else if (isOverdue(t)) {
      color = "#dc3545";
    }
    return {
      id: String(t.id),
      title: (t.is_finished ? "✓ " : "") + t.title,
      start: t.date_from,
      end: t.date_to,
      backgroundColor: color,
      borderColor: color,
      classNames: [t.is_finished ? "ev-done" : "ev-open"]
    };
  }),
  eventClick: (info) => {
    selectedId.value = Number(info.event.id);
  },
  dateClick: (info) => {
    const start = new Date(info.date);
    if (info.allDay) {
      start.setHours(9, 0, 0, 0);
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    editingId.value = null;
    newTodo.value = {
      title: "",
      description: "",
      date_from: toInputValue(start.toISOString()),
      date_to: toInputValue(end.toISOString())
    };
  }
}));

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
    const wasEditing = editingId.value !== null;
    const data = {
      title: newTodo.value.title,
      description: newTodo.value.description,
      date_from: from.toISOString(),
      date_to: to.toISOString(),
      is_finished: false
    };
    if (editingId.value === null) {
      await createTodo(student.value, data);
    } else {
      const old = todos.value.find((t) => t.id === editingId.value);
      data.is_finished = old.is_finished;
      await updateTodo(student.value, editingId.value, data);
    }
    editingId.value = null;
    newTodo.value = { title: "", description: "", date_from: "", date_to: "" };
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

function isOverdue(todo) {
  return !todo.is_finished && new Date(todo.date_to) < new Date();
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

async function login() {
  const name = studentInput.value.trim();
  loginError.value = "";
  try {
    todos.value = await getTodos(name);
    student.value = name;
    localStorage.setItem("student", name);
  } catch (error) {
    loginError.value = error.message;
  }
}

function logout() {
  student.value = "";
  localStorage.removeItem("student");
  todos.value = [];
  selectedId.value = null;
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
  <main v-if="!student" class="container py-5">
    <div class="card card-body mx-auto" style="max-width: 420px">
      <h1 class="h3 mb-3">Môj TODO List</h1>
      <form @submit.prevent="login">
        <input v-model="studentInput" class="form-control mb-2" placeholder="Identifikátor študenta" required>
        <button type="submit" class="btn btn-primary w-100">Pokračovať</button>
        <p v-if="loginError" class="alert alert-danger mt-3 mb-0">{{ loginError }}</p>
      </form>
    </div>
  </main>

  <main v-else class="container py-3">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h1 class="h2 mb-0">Môj TODO List</h1>
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetAll">Obnoviť ukážkové úlohy</button>
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="logout">Zmeniť študenta ({{ student }})</button>
      </div>
    </div>

    <p v-if="loading" class="text-muted">Načítavam…</p>
    <p v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</p>
    <p v-if="successMessage" class="alert alert-success toast-msg">{{ successMessage }}</p>

    <div class="layout">
      <section class="calendar-card">
        <div class="small mb-2">
          <span class="dot" style="background: #0d6efd"></span> V práci
          <span class="dot ms-2" style="background: #dc3545"></span> Po termíne
          <span class="dot ms-2" style="background: #6c757d"></span> Dokončená
        </div>
        <FullCalendar :options="calendarOptions" />
      </section>

      <aside>
        <section v-if="selectedTodo" class="card card-body mb-3">
          <h2 class="h5">{{ selectedTodo.title }}</h2>
          <p class="mb-1">{{ selectedTodo.description }}</p>
          <p class="small text-muted mb-1">{{ formatDate(selectedTodo.date_from) }} – {{ formatDate(selectedTodo.date_to) }}</p>
          <p>
            <span class="badge" :class="selectedTodo.is_finished ? 'text-bg-secondary' : 'text-bg-primary'">
              {{ selectedTodo.is_finished ? "Dokončená" : "Nedokončená" }}
            </span>
          </p>
          <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-success btn-sm" @click="toggleDone(selectedTodo)">
              {{ selectedTodo.is_finished ? "Vrátiť späť" : "Označiť ako dokončenú" }}
            </button>
            <button type="button" class="btn btn-outline-primary btn-sm" @click="startEdit(selectedTodo)">Upraviť</button>
            <button type="button" class="btn btn-outline-danger btn-sm" @click="removeTodo(selectedTodo)">Zmazať</button>
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="selectedId = null">Zavrieť</button>
          </div>
        </section>

        <form class="card card-body mb-3" @submit.prevent="addTodo">
          <h2 class="h5">{{ editingId === null ? "Nová úloha" : "Úprava úlohy" }}</h2>
          <input v-model="newTodo.title" class="form-control mb-2" placeholder="Názov" maxlength="200" required>
          <textarea v-model="newTodo.description" class="form-control mb-2" placeholder="Popis" maxlength="1000"></textarea>
          <label class="form-label small mb-1">Začiatok</label>
          <input v-model="newTodo.date_from" class="form-control mb-2" type="datetime-local" required>
          <label class="form-label small mb-1">Koniec</label>
          <input v-model="newTodo.date_to" class="form-control mb-2" type="datetime-local" required>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? "Ukladám…" : (editingId === null ? "Pridať" : "Uložiť") }}
            </button>
            <button v-if="editingId !== null" type="button" class="btn btn-outline-secondary" @click="cancelEdit">Zrušiť</button>
          </div>
          <p v-if="formError" class="text-danger small mt-2 mb-0">{{ formError }}</p>
        </form>
      </aside>
    </div>

    <h2 class="h4 mt-4">Zoznam úloh</h2>
    <div class="d-flex flex-wrap gap-2 mb-3">
      <select v-model="filter" class="form-select w-auto">
        <option value="all">Všetky</option>
        <option value="open">Nedokončené</option>
        <option value="done">Dokončené</option>
      </select>
      <input v-model="search" class="form-control w-auto" placeholder="Hľadať podľa názvu">
      <select v-model="sortBy" class="form-select w-auto">
        <option value="date_from">Podľa začiatku</option>
        <option value="date_to">Podľa konca</option>
      </select>
    </div>

    <ul class="list-group">
      <li
        v-for="todo in visibleTodos"
        :key="todo.id"
        class="list-group-item todo-item d-flex justify-content-between align-items-start gap-2"
        :class="{ done: todo.is_finished, overdue: isOverdue(todo) }"
      >
        <div class="d-flex gap-2">
          <input type="checkbox" class="form-check-input mt-1" :checked="todo.is_finished" @change="toggleDone(todo)">
          <div>
            <strong>{{ todo.title }}</strong>
            <div class="small">{{ todo.description }}</div>
            <div class="small text-muted">{{ formatDate(todo.date_from) }} – {{ formatDate(todo.date_to) }}</div>
          </div>
        </div>
        <div class="d-flex gap-1 align-items-center">
          <span v-if="todo.is_finished" class="badge text-bg-secondary">Dokončená</span>
          <span v-else-if="isOverdue(todo)" class="badge text-bg-danger">Po termíne</span>
          <button type="button" class="btn btn-sm btn-outline-primary" @click="startEdit(todo)">Upraviť</button>
          <button type="button" class="btn btn-sm btn-outline-danger" @click="removeTodo(todo)">Zmazať</button>
        </div>
      </li>
    </ul>
    <p v-if="!loading && visibleTodos.length === 0" class="text-muted mt-3">Žiadne úlohy na zobrazenie.</p>
  </main>

  <footer class="container border-top py-3 mt-4 small text-muted">
    <h2 class="h6">O projekte</h2>
    <p class="mb-1">Aplikácia „Môj TODO List“ slúži na správu osobných úloh. Úlohy sa ukladajú na serveri cez REST API, zobrazujú sa v zozname aj v kalendári.</p>
    <p class="mb-1">Použité technológie: Vue 3, Vite, FullCalendar 6 (kalendár), Bootstrap 5 (štýly), REST API https://wt1zadanie.iolab.sk.</p>
    <p class="mb-0">© 2026 Zakhar Trofymenko, WEBTE1</p>
  </footer>
</template>

<style scoped>
  :global(body) {
    background: #f4f6fb;
  }

  .calendar-card,
  .card,
  .list-group {
    background: #fff;
    border: none;
    border-radius: 0.75rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }

  .calendar-card {
    padding: 1rem;
  }

  .dot {
    display: inline-block;
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    vertical-align: middle;
  }

  .todo-item:hover {
    background: #f1f4fb;
  }

  .done {
    background: #fafafa;
  }

  .done strong {
    font-weight: 500;
    color: #6c757d;
    text-decoration: line-through;
  }

  .overdue {
    border-left: 4px solid #dc3545;
  }

  .overdue strong {
    color: #dc3545;
  }

  :deep(.fc a) {
    color: inherit;
    text-decoration: none;
  }

  :deep(.fc .fc-toolbar-title) {
    font-size: 1.4rem;
  }

  :deep(.fc-event) {
    cursor: pointer;
  }

  :deep(.ev-done) {
    opacity: 0.65;
  }

  .layout {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
    align-items: start;
  }

  .toast-msg {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1050;
    margin: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 800px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
</style>