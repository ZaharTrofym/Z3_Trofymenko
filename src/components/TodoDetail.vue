<script setup>
import { formatDate, isOverdue } from "../utils/dates.js";

defineProps({
  todo: { type: Object, required: true }
});

defineEmits(["toggle", "edit", "remove", "close"]);
</script>

<template>
  <section id="todo-detail" class="card card-body mb-3">
    <h2 class="h5 detail-text">{{ todo.title }}</h2>
    <p class="mb-1 detail-text">{{ todo.description }}</p>
    <p class="small text-muted mb-1">{{ formatDate(todo.date_from) }} – {{ formatDate(todo.date_to) }}</p>
    <p>
      <span class="badge" :class="todo.is_finished ? 'text-bg-secondary' : 'text-bg-primary'">
        {{ todo.is_finished ? "Dokončená" : "Nedokončená" }}
      </span>
      <span v-if="isOverdue(todo)" class="badge text-bg-danger ms-1">Po termíne</span>
    </p>
    <div class="d-flex flex-wrap gap-2">
      <button type="button" class="btn btn-success btn-sm" @click="$emit('toggle', todo)">
        {{ todo.is_finished ? "Vrátiť späť" : "Označiť ako dokončenú" }}
      </button>
      <button type="button" class="btn btn-outline-primary btn-sm" @click="$emit('edit', todo)">Upraviť</button>
      <button type="button" class="btn btn-outline-danger btn-sm" @click="$emit('remove', todo)">Zmazať</button>
      <button type="button" class="btn btn-outline-secondary btn-sm" @click="$emit('close')">Zavrieť</button>
    </div>
  </section>
</template>

<style scoped>
.detail-text {
  overflow-wrap: anywhere;
}
</style>
