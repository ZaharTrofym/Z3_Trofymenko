<script setup>
defineProps({
  student: { type: String, required: true }
});

defineEmits(["reset", "logout"]);
</script>

<template>
  <header class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
    <h1 class="h2 mb-0 header-side">Môj TODO List</h1>
    <nav class="nav nav-pills">
      <a class="nav-link" href="#calendar">Kalendár</a>
      <a class="nav-link" href="#list">Zoznam úloh</a>
      <a class="nav-link" href="#about">O projekte</a>
    </nav>
    <div class="d-flex flex-wrap gap-2 justify-content-end header-side">
      <button type="button" class="btn btn-outline-secondary btn-sm" @click="$emit('reset')">Obnoviť ukážkové úlohy</button>
      <button type="button" class="btn btn-outline-secondary btn-sm" @click="$emit('logout')">Zmeniť študenta ({{ student }})</button>
    </div>
  </header>
</template>

<style scoped>
.nav-link {
  color: #495057;
  font-weight: 500;
}

.nav-link:hover {
  background: #e7ecf7;
  color: #0d6efd;
}

@media (min-width: 900px) {
  .header-side {
    flex: 1 1 0;
  }
}
</style>
