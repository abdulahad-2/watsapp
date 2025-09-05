// Lightweight toast utility (no deps)
// Usage: import { toast } from "../utils/toast"; toast("Copied!", { type: "success" });

const ensureContainer = () => {
  let el = document.getElementById("toast-container");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast-container";
    el.style.position = "fixed";
    el.style.zIndex = 99999;
    el.style.top = "12px";
    el.style.right = "12px";
    el.style.display = "flex";
    el.style.flexDirection = "column";
    el.style.gap = "8px";
    document.body.appendChild(el);
  }
  return el;
};

export function toast(message, opts = {}) {
  const { type = "info", duration = 2200 } = opts;
  const container = ensureContainer();
  const item = document.createElement("div");
  item.className = `toast-item toast-${type}`;
  item.textContent = message;
  // Base styles
  item.style.padding = "10px 12px";
  item.style.borderRadius = "8px";
  item.style.boxShadow = "0 4px 14px rgba(0,0,0,0.35)";
  item.style.color = "#E9EDEF";
  item.style.fontSize = "12px";
  item.style.lineHeight = "1.2";
  item.style.opacity = "0";
  item.style.transform = "translateY(-6px)";
  item.style.transition = "opacity 160ms ease, transform 160ms ease";
  // Color by type
  const bg = type === "success" ? "#16A34A" : type === "error" ? "#DC2626" : type === "warning" ? "#D97706" : "#374151";
  item.style.background = bg;
  container.appendChild(item);
  // animate in
  requestAnimationFrame(() => {
    item.style.opacity = "1";
    item.style.transform = "translateY(0)";
  });
  // auto remove
  setTimeout(() => {
    item.style.opacity = "0";
    item.style.transform = "translateY(-6px)";
    setTimeout(() => {
      item.remove();
    }, 200);
  }, duration);
}
