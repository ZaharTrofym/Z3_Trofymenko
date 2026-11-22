<script setup>
import { ref, computed, onMounted } from "vue";
import { getTodos, createTodo, deleteTodo, setDone, updateTodo, resetTodos } from "./services/api.js";

import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import skLocale from "@fullcalendar/core/locales/sk";

const student = "xtrofymenko";
const todos = ref([]);
const loading = ref(false);
const errorMessage = ref("");

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
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay"
  },
  events: todos.value.map((t) => ({
    id: String(t.id),
    title: t.title,
    start: t.date_from,
    end: t.date_to,
    classNames: [t.is_finished ? "ev-done" : "ev-open"]
  })),
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
    await resetTodos(student);
    selectedId.value = null;
    await loadTodos();
  } catch (error) {
    errorMessage.value = "Chyba: " + error.message;
  }
}

onMounted(loadTodos);
</script>

<template>
  <main>
    <h1>Môj TODO List</h1>
    <button type="button" @click="resetAll">Obnoviť ukážkové úlohy</button>
    <p v-if="loading">Načítavam…</p>
    <p v-if="errorMessage">{{ errorMessage }}</p>

    <div class="layout">
      <section>
        <FullCalendar :options="calendarOptions" />
      </section>

      <aside>
        <section v-if="selectedTodo" class="panel">
          <h2>{{ selectedTodo.title }}</h2>
          <p>{{ selectedTodo.description }}</p>
          <p>{{ formatDate(selectedTodo.date_from) }} – {{ formatDate(selectedTodo.date_to) }}</p>
          <p>{{ selectedTodo.is_finished ? "Dokončená" : "Nedokončená" }}</p>
          <button type="button" @click="toggleDone(selectedTodo)">
            {{ selectedTodo.is_finished ? "Vrátiť späť" : "Označiť ako dokončenú" }}
          </button>
          <button type="button" @click="startEdit(selectedTodo)">Upraviť</button>
          <button type="button" @click="removeTodo(selectedTodo)">Zmazať</button>
          <button type="button" @click="selectedId = null">Zavrieť</button>
        </section>

        <form class="panel" @submit.prevent="addTodo">
          <h2>{{ editingId === null ? "Nová úloha" : "Úprava úlohy" }}</h2>
          <input v-model="newTodo.title" placeholder="Názov" maxlength="200" required>
          <textarea v-model="newTodo.description" placeholder="Popis" maxlength="1000"></textarea>
          <input v-model="newTodo.date_from" type="datetime-local" required>
          <input v-model="newTodo.date_to" type="datetime-local" required>
          <button type="submit" :disabled="saving">{{ editingId === null ? "Pridať" : "Uložiť" }}</button>
          <button v-if="editingId !== null" type="button" @click="cancelEdit">Zrušiť</button>
          <p v-if="formError">{{ formError }}</p>
        </form>
      </aside>
    </div>

    <h2>Zoznam úloh</h2>
    <div>
      <select v-model="filter">
        <option value="all">Všetky</option>
        <option value="open">Nedokončené</option>
        <option value="done">Dokončené</option>
      </select>
      <input v-model="search" placeholder="Hľadať podľa názvu">
      <select v-model="sortBy">
        <option value="date_from">Podľa začiatku</option>
        <option value="date_to">Podľa konca</option>
      </select>
    </div>
    <ul>
      <li v-for="todo in visibleTodos" :key="todo.id" :class="{ done: todo.is_finished, overdue: isOverdue(todo) }">
        <input type="checkbox" :checked="todo.is_finished" @change="toggleDone(todo)">
        {{ todo.title }} {{ todo.description }}
        ({{ formatDate(todo.date_from) }} – {{ formatDate(todo.date_to) }})
        <button type="button" @click="startEdit(todo)">Upraviť</button>
        <button type="button" @click="removeTodo(todo)">Zmazať</button>
      </li>
    </ul>
    <p v-if="!loading && visibleTodos.length === 0">Žiadne úlohy na zobrazenie.</p>
  </main>
</template>

<style scoped>
  .done {
    text-decoration: line-through;
    color: gray;
  }

  .overdue {
    color: red;
  }

  :deep(.ev-done) {
    opacity: 0.5;
    text-decoration: line-through;
  }

  .layout {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
    align-items: start;
  }

  .panel {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .panel input,
  .panel textarea {
    display: block;
    width: 100%;
    margin-bottom: 0.5rem;
    box-sizing: border-box;
  }

  @media (max-width: 800px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
</style>