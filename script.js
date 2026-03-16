const markdownSourceNode = document.querySelector("[data-markdown-source]");
const markdownSource = markdownSourceNode?.value ?? "";

const downloadButton = document.querySelector("[data-download-markdown]");
const terminalLoginLines = Array.from(document.querySelectorAll("[data-terminal-login]"));
const externalLinkUrls = Array.from(document.querySelectorAll(".main-link__url"));
const mainLinkCards = Array.from(document.querySelectorAll(".main-link"));
const headerIconButtons = Array.from(document.querySelectorAll(".sheet__actions .icon-button"));
const testimonialsSection = document.querySelector("[data-testimonials]");
const testimonialsBody = document.querySelector("[data-testimonials-body]");
const bootScreen = document.querySelector("[data-boot-screen]");
const bootCode = document.querySelector("[data-boot-code]");
const DOWNLOAD_FEEDBACK_DURATION = 2200;
const BOOT_SCREEN_MIN_DURATION = 760;
const BOOT_SCREEN_FADE_DURATION = 140;
const ICON_SWAP_DURATION = 140;
const INITIAL_HERO_OFFSET = () => Math.round(window.innerHeight * 0.35);
const MOBILE_MEDIA_QUERY = "(max-width: 640px)";
let downloadFeedbackTimeoutId;
const MAX_VISIBLE_URL_LENGTH = 60;
const TESTIMONIALS_COLLAPSED_HEIGHT = 400;
const bootSnippets = [
  [["muted", "1"], ["plain", "const "], ["blue", "runtime"], ["plain", " = "], ["orange", "\"portfolio\""], ["plain", ";"]],
  [["muted", "2"], ["plain", "const "], ["blue", "root"], ["plain", " = document.documentElement;"]],
  [["muted", "3"], ["plain", "const "], ["blue", "page"], ["plain", " = document.querySelector("], ["orange", "\".page\""], ["plain", ");"]],
  [["muted", "4"], ["plain", "const "], ["blue", "sections"], ["plain", " = ["], ["orange", "\"intro\""], ["plain", ", "], ["orange", "\"work\""], ["plain", ", "], ["orange", "\"clients\""], ["plain", ", "], ["orange", "\"highlights\""], ["plain", ", "], ["orange", "\"awards\""], ["plain", ", "], ["orange", "\"writing\""], ["plain", ", "], ["orange", "\"testimonials\""], ["plain", "];"]],
  [["muted", "5"], ["plain", "await "], ["blue", "document.fonts.ready"], ["plain", ";"]],
  [["muted", "6"], ["plain", "const "], ["blue", "manifest"], ["plain", " = sections.filter(Boolean);"]],
  [["muted", "7"], ["plain", "root.dataset.state"], ["plain", " = "], ["orange", "\"booting\""], ["plain", ";"]],
  [["muted", "8"], ["plain", "for ("], ["plain", "const "], ["blue", "section"], ["plain", " of manifest) {" ]],
  [["muted", "9"], ["plain", "  "], ["blue", "console.info"], ["plain", "("], ["orange", "\"mount\""], ["plain", ", section);"]],
  [["muted", "10"], ["plain", "}"]],
  [["muted", "11"], ["plain", "page.classList.remove("], ["orange", "\"is-hidden\""], ["plain", ");"]],
  [["muted", "12"], ["plain", "bindDownloadAction("], ["orange", "\"comym.md\""], ["plain", ");"]],
  [["muted", "13"], ["plain", "syncMainLinks("], ["orange", "\"work\""], ["plain", ");"]],
  [["muted", "14"], ["plain", "attachMediaLayer("], ["orange", "\"video.mov\""], ["plain", ");"]],
  [["muted", "15"], ["plain", "verifyMarkdownExport();"]],
  [["muted", "16"], ["plain", "root.dataset.state"], ["plain", " = "], ["orange", "\"ready\""], ["plain", ";"]],
  [["muted", "17"], ["plain", "console.info("], ["orange", "\"portfolio mounted at /\""], ["plain", ");"]],
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

      return `<p class="boot-screen__snippet" style="animation-delay:${index * 0.024}s">${tokens}</p>`;
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

const dismissHeaderTooltips = () => {
  headerIconButtons.forEach((button) => {
    if (button instanceof HTMLElement) {
      button.blur();
    }
  });
};

const isMobileViewport = () => window.matchMedia(MOBILE_MEDIA_QUERY).matches;

const setInitialHeroViewport = () => {
  if (window.location.hash || isMobileViewport()) return;
  window.scrollTo({ top: INITIAL_HERO_OFFSET(), left: 0, behavior: "auto" });
};

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);

