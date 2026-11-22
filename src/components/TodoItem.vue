<script setup>
import { formatDate, isOverdue } from "../utils/dates.js";

defineProps({
  todo: { type: Object, required: true }
});

defineEmits(["toggle", "edit", "remove"]);
</script>

<template>
  <li
    class="list-group-item todo-item d-flex flex-wrap justify-content-between align-items-start gap-2"
    :class="{ done: todo.is_finished, overdue: isOverdue(todo) }"
  >
    <div class="d-flex gap-2 item-text">
      <input type="checkbox" class="form-check-input mt-1" :checked="todo.is_finished" :aria-label="'Dokončená: ' + todo.title" @change="$emit('toggle', todo)">
      <div class="item-text">
        <strong>{{ todo.title }}</strong>
        <div class="small">{{ todo.description }}</div>
        <div class="small text-muted">{{ formatDate(todo.date_from) }} – {{ formatDate(todo.date_to) }}</div>
      </div>
    </div>
    <div class="d-flex gap-1 align-items-center">
      <span v-if="todo.is_finished" class="badge text-bg-secondary">Dokončená</span>
      <span v-else-if="isOverdue(todo)" class="badge text-bg-danger">Po termíne</span>
      <button type="button" class="btn btn-sm btn-outline-primary" @click="$emit('edit', todo)">Upraviť</button>
      <button type="button" class="btn btn-sm btn-outline-danger" @click="$emit('remove', todo)">Zmazať</button>
    </div>
  </li>
</template>

<style scoped>
.item-text {
  min-width: 0;
  overflow-wrap: anywhere;
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
</style>
