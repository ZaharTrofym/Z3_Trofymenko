<script setup>
import { computed } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import skLocale from "@fullcalendar/core/locales/sk";
import { isOverdue, dateOnly } from "../utils/dates.js";

const props = defineProps({
  todos: { type: Array, required: true }
});

const emit = defineEmits(["select", "create"]);

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  locale: skLocale,
  height: "auto",
  displayEventTime: false,
  dayMaxEvents: 3,
  slotMinTime: "07:00:00",
  slotMaxTime: "22:00:00",
  slotDuration: "01:00:00",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay"
  },
  events: props.todos.map((t) => {
    let color = "#0d6efd";
    if (t.is_finished) {
      color = "#6c757d";
    } else if (isOverdue(t)) {
      color = "#dc3545";
    }
    const from = new Date(t.date_from);
    const to = new Date(t.date_to);
    const multiDay = from.toDateString() !== to.toDateString();
    return {
      id: String(t.id),
      title: (t.is_finished ? "✓ " : "") + t.title,
      allDay: multiDay,
      start: multiDay ? dateOnly(from) : t.date_from,
      end: multiDay ? dateOnly(new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1)) : t.date_to,
      backgroundColor: color,
      borderColor: color,
      classNames: [t.is_finished ? "ev-done" : "ev-open"]
    };
  }),
  eventClick: (info) => {
    emit("select", Number(info.event.id));
  },
  dateClick: (info) => {
    const start = new Date(info.date);
    if (info.allDay) {
      start.setHours(9, 0, 0, 0);
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    emit("create", { from: start, to: end });
  }
}));
</script>

<template>
  <section id="calendar" class="calendar-card">
    <div class="small mb-2">
      <span class="dot" style="background: #0d6efd"></span> V práci
      <span class="dot ms-2" style="background: #dc3545"></span> Po termíne
      <span class="dot ms-2" style="background: #6c757d"></span> Dokončená
    </div>
    <FullCalendar :options="calendarOptions" />
  </section>
</template>

<style scoped>
.calendar-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.dot {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  vertical-align: middle;
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

@media (max-width: 600px) {
  .calendar-card {
    padding: 0.5rem;
  }

  :deep(.fc .fc-toolbar) {
    flex-direction: column;
    gap: 0.5rem;
  }

  :deep(.fc .fc-toolbar-title) {
    font-size: 1.1rem;
  }
}
</style>
