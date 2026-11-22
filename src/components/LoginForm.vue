<script setup>
import { ref } from "vue";

defineProps({
  error: { type: String, default: "" },
  busy: { type: Boolean, default: false }
});

const emit = defineEmits(["login"]);

const name = ref("");

function submit() {
  emit("login", name.value.trim());
}
</script>

<template>
  <main class="container py-5">
    <div class="card card-body mx-auto" style="max-width: 420px">
      <h1 class="h3 mb-3">Môj TODO List</h1>
      <form @submit.prevent="submit">
        <input v-model="name" class="form-control mb-2" placeholder="Identifikátor študenta" required>
        <button type="submit" class="btn btn-primary w-100" :disabled="busy">
          {{ busy ? "Overujem…" : "Pokračovať" }}
        </button>
        <p v-if="error" class="alert alert-danger mt-3 mb-0">{{ error }}</p>
      </form>
    </div>
  </main>
</template>