const activateMainLinkCard = (card) => {
  if (card.hasAttribute("data-private-project")) {
    return;
  }

  const titleLink = card.querySelector(".main-link__title");
  if (!titleLink) return;

  const href = titleLink.getAttribute("href");
  if (!href) return;

  if (titleLink.target === "_blank") {
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.assign(href);
};

mainLinkCards.forEach((card) => {
  if (!card.hasAttribute("data-private-project")) {
    card.tabIndex = 0;
  }

  card.addEventListener("click", (event) => {
    if (
      event.target instanceof Element &&
      event.target.closest('a.main-link__title[href]')
    ) {
      return;
    }

    activateMainLinkCard(card);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateMainLinkCard(card);
  });
});

if (testimonialsSection instanceof HTMLElement) {
  testimonialsSection.tabIndex = 0;

  const syncTestimonialsHeight = () => {
    if (!(testimonialsBody instanceof HTMLElement)) return;

    if (testimonialsSection.classList.contains("is-expanded")) {
      testimonialsBody.style.maxHeight = `${testimonialsBody.scrollHeight}px`;
      return;
    }

    testimonialsBody.style.maxHeight = `${TESTIMONIALS_COLLAPSED_HEIGHT}px`;
  };

  const toggleTestimonials = () => {
    if (!(testimonialsBody instanceof HTMLElement)) return;

    const isExpanded = testimonialsSection.classList.contains("is-expanded");
    const currentHeight = testimonialsBody.getBoundingClientRect().height;
    testimonialsBody.style.maxHeight = `${currentHeight}px`;

    window.requestAnimationFrame(() => {
      if (isExpanded) {
        testimonialsSection.classList.remove("is-expanded");
        testimonialsSection.classList.add("is-collapsed");
        testimonialsBody.style.maxHeight = `${TESTIMONIALS_COLLAPSED_HEIGHT}px`;
        return;
      }

      testimonialsSection.classList.remove("is-collapsed");
      testimonialsSection.classList.add("is-expanded");
      testimonialsBody.style.maxHeight = `${testimonialsBody.scrollHeight}px`;
    });
  };

  testimonialsSection.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest(".md-link")) {
      return;
    }

    toggleTestimonials();
  });

  testimonialsSection.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleTestimonials();
  });

  window.addEventListener("resize", syncTestimonialsHeight);
  syncTestimonialsHeight();
}

headerIconButtons.forEach((button) => {
  button.addEventListener("click", () => {
    window.setTimeout(dismissHeaderTooltips, 0);
  });
});

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
window.addEventListener("focus", dismissHeaderTooltips);
window.addEventListener("pageshow", dismissHeaderTooltips);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    dismissHeaderTooltips();
  }
});

Promise.all([
  document.fonts?.ready ?? Promise.resolve(),
  new Promise((resolve) => window.setTimeout(resolve, BOOT_SCREEN_MIN_DURATION)),
]).then(() => {
  dismissBootScreen();
  [BOOT_SCREEN_FADE_DURATION + 8, BOOT_SCREEN_FADE_DURATION + 80, BOOT_SCREEN_FADE_DURATION + 180].forEach(
    (delay) => {
      window.setTimeout(() => {
        window.requestAnimationFrame(setInitialHeroViewport);
      }, delay);
    }
  );
});
