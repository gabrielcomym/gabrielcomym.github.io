const markdownSourceNode = document.querySelector("[data-markdown-source]");
const markdownSource = markdownSourceNode?.value ?? "";

const downloadButton = document.querySelector("[data-download-markdown]");
const externalLinkUrls = Array.from(document.querySelectorAll(".main-link__url"));
const headerTooltipTriggers = Array.from(
  document.querySelectorAll(".sheet__actions button, .sheet__actions a")
);
const testimonialsSection = document.querySelector("[data-testimonials]");
const testimonialsBody = document.querySelector("[data-testimonials-body]");
const bootScreen = document.querySelector("[data-boot-screen]");
const bootCode = document.querySelector("[data-boot-code]");
const aboutLayer = document.querySelector("[data-about-layer]");
const aboutOpenButton = document.querySelector("[data-about-open]");
const aboutCloseButton = document.querySelector("[data-about-close]");
const aboutContent = document.querySelector("[data-about-content]");
const aboutCursor = document.querySelector("[data-about-cursor]");
const mobileActionDownloadButton = document.querySelector("[data-mobile-action-download]");
const workPreview = document.querySelector("[data-work-preview]");
const workPreviewImage = document.querySelector("[data-work-preview-image]");
const workPreviewTriggers = Array.from(document.querySelectorAll(".main-link[data-preview-src]"));
const privateCaseLinks = Array.from(document.querySelectorAll("[data-private-case-path]"));

const DOWNLOAD_FEEDBACK_DURATION = 2200;
const ICON_SWAP_DURATION = 140;
const MAX_VISIBLE_URL_LENGTH = 60;
const TESTIMONIALS_COLLAPSED_HEIGHT = 400;
const BOOT_SCREEN_MIN_DURATION = 1000;
const BOOT_SCREEN_FADE_DURATION = 180;
const ABOUT_LAYER_REVEAL_DURATION = 760;
const ABOUT_LAYER_CONTENT_DELAY = 520;
const WORK_PREVIEW_BREAKPOINT = 1100;
const WORK_PREVIEW_MIN_WIDTH = 540;
const WORK_PREVIEW_MAX_WIDTH = 1040;
const WORK_PREVIEW_FALLBACK_ASPECT_RATIO = 16 / 9;
const navigationEntry = performance.getEntriesByType("navigation")[0];
const isHistoryRestore = navigationEntry?.type === "back_forward";
const shouldPlayBoot = !isHistoryRestore;

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

let downloadFeedbackTimeoutId;
let aboutRevealTimeoutId;
let aboutCloseTimeoutId;
let workPreviewFrame = 0;
let aboutCursorFrame = 0;
let activeWorkPreviewTrigger = null;

const workPreviewMotion = {
  active: false,
  currentX: 0,
  currentY: 0,
  currentRotateX: 0,
  currentRotateY: 0,
  currentShadowX: 0,
  currentShadowY: 0,
  targetX: 0,
  targetY: 0,
  targetRotateX: 0,
  targetRotateY: 0,
  targetShadowX: 0,
  targetShadowY: 0,
};

const aboutCursorMotion = {
  currentX: window.innerWidth / 2,
  currentY: window.innerHeight / 2,
  targetX: window.innerWidth / 2,
  targetY: window.innerHeight / 2,
};

const lastPointerPosition = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
};

