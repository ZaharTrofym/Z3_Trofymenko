<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  todo: { type: Object, required: true },
  editing: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  error: { type: String, default: "" }
});

const emit = defineEmits(["submit", "cancel"]);

const form = ref({ ...props.todo });
const errors = ref({ title: "", date_from: "", date_to: "" });

watch(
  () => props.todo,
  (newValue) => {
    form.value = { ...newValue };
    errors.value = { title: "", date_from: "", date_to: "" };
  }
);

function submit() {
  errors.value = { title: "", date_from: "", date_to: "" };
  const from = new Date(form.value.date_from);
  const to = new Date(form.value.date_to);
  if (form.value.title.trim() === "") {
    errors.value.title = "Názov je povinný.";
  }
  if (form.value.date_from === "") {
    errors.value.date_from = "Začiatok je povinný.";
  }
  if (form.value.date_to === "") {
    errors.value.date_to = "Koniec je povinný.";
  } else if (to < from) {
    errors.value.date_to = "Koniec nesmie byť skôr ako začiatok.";
  }
  if (errors.value.title || errors.value.date_from || errors.value.date_to) {
    return;
  }
  emit("submit", {
    title: form.value.title.trim(),
    description: form.value.description,
    date_from: from.toISOString(),
    date_to: to.toISOString(),
    is_finished: form.value.is_finished
  });
}
</script>

<template>
  <form id="todo-form" class="card card-body mb-3" novalidate @submit.prevent="submit">
    <h2 class="h5">{{ editing ? "Úprava úlohy" : "Nová úloha" }}</h2>

    <input v-model="form.title" class="form-control" :class="{ 'is-invalid': errors.title }" placeholder="Názov" maxlength="200">
    <div class="invalid-feedback">{{ errors.title }}</div>

    <textarea v-model="form.description" class="form-control mt-2 mb-2" placeholder="Popis" maxlength="1000"></textarea>

    <label class="form-label small mb-1">Začiatok</label>
    <input v-model="form.date_from" class="form-control" :class="{ 'is-invalid': errors.date_from }" type="datetime-local">
    <div class="invalid-feedback">{{ errors.date_from }}</div>

    <label class="form-label small mb-1 mt-2">Koniec</label>
    <input v-model="form.date_to" class="form-control" :class="{ 'is-invalid': errors.date_to }" type="datetime-local">
    <div class="invalid-feedback">{{ errors.date_to }}</div>

    <div v-if="editing" class="form-check mt-2">
      <input id="finished" v-model="form.is_finished" class="form-check-input" type="checkbox">
      <label for="finished" class="form-check-label">Dokončená</label>
    </div>

    <div class="d-flex gap-2 mt-3">
      <button type="submit" class="btn btn-primary" :disabled="saving">
        {{ saving ? "Ukladám…" : (editing ? "Uložiť" : "Pridať") }}
      </button>
      <button v-if="editing" type="button" class="btn btn-outline-secondary" :disabled="saving" @click="$emit('cancel')">Zrušiť</button>
    </div>
    <p v-if="error" class="text-danger small mt-2 mb-0">{{ error }}</p>
  </form>
</template>
