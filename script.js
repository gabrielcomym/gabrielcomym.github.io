const markdownSourceNode = document.querySelector("[data-markdown-source]");
const markdownSource = markdownSourceNode?.value ?? "";

const downloadButton = document.querySelector("[data-download-markdown]");
const terminalLoginLines = Array.from(document.querySelectorAll("[data-terminal-login]"));
const externalLinkUrls = Array.from(document.querySelectorAll(".main-link__url"));
const bootScreen = document.querySelector("[data-boot-screen]");
const bootCode = document.querySelector("[data-boot-code]");
const DOWNLOAD_FEEDBACK_DURATION = 2200;
const BOOT_SCREEN_MIN_DURATION = 1040;
const BOOT_SCREEN_FADE_DURATION = 140;
const ICON_SWAP_DURATION = 140;
let downloadFeedbackTimeoutId;
const MAX_VISIBLE_URL_LENGTH = 60;
const bootSnippets = [
  [["muted", "1"], ["plain", "[init]"], ["plain", " starting portfolio runtime"]],
  [["muted", "2"], ["plain", "[init]"], ["plain", " loading content manifest"]],
  [["muted", "3"], ["plain", "[ok]"], ["plain", " fonts ready"]],
  [["muted", "4"], ["plain", "[ok]"], ["plain", " intro block mounted"]],
  [["muted", "5"], ["plain", "[ok]"], ["plain", " work index mounted"]],
  [["muted", "6"], ["plain", "[ok]"], ["plain", " client list mounted"]],
  [["muted", "7"], ["plain", "[ok]"], ["plain", " career highlights mounted"]],
  [["muted", "8"], ["plain", "[ok]"], ["plain", " awards block mounted"]],
  [["muted", "9"], ["plain", "[ok]"], ["plain", " writing index mounted"]],
  [["muted", "10"], ["plain", "[ok]"], ["plain", " testimonials mounted"]],
  [["muted", "11"], ["plain", "[ok]"], ["plain", " terminal footer attached"]],
  [["muted", "12"], ["plain", "[ok]"], ["plain", " media layer attached"]],
  [["muted", "13"], ["plain", "[sync]"], ["plain", " link map verified"]],
  [["muted", "14"], ["plain", "[sync]"], ["plain", " markdown export ready"]],
  [["muted", "15"], ["plain", "[sync]"], ["plain", " download action bound"]],
  [["muted", "16"], ["plain", "[ready]"], ["plain", " portfolio mounted at /"]],
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