const bootSnippets = [
  [["muted", "1"], ["plain", "const "], ["blue", "runtime"], ["plain", " = "], ["orange", "\"portfolio\""], ["plain", ";"]],
  [["muted", "2"], ["plain", "const "], ["blue", "root"], ["plain", " = document.documentElement;"]],
  [["muted", "3"], ["plain", "const "], ["blue", "page"], ["plain", " = document.querySelector("], ["orange", "\".page\""], ["plain", ");"]],
  [["muted", "4"], ["plain", "const "], ["blue", "sections"], ["plain", " = ["], ["orange", "\"intro\""], ["plain", ", "], ["orange", "\"work\""], ["plain", ", "], ["orange", "\"clients\""], ["plain", ", "], ["orange", "\"highlights\""], ["plain", ", "], ["orange", "\"awards\""], ["plain", ", "], ["orange", "\"writing\""], ["plain", ", "], ["orange", "\"testimonials\""], ["plain", "];"]],
  [["muted", "5"], ["plain", "await "], ["blue", "document.fonts.ready"], ["plain", ";"]],
  [["muted", "6"], ["plain", "const "], ["blue", "manifest"], ["plain", " = sections.filter(Boolean);"]],
  [["muted", "7"], ["plain", "root.dataset.state"], ["plain", " = "], ["orange", "\"booting\""], ["plain", ";"]],
  [["muted", "8"], ["plain", "for ("], ["plain", "const "], ["blue", "section"], ["plain", " of manifest) {"]],
  [["muted", "9"], ["plain", "  "], ["blue", "console.info"], ["plain", "("], ["orange", "\"mount\""], ["plain", ", section);"]],
  [["muted", "10"], ["plain", "}"]],
  [["muted", "11"], ["plain", "page.classList.remove("], ["orange", "\"is-hidden\""], ["plain", ");"]],
  [["muted", "12"], ["plain", "bindDownloadAction("], ["orange", "\"comym.md\""], ["plain", ");"]],
  [["muted", "13"], ["plain", "syncMainLinks("], ["orange", "\"work\""], ["plain", ");"]],
  [["muted", "14"], ["plain", "syncTerminalFrame();"]],
  [["muted", "15"], ["plain", "verifyMarkdownExport();"]],
  [["muted", "16"], ["plain", "root.dataset.state"], ["plain", " = "], ["orange", "\"ready\""], ["plain", ";"]],
  [["muted", "17"], ["plain", "console.info("], ["orange", "\"portfolio mounted at /\""], ["plain", ");"]],
];

if (window.lucide) {
  window.lucide.createIcons({
    attrs: {
      width: 15,
      height: 15,
      strokeWidth: 1.7,
    },
  });
}

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

      return `<p class="boot-screen__snippet" style="animation-delay:${index * 0.034}s">${tokens}</p>`;
    })
    .join("");
};

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

const dismissHeaderTooltips = () => {
  headerTooltipTriggers.forEach((trigger) => {
    if (trigger instanceof HTMLElement) {
      trigger.blur();
    }
  });
};

const resetPageScrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  });
};

const syncPrivateCaseLinks = () => {
  if (!privateCaseLinks.length) return;

  const isLocalFile = window.location.protocol === "file:";
  const isLocalHost =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

  privateCaseLinks.forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) return;

    const casePath = link.dataset.privateCasePath;
    if (!casePath) return;

    const normalizedCasePath = casePath.replace(/^\/+|\/+$/g, "");

    if (isLocalFile) {
      link.href = new URL(
        `../comym-private-case-studies/${normalizedCasePath}/index.html`,
        window.location.href
      ).href;
      return;
    }

    if (isLocalHost) {
      link.href = `${window.location.protocol}//${window.location.hostname}:8020/${normalizedCasePath}/`;
      return;
    }

    link.href = `https://cases.comym.co/${normalizedCasePath}/`;
  });
};

const syncWorkPreviewState = () => {
  if (!(workPreview instanceof HTMLElement)) return;

  const frame = workPreview.firstElementChild;

  workPreview.style.setProperty("--preview-shift-x", `${workPreviewMotion.currentX.toFixed(2)}px`);
  workPreview.style.setProperty("--preview-shift-y", `${workPreviewMotion.currentY.toFixed(2)}px`);
  workPreview.style.setProperty(
    "--preview-tilt-x",
    `${workPreviewMotion.currentRotateX.toFixed(2)}deg`
  );
  workPreview.style.setProperty(
    "--preview-tilt-y",
    `${workPreviewMotion.currentRotateY.toFixed(2)}deg`
  );
  workPreview.style.setProperty(
    "--preview-scale",
    workPreviewMotion.active ? "1" : "0.965"
  );

  if (frame instanceof HTMLElement) {
    frame.style.boxShadow = `${
      workPreviewMotion.currentShadowX.toFixed(2)
    }px ${(
      28 + workPreviewMotion.currentShadowY
    ).toFixed(2)}px 90px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.07)`;
  }
};

