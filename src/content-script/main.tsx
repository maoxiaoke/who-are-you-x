import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { WhoBadge } from "./WhoBadge";

type DataItem = { account: string; who: string };

const DATA_URL =
  "https://raw.githubusercontent.com/maoxiaoke/who-are-you-x/main/data.json";

let accountMap: Map<string, string> | null = null;
let fetchedOnce = false;

async function ensureData() {
  if (accountMap) return accountMap;
  if (fetchedOnce) return accountMap; // only fetch once per page load
  fetchedOnce = true;
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    const json = (await res.json()) as DataItem[];
    accountMap = new Map(
      json.map((d) => [d.account.trim().toLowerCase(), d.who.trim()]),
    );
  } catch (e) {
    // noop; keep map null and try again later
  }
  return accountMap;
}

function findWrapper(el: Element): HTMLElement | null {
  return el.closest('[data-testid="User-Name"]') as HTMLElement | null;
}

function extractHandle(wrapper: HTMLElement): string | null {
  // Find the handle link inside the user header wrapper
  // Prefer text that starts with '@', else fallback to href path
  const candidateLinks = wrapper.querySelectorAll(
    'a[href^="/"]:not([href*="/status/"])',
  );
  for (const a of Array.from(candidateLinks)) {
    const text = a.textContent?.trim() ?? "";
    if (text.startsWith("@")) return text;
  }
  // Fallback via href
  for (const a of Array.from(candidateLinks)) {
    const href = (a as HTMLAnchorElement).getAttribute("href") || "";
    const m = href.match(/^\/([A-Za-z0-9_]{1,15})(?:$|\?)/);
    if (m) return `@${m[1]}`;
  }
  return null;
}

function injectBadge(timeEl: Element, who: string) {
  const timeLink = timeEl.closest("a");
  if (!timeLink) return;

  // Avoid duplicate injection
  const rowContainer =
    timeLink.parentElement?.parentElement || timeLink.parentElement;
  if (!rowContainer || rowContainer.querySelector("[data-wayx]")) return;

  // Try to find the existing dot element used by X and clone it
  let dot: Element | null = null;
  const dotCandidates = rowContainer.querySelectorAll(
    '[aria-hidden="true"], span, div',
  );
  for (const el of Array.from(dotCandidates)) {
    const text = el.textContent?.trim();
    if (text === "·") {
      dot = el;
      break;
    }
  }

  const parent = timeLink.parentElement;
  if (!parent) return;

  // Insert a cloned dot node to match X’s exact dot glyph and classes
  if (dot) {
    const cloned = dot.cloneNode(true) as Element;
    parent.appendChild(cloned);
  }

  // Create mount and copy font styles from time link (or dot) for perfect match
  const mount = document.createElement("span");
  mount.style.display = "inline";
  const styleSource = (dot as HTMLElement) || (timeLink as HTMLElement);
  const cs = window.getComputedStyle(styleSource);
  mount.style.color = cs.color;
  mount.style.fontFamily = cs.fontFamily;
  mount.style.fontSize = cs.fontSize;
  mount.style.fontWeight = cs.fontWeight as any;
  mount.style.lineHeight = cs.lineHeight;
  mount.style.letterSpacing = cs.letterSpacing;

  // Optional: add a thin space if needed for readability
  parent.appendChild(document.createTextNode(" "));

  parent.appendChild(mount);

  // Truncate display to max 23 code points and set tooltip with full text if truncated
  const arr = Array.from(who);
  const truncated = arr.length > 23;
  const display = truncated ? arr.slice(0, 23).join("") + "…" : who;

  const root = createRoot(mount);
  root.render(<WhoBadge text={display} title={truncated ? who : undefined} />);
}

async function processOnce() {
  const map = await ensureData();
  if (!map) return;
  const times = document.querySelectorAll('a[href*="/status/"] time');
  for (const t of Array.from(times)) {
    const wrapper = findWrapper(t);
    if (!wrapper) continue;
    const handle = extractHandle(wrapper);
    if (!handle) continue;
    const who = map.get(handle.toLowerCase());
    if (!who) continue;
    injectBadge(t, who);
  }
}

function createObserver() {
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(async () => {
      scheduled = false;
      await processOnce();
    }, 400);
  });
  observer.observe(document, { subtree: true, childList: true });
}

// Initial kick
processOnce();
createObserver();
