<script setup>
import { ref, computed } from "vue";
import TodoItem from "./TodoItem.vue";

const props = defineProps({
  todos: { type: Array, required: true },
  loading: { type: Boolean, default: false }
});

defineEmits(["toggle", "edit", "remove"]);

const filter = ref("all");
const search = ref("");
const sortBy = ref("date_from");

const visibleTodos = computed(() => {
  let list = [...props.todos];
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
</script>

<template>
  <section id="list">
    <h2 class="h4 mt-4">Zoznam úloh</h2>
    <div class="d-flex flex-wrap gap-2 mb-3">
      <select v-model="filter" class="form-select w-auto" aria-label="Filter podľa stavu">
        <option value="all">Všetky</option>
        <option value="open">Nedokončené</option>
        <option value="done">Dokončené</option>
      </select>
      <input v-model="search" class="form-control w-auto" placeholder="Hľadať podľa názvu" aria-label="Hľadať podľa názvu">
      <select v-model="sortBy" class="form-select w-auto" aria-label="Zoradenie">
        <option value="date_from">Podľa začiatku</option>
        <option value="date_to">Podľa konca</option>
      </select>
    </div>

    <ul class="list-group">
      <TodoItem
        v-for="todo in visibleTodos"
        :key="todo.id"
        :todo="todo"
        @toggle="$emit('toggle', $event)"
        @edit="$emit('edit', $event)"
        @remove="$emit('remove', $event)"
      />
    </ul>
    <p v-if="!loading && visibleTodos.length === 0" class="text-muted mt-3">
      {{ todos.length === 0 ? "Zatiaľ nemáte žiadne úlohy." : "Žiadne úlohy nezodpovedajú filtru." }}
    </p>
  </section>
</template>