const animateWorkPreview = () => {
  workPreviewFrame = 0;

  const ease = workPreviewMotion.active ? 0.14 : 0.12;

  workPreviewMotion.currentX += (workPreviewMotion.targetX - workPreviewMotion.currentX) * ease;
  workPreviewMotion.currentY += (workPreviewMotion.targetY - workPreviewMotion.currentY) * ease;
  workPreviewMotion.currentRotateX +=
    (workPreviewMotion.targetRotateX - workPreviewMotion.currentRotateX) * ease;
  workPreviewMotion.currentRotateY +=
    (workPreviewMotion.targetRotateY - workPreviewMotion.currentRotateY) * ease;
  workPreviewMotion.currentShadowX +=
    (workPreviewMotion.targetShadowX - workPreviewMotion.currentShadowX) * ease;
  workPreviewMotion.currentShadowY +=
    (workPreviewMotion.targetShadowY - workPreviewMotion.currentShadowY) * ease;

  syncWorkPreviewState();

  const isSettled =
    Math.abs(workPreviewMotion.targetX - workPreviewMotion.currentX) < 0.08 &&
    Math.abs(workPreviewMotion.targetY - workPreviewMotion.currentY) < 0.08 &&
    Math.abs(workPreviewMotion.targetRotateX - workPreviewMotion.currentRotateX) < 0.02 &&
    Math.abs(workPreviewMotion.targetRotateY - workPreviewMotion.currentRotateY) < 0.02 &&
    Math.abs(workPreviewMotion.targetShadowX - workPreviewMotion.currentShadowX) < 0.08 &&
    Math.abs(workPreviewMotion.targetShadowY - workPreviewMotion.currentShadowY) < 0.08;

  if (workPreviewMotion.active || !isSettled) {
    workPreviewFrame = window.requestAnimationFrame(animateWorkPreview);
  }
};

const queueWorkPreviewFrame = () => {
  if (workPreviewFrame) return;
  workPreviewFrame = window.requestAnimationFrame(animateWorkPreview);
};

const isHomeInteractionLocked = () => document.body.classList.contains("is-booting");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getWorkPreviewAspectRatio = () => {
  if (
    workPreviewImage instanceof HTMLImageElement &&
    workPreviewImage.naturalWidth > 0 &&
    workPreviewImage.naturalHeight > 0
  ) {
    return workPreviewImage.naturalWidth / workPreviewImage.naturalHeight;
  }

  return WORK_PREVIEW_FALLBACK_ASPECT_RATIO;
};

const syncWorkPreviewSize = () => {
  if (!(workPreview instanceof HTMLElement)) {
    return {
      width: 0,
      height: 0,
      viewportPadding: 28,
    };
  }

  const viewportGrowth = clamp((window.innerWidth - 1280) / 640, 0, 1);
  const aspectRatio = getWorkPreviewAspectRatio();
  const viewportPadding = Math.round(28 + viewportGrowth * 18);
  const maxWidth = Math.max(window.innerWidth - viewportPadding * 2, 0);
  const maxHeight = Math.max(window.innerHeight - viewportPadding * 2, 0);
  const preferredWidth = Math.min(
    window.innerWidth * (0.43 + viewportGrowth * 0.12),
    620 + viewportGrowth * (WORK_PREVIEW_MAX_WIDTH - 620),
    WORK_PREVIEW_MAX_WIDTH
  );
  const preferredHeight = Math.min(
    window.innerHeight * (0.47 + viewportGrowth * 0.13),
    maxHeight
  );

  let width = Math.min(preferredWidth, maxWidth);
  let height = width / aspectRatio;

  if (height > preferredHeight) {
    height = preferredHeight;
    width = height * aspectRatio;
  }

  const minWidth = Math.min(
    maxWidth,
    WORK_PREVIEW_MIN_WIDTH + viewportGrowth * 120
  );

  if (width < minWidth) {
    width = minWidth;
    height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  }

  workPreview.style.setProperty("--preview-width", `${width.toFixed(2)}px`);

  return {
    width,
    height,
    viewportPadding,
  };
};

