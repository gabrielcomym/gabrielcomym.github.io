const markdownSourceNode = document.querySelector("[data-markdown-source]");
const markdownSource = markdownSourceNode?.value ?? "";

const downloadButton = document.querySelector("[data-download-markdown]");
const terminalLoginLines = Array.from(document.querySelectorAll("[data-terminal-login]"));
const externalLinkUrls = Array.from(document.querySelectorAll(".external-link__url"));
const bootScreen = document.querySelector("[data-boot-screen]");
const bootCode = document.querySelector("[data-boot-code]");
const DOWNLOAD_FEEDBACK_DURATION = 2200;
const BOOT_SCREEN_MIN_DURATION = 1040;
const BOOT_SCREEN_FADE_DURATION = 140;
const ICON_SWAP_DURATION = 140;
let downloadFeedbackTimeoutId;
const MAX_VISIBLE_URL_LENGTH = 50;
const bootSnippets = [
  [["muted", "1"], ["accent", "+"], ["plain", " const "], ["blue", "bootConfig"], ["plain", " = { "], ["blue", "entry"], ["plain", ": "], ["orange", "\"portfolio\""], ["plain", ", "], ["blue", "mode"], ["plain", ": "], ["orange", "\"terminal\""], ["plain", " };"]],
  [["muted", "2"], ["accent", "+"], ["plain", " const "], ["blue", "root"], ["plain", " = "], ["blue", "document"], ["plain", "."], ["blue", "documentElement"], ["plain", ";"]],
  [["muted", "3"], ["accent", "+"], ["plain", " const "], ["blue", "page"], ["plain", " = "], ["blue", "document"], ["plain", "."], ["blue", "querySelector"], ["plain", "("], ["orange", "\".page\""], ["plain", ");"]],
  [["muted", "4"], ["accent", "+"], ["plain", " const "], ["blue", "bootScreen"], ["plain", " = "], ["blue", "document"], ["plain", "."], ["blue", "querySelector"], ["plain", "("], ["orange", "\"[data-boot-screen]\""], ["plain", ");"]],
  [["muted", "5"], ["accent", "+"], ["plain", " const "], ["blue", "modules"], ["plain", " = ["], ["orange", "\"about\""], ["plain", ", "], ["orange", "\"work\""], ["plain", ", "], ["orange", "\"download\""], ["plain", ", "], ["orange", "\"video\""], ["plain", "];"]],
  [["muted", "6"], ["accent", "+"], ["plain", " await "], ["blue", "document"], ["plain", "."], ["blue", "fonts"], ["plain", "."], ["blue", "ready"], ["plain", ";"]],
  [["muted", "7"], ["accent", "+"], ["plain", " "], ["blue", "root"], ["plain", "."], ["blue", "dataset"], ["plain", "."], ["blue", "state"], ["plain", " = "], ["orange", "\"booting\""], ["plain", ";"]],
  [["muted", "8"], ["accent", "+"], ["plain", " "], ["blue", "modules"], ["plain", "."], ["blue", "forEach"], ["plain", "((module, index) => {"]],
  [["muted", "9"], ["accent", "+"], ["plain", "   "], ["blue", "console"], ["plain", "."], ["blue", "log"], ["plain", "("], ["orange", "\"mount:\""], ["plain", ", module, index);"]],
  [["muted", "10"], ["accent", "+"], ["plain", " });"]],
  [["muted", "11"], ["accent", "+"], ["plain", " "], ["blue", "hydrateNavigation"], ["plain", "("], ["blue", "bootConfig"], ["plain", "."], ["blue", "entry"], ["plain", ");"]],
  [["muted", "12"], ["accent", "+"], ["plain", " "], ["blue", "hydrateContentPanels"], ["plain", "();"]],
  [["muted", "13"], ["accent", "+"], ["plain", " "], ["blue", "hydrateExternalLinks"], ["plain", "();"]],
  [["muted", "14"], ["accent", "+"], ["plain", " "], ["blue", "hydrateDownloadAction"], ["plain", "();"]],
  [["muted", "15"], ["accent", "+"], ["plain", " "], ["blue", "page"], ["plain", "."], ["blue", "classList"], ["plain", "."], ["blue", "remove"], ["plain", "("], ["orange", "\"is-hidden\""], ["plain", ");"]],
  [["muted", "16"], ["accent", "+"], ["plain", " "], ["blue", "bootScreen"], ["plain", "."], ["blue", "classList"], ["plain", "."], ["blue", "add"], ["plain", "("], ["orange", "\"is-leaving\""], ["plain", ");"]],
  [["muted", "17"], ["accent", "+"], ["plain", " "], ["blue", "root"], ["plain", "."], ["blue", "dataset"], ["plain", "."], ["blue", "state"], ["plain", " = "], ["orange", "\"ready\""], ["plain", ";"]],
  [["muted", "18"], ["accent", "+"], ["plain", " export "], ["blue", "default"], ["plain", " bootConfig;"]],
];

