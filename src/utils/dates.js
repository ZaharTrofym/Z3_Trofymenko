export function toInputValue(iso) {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString("sk-SK", { dateStyle: "short", timeStyle: "short" });
}

export function isOverdue(todo) {
  return !todo.is_finished && new Date(todo.date_to) < new Date();
}

export function dateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

export function formatShort(iso) {
  return new Date(iso).toLocaleString("sk-SK", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