const updateWorkPreviewTargets = (event, trigger) => {
  if (!(trigger instanceof HTMLElement)) return;

  const rect = trigger.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const xRatio = Math.max(-1, Math.min(1, (event.clientX - centerX) / (rect.width / 2 || 1)));
  const yRatio = Math.max(-1, Math.min(1, (event.clientY - centerY) / (rect.height / 2 || 1)));

  workPreviewMotion.targetX = xRatio * 18;
  workPreviewMotion.targetY = yRatio * 14;
  workPreviewMotion.targetRotateX = -yRatio * 12;
  workPreviewMotion.targetRotateY = xRatio * 12;
  workPreviewMotion.targetShadowX = xRatio * 26;
  workPreviewMotion.targetShadowY = -yRatio * 18;
};

const setWorkPreviewTriggerState = (trigger, isActive) => {
  if (!(trigger instanceof HTMLElement)) return;
  trigger.classList.toggle("is-hovered", isActive);
};

const showWorkPreview = (trigger, event) => {
  if (
    !(trigger instanceof HTMLElement) ||
    !(workPreview instanceof HTMLElement) ||
    !(workPreviewImage instanceof HTMLImageElement)
  ) {
    return;
  }

  const src = trigger.dataset.previewSrc;
  if (src) {
    workPreviewImage.src = src;
  }

  workPreviewImage.alt = trigger.dataset.previewAlt || "";
  workPreviewMotion.active = true;
  updateWorkPreviewTargets(event, trigger);
  workPreview.classList.add("is-visible");
  workPreview.setAttribute("aria-hidden", "false");
  positionWorkPreview(trigger);
  window.requestAnimationFrame(() => {
    positionWorkPreview(trigger);
  });
  queueWorkPreviewFrame();
};

const hideWorkPreview = () => {
  if (!(workPreview instanceof HTMLElement)) return;

  setWorkPreviewTriggerState(activeWorkPreviewTrigger, false);
  activeWorkPreviewTrigger = null;
  workPreviewMotion.active = false;
  workPreviewMotion.targetX = 0;
  workPreviewMotion.targetY = 0;
  workPreviewMotion.targetRotateX = 0;
  workPreviewMotion.targetRotateY = 0;
  workPreviewMotion.targetShadowX = 0;
  workPreviewMotion.targetShadowY = 0;
  workPreview.classList.remove("is-visible");
  workPreview.setAttribute("aria-hidden", "true");
  queueWorkPreviewFrame();
};

const resetAboutScroll = () => {
  if (!(aboutContent instanceof HTMLElement)) return;
  aboutContent.scrollTo({ top: 0, left: 0, behavior: "auto" });
};

const syncAboutCursorState = () => {
  if (!(aboutCursor instanceof HTMLElement)) return;
  aboutCursor.style.setProperty("--about-cursor-x", `${aboutCursorMotion.currentX}px`);
  aboutCursor.style.setProperty("--about-cursor-y", `${aboutCursorMotion.currentY}px`);
};

const animateAboutCursor = () => {
  aboutCursorFrame = 0;

  aboutCursorMotion.currentX += (aboutCursorMotion.targetX - aboutCursorMotion.currentX) * 0.28;
  aboutCursorMotion.currentY += (aboutCursorMotion.targetY - aboutCursorMotion.currentY) * 0.28;
  syncAboutCursorState();

  const isSettled =
    Math.abs(aboutCursorMotion.targetX - aboutCursorMotion.currentX) < 0.16 &&
    Math.abs(aboutCursorMotion.targetY - aboutCursorMotion.currentY) < 0.16;

  if (!isSettled) {
    aboutCursorFrame = window.requestAnimationFrame(animateAboutCursor);
  }
};

const queueAboutCursorFrame = () => {
  if (aboutCursorFrame) return;
  aboutCursorFrame = window.requestAnimationFrame(animateAboutCursor);
};

const clampPointerToViewport = (x, y) => ({
  x: clamp(x, 0, window.innerWidth),
  y: clamp(y, 0, window.innerHeight),
});

const updateLastPointerPosition = (x, y) => {
  const next = clampPointerToViewport(x, y);
  lastPointerPosition.x = next.x;
  lastPointerPosition.y = next.y;
};