const escapeHtml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const renderBootSnippets = () => {
  if (!bootCode) return;

  bootCode.innerHTML = bootSnippets
    .map((line, index) => {
      const tokens = line
        .map(
          ([kind, value]) =>
            `<span class="boot-screen__token boot-screen__token--${kind}">${escapeHtml(value)}</span>`
        )
        .join("");

      return `<p class="boot-screen__snippet" style="animation-delay:${index * 0.04}s">${tokens}</p>`;
    })
    .join("");
};

if (window.lucide) {
  window.lucide.createIcons({
    attrs: {
      width: 15,
      height: 15,
      strokeWidth: 1.7,
    },
  });
}

const setButtonIcon = (button, iconName) => {
  if (!button) return;
  const currentIconName = button.dataset.iconName;
  if (currentIconName === iconName) return;

  const renderIcon = () => {
    button.innerHTML = `<i data-lucide="${iconName}" aria-hidden="true"></i>`;
    button.dataset.iconName = iconName;
    button.classList.toggle("is-success", iconName === "check");

    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          width: 15,
          height: 15,
          strokeWidth: 1.7,
        },
      });
    }
  };

  if (!currentIconName) {
    renderIcon();
    return;
  }

  window.clearTimeout(Number(button.dataset.iconSwapTimeout || 0));
  button.classList.remove("is-icon-entering");
  button.classList.add("is-icon-leaving");

  const timeoutId = window.setTimeout(() => {
    renderIcon();
    button.classList.remove("is-icon-leaving");
    button.classList.add("is-icon-entering");

    const settleTimeoutId = window.setTimeout(() => {
      button.classList.remove("is-icon-entering");
    }, ICON_SWAP_DURATION);

    button.dataset.iconSwapTimeout = String(settleTimeoutId);
  }, ICON_SWAP_DURATION);

  button.dataset.iconSwapTimeout = String(timeoutId);
};

if (downloadButton) {
  downloadButton.dataset.originalIcon = "download";
  downloadButton.dataset.iconName = "download";
}

const triggerDownloadFeedback = (isError = false) => {
  if (!downloadButton) return;

  window.clearTimeout(downloadFeedbackTimeoutId);

  downloadButton.classList.add("is-active");
  downloadButton.classList.toggle("is-success", !isError);
  setButtonIcon(downloadButton, isError ? "download" : "check");

  downloadFeedbackTimeoutId = window.setTimeout(() => {
    downloadButton.classList.remove("is-active", "is-success");
    setButtonIcon(downloadButton, downloadButton.dataset.originalIcon || "download");
  }, DOWNLOAD_FEEDBACK_DURATION);
};

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatTerminalLoginLine = (date) => {
  const weekday = weekdayNames[date.getDay()];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `Last login: ${weekday} ${month} ${day} ${hours}:${minutes}:${seconds} on ttys014`;
};

const updateTerminalLoginLines = () => {
  const label = formatTerminalLoginLine(new Date());
  terminalLoginLines.forEach((node) => {
    node.textContent = label;
  });
};

const truncateExternalLinkUrls = () => {
  externalLinkUrls.forEach((node) => {
    const fullText = node.dataset.fullUrl ?? node.textContent ?? "";
    if (!node.dataset.fullUrl) {
      node.dataset.fullUrl = fullText;
    }

    node.textContent =
      fullText.length > MAX_VISIBLE_URL_LENGTH
        ? `${fullText.slice(0, MAX_VISIBLE_URL_LENGTH - 1)}…`
        : fullText;
  });
};

const dismissBootScreen = () => {
  if (!bootScreen) return;

  bootScreen.classList.add("is-leaving");
  window.setTimeout(() => {
    bootScreen.remove();
    document.body.classList.remove("is-booting");
  }, BOOT_SCREEN_FADE_DURATION);
};

downloadButton?.addEventListener("click", () => {
  try {
    if (!markdownSource.trim()) throw new Error("missing markdown");
    const blob = new Blob([markdownSource], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "comym.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    triggerDownloadFeedback(false);
  } catch {
    triggerDownloadFeedback(true);
  }
});
truncateExternalLinkUrls();
updateTerminalLoginLines();
renderBootSnippets();
window.setInterval(updateTerminalLoginLines, 1000);

Promise.all([
  document.fonts?.ready ?? Promise.resolve(),
  new Promise((resolve) => window.setTimeout(resolve, BOOT_SCREEN_MIN_DURATION)),
]).then(dismissBootScreen);