const syncAboutCursor = (event) => {
  updateLastPointerPosition(event.clientX, event.clientY);
  aboutCursorMotion.targetX = event.clientX;
  aboutCursorMotion.targetY = event.clientY;
  queueAboutCursorFrame();
};

const positionWorkPreview = (trigger) => {
  if (!(trigger instanceof HTMLElement) || !(workPreview instanceof HTMLElement)) return;

  const {
    width: previewWidth,
    height: previewHeight,
    viewportPadding,
  } = syncWorkPreviewSize();

  let left = window.innerWidth / 2 - previewWidth / 2;
  const maxLeft = window.innerWidth - previewWidth - viewportPadding;
  left = Math.min(Math.max(left, viewportPadding), maxLeft);

  let top = window.innerHeight / 2;
  const minTop = viewportPadding + previewHeight / 2;
  const maxTop = window.innerHeight - viewportPadding - previewHeight / 2;
  top = Math.min(Math.max(top, minTop), maxTop);

  workPreview.style.setProperty("--preview-left", `${left}px`);
  workPreview.style.setProperty("--preview-top", `${top}px`);
};

const bindWorkPreview = () => {
  if (
    !(workPreview instanceof HTMLElement) ||
    !(workPreviewImage instanceof HTMLImageElement) ||
    !workPreviewTriggers.length
  ) {
    return;
  }

  workPreviewTriggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", (event) => {
      if (
        isHomeInteractionLocked() ||
        window.innerWidth <= WORK_PREVIEW_BREAKPOINT ||
        document.body.classList.contains("is-about-open")
      ) {
        hideWorkPreview();
        return;
      }

      if (!(trigger instanceof HTMLElement)) return;

      setWorkPreviewTriggerState(activeWorkPreviewTrigger, false);
      activeWorkPreviewTrigger = trigger;
      setWorkPreviewTriggerState(activeWorkPreviewTrigger, true);
      showWorkPreview(activeWorkPreviewTrigger, event);
    });

    trigger.addEventListener("mousemove", (event) => {
      if (!workPreviewMotion.active || activeWorkPreviewTrigger !== trigger) return;
      updateWorkPreviewTargets(event, trigger);
      queueWorkPreviewFrame();
    });

    trigger.addEventListener("mouseleave", () => {
      if (activeWorkPreviewTrigger !== trigger) return;
      hideWorkPreview();
    });
  });

  workPreviewImage.addEventListener("load", () => {
    if (!(activeWorkPreviewTrigger instanceof HTMLElement)) return;
    positionWorkPreview(activeWorkPreviewTrigger);
  });
};

const bindMainLinkNavigation = () => {
  const mainLinks = Array.from(document.querySelectorAll(".main-link"));

  mainLinks.forEach((item) => {
    item.addEventListener("click", (event) => {
      if (!(item instanceof HTMLElement)) return;
      if (isHomeInteractionLocked()) {
        event.preventDefault();
        return;
      }
      if (event.target instanceof Element && event.target.closest("a, button")) return;

      const anchor = item.querySelector(".main-link__title");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      if (anchor.target === "_blank") {
        window.open(anchor.href, "_blank", "noopener");
        return;
      }

      window.location.href = anchor.href;
    });
  });
};

const openAboutLayer = () => {
  if (!(aboutLayer instanceof HTMLElement)) return;
  if (aboutLayer.classList.contains("is-open")) return;

  window.clearTimeout(aboutRevealTimeoutId);
  window.clearTimeout(aboutCloseTimeoutId);

  hideWorkPreview();
  resetAboutScroll();
  aboutCursorMotion.currentX = lastPointerPosition.x;
  aboutCursorMotion.currentY = lastPointerPosition.y;
  aboutCursorMotion.targetX = lastPointerPosition.x;
  aboutCursorMotion.targetY = lastPointerPosition.y;
  syncAboutCursorState();
  document.body.classList.add("is-about-open", "is-about-transitioning");
  dismissHeaderTooltips();
  aboutOpenButton?.blur();
  aboutLayer.setAttribute("aria-hidden", "false");
  aboutLayer.classList.remove("is-closing", "is-content-visible");
  aboutLayer.classList.add("is-open");

  window.requestAnimationFrame(() => {
    resetAboutScroll();
  });

  aboutRevealTimeoutId = window.setTimeout(() => {
    resetAboutScroll();
    aboutLayer.classList.add("is-content-visible");
    document.body.classList.remove("is-about-transitioning");
  }, ABOUT_LAYER_CONTENT_DELAY);
};

const closeAboutLayer = () => {
  if (!(aboutLayer instanceof HTMLElement)) return;
  if (!aboutLayer.classList.contains("is-open")) return;

  window.clearTimeout(aboutRevealTimeoutId);
  window.clearTimeout(aboutCloseTimeoutId);

  document.body.classList.add("is-about-transitioning");
  aboutLayer.classList.remove("is-content-visible");
  aboutLayer.classList.add("is-closing");

  aboutCloseTimeoutId = window.setTimeout(() => {
    aboutLayer.classList.remove("is-open", "is-closing");
    aboutLayer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-about-open", "is-about-transitioning");
    resetAboutScroll();
  }, ABOUT_LAYER_REVEAL_DURATION);
};

const dismissBootScreen = () => {
  if (!bootScreen) return;

  bootScreen.classList.add("is-leaving");
  window.setTimeout(() => {
    bootScreen.remove();
    document.body.classList.remove("is-booting");
  }, BOOT_SCREEN_FADE_DURATION);
};

const removeBootScreenImmediately = () => {
  if (!bootScreen) return;
  bootScreen.remove();
  document.body.classList.remove("is-booting");
};

if (testimonialsSection instanceof HTMLElement && testimonialsBody instanceof HTMLElement) {
  testimonialsSection.tabIndex = 0;

  const syncTestimonialsHeight = () => {
    if (testimonialsSection.classList.contains("is-expanded")) {
      testimonialsBody.style.maxHeight = `${testimonialsBody.scrollHeight}px`;
      return;
    }

    testimonialsBody.style.maxHeight = `${TESTIMONIALS_COLLAPSED_HEIGHT}px`;
  };

  const toggleTestimonials = () => {
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

headerTooltipTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
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

mobileActionDownloadButton?.addEventListener("click", () => {
  downloadButton?.click();
});

aboutOpenButton?.addEventListener("click", (event) => {
  updateLastPointerPosition(event.clientX, event.clientY);
  openAboutLayer();
});

aboutCloseButton?.addEventListener("click", () => {
  closeAboutLayer();
});

aboutLayer?.addEventListener("pointermove", (event) => {
  if (!document.body.classList.contains("is-about-open")) return;
  syncAboutCursor(event);
});

aboutLayer?.addEventListener("click", () => {
  closeAboutLayer();
});

bindWorkPreview();
bindMainLinkNavigation();
syncPrivateCaseLinks();
truncateExternalLinkUrls();
syncWorkPreviewSize();
resetPageScrollToTop();
if (shouldPlayBoot) {
  renderBootSnippets();
}

window.addEventListener("blur", hideWorkPreview);
window.addEventListener("focus", dismissHeaderTooltips);
window.addEventListener("resize", hideWorkPreview);
window.addEventListener("resize", () => {
  syncWorkPreviewSize();
  updateLastPointerPosition(lastPointerPosition.x, lastPointerPosition.y);
  aboutCursorMotion.currentX = lastPointerPosition.x;
  aboutCursorMotion.currentY = lastPointerPosition.y;
  aboutCursorMotion.targetX = lastPointerPosition.x;
  aboutCursorMotion.targetY = lastPointerPosition.y;
  syncAboutCursorState();
});
window.addEventListener("pointermove", (event) => {
  updateLastPointerPosition(event.clientX, event.clientY);
}, { passive: true });
window.addEventListener("pageshow", (event) => {
  resetPageScrollToTop();
  dismissHeaderTooltips();
  hideWorkPreview();

  if (event.persisted) {
    removeBootScreenImmediately();
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    dismissHeaderTooltips();
    return;
  }

  hideWorkPreview();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAboutLayer();
  }
});

if (shouldPlayBoot) {
  Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((resolve) => window.setTimeout(resolve, BOOT_SCREEN_MIN_DURATION)),
  ]).then(() => {
    dismissBootScreen();
  });
} else {
  removeBootScreenImmediately();
}
