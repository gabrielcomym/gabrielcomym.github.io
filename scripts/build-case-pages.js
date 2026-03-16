const fs = require("fs");
const path = require("path");

const root = process.cwd();

const cases = [
  {
    input: "case-studies/kedro_experiment_tracking_case_study.md",
    slug: "kedro-experiment-tracking",
  },
  {
    input: "case-studies/kedro_modular_pipelines_case_study.md",
    slug: "kedro-modular-pipelines",
  },
  {
    input: "case-studies/wovenlight_rapid_diagnostic_reports_case_study.md",
    slug: "wovenlight-rapid-diagnostic-reports",
  },
  {
    input: "case-studies/wovenlight_rebranding_case_study.md",
    slug: "wovenlight-rebranding",
  },
];

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const inlineMarkdownToHtml = (text) => {
  let html = escapeHtml(text);

  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, href) =>
      `<a class="md-link" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(
        label
      )}</a>`
  );

  return html;
};

const parseMarkdown = (markdown) => {
  const lines = markdown.replace(/\r/g, "").split("\n");
  let i = 0;
  const blocks = [];

  const isBlank = (line) => !line.trim();

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2).trim() });
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i += 1;
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, "").trim());
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2).trim());
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    const paragraphLines = [];
    while (
      i < lines.length &&
      !isBlank(lines[i]) &&
      !lines[i].startsWith("# ") &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("### ") &&
      !lines[i].startsWith("- ") &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }

    blocks.push({ type: "p", text: paragraphLines.join(" ") });
  }

  return blocks;
};

const getDescription = (blocks) => {
  const overviewIndex = blocks.findIndex((block) => block.type === "h2" && block.text === "Overview");

  if (overviewIndex !== -1) {
    const firstParagraph = blocks.slice(overviewIndex + 1).find((block) => block.type === "p");
    if (firstParagraph) return firstParagraph.text;
  }

  const fallback = blocks.find((block) => block.type === "p");
  return fallback ? fallback.text : "Case study by Gabriel Comym.";
};

const renderBlocks = (blocks) =>
  blocks
    .map((block) => {
      if (block.type === "h1") {
        return `<section class="block block--framed"><h1>${inlineMarkdownToHtml(block.text)}</h1></section>`;
      }
      if (block.type === "h2") return `<section class="block block--framed"><h2>${inlineMarkdownToHtml(block.text)}</h2>`;
      if (block.type === "h3") return `<h3>${inlineMarkdownToHtml(block.text)}</h3>`;
      if (block.type === "p") return `<p>${inlineMarkdownToHtml(block.text)}</p>`;
      if (block.type === "ul") {
        return `<ul class="stack-list">${block.items
          .map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`)
          .join("")}</ul>`;
      }
      if (block.type === "ol") {
        return `<ol class="stack-list stack-list--ordered">${block.items
          .map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`)
          .join("")}</ol>`;
      }
      return "";
    })
    .join("\n")
    .replace(/<\/section>\n<section class="block block--framed">/g, "</section>\n<section class=\"block block--framed\">")
    .concat("\n");

const wrapSections = (html) => {
  const parts = html.split(/(?=<section class="block block--framed">)/g);
  const [head, ...sections] = parts;
  return `${head}${sections.map((section) => `${section}</section>`).join("\n")}`;
};

const renderPage = ({ title, description, slug, bodyHtml, sourcePath }) => {
  const url = `https://comym.co/work/${slug}/`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: "Gabriel Comym",
      url: "https://comym.co/",
    },
    publisher: {
      "@type": "Person",
      name: "Gabriel Comym",
      url: "https://comym.co/",
    },
    mainEntityOfPage: url,
    image: "https://comym.co/thumbnail.jpg",
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Comym",
      url: "https://comym.co/",
    },
  };

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} — Comym</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta
      name="robots"
      content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
    />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${escapeHtml(title)} — Comym" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="https://comym.co/thumbnail.jpg" />
    <meta property="og:image:alt" content="Comym portfolio preview" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)} — Comym" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="https://comym.co/thumbnail.jpg" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../../styles.css" />
  </head>
  <body>
    <main class="page">
      <div class="page__content">
      <article class="sheet">
        <header class="sheet__header">
          <div class="sheet__brand">
            <p><a class="case-sheet__home" href="../../index.html">Comym</a></p>
          </div>
          <div class="case-sheet__links">
            <a class="case-sheet__link" href="${escapeHtml(sourcePath)}" target="_blank" rel="noreferrer">SOURCE MD</a>
            <a class="case-sheet__link" href="../../index.html#top">BACK</a>
          </div>
        </header>
        ${bodyHtml}
      </article>
      </div>
    </main>
  </body>
</html>`;
};

cases.forEach((entry) => {
  const inputPath = path.join(root, entry.input);
  const markdown = fs.readFileSync(inputPath, "utf8");
  const blocks = parseMarkdown(markdown);
  const titleBlock = blocks.find((block) => block.type === "h1");
  const title = titleBlock ? titleBlock.text : entry.slug;
  const description = getDescription(blocks);
  const html = wrapSections(renderBlocks(blocks));
  const outputDir = path.join(root, "work", entry.slug);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, "index.html"),
    renderPage({
      title,
      description,
      slug: entry.slug,
      bodyHtml: html,
      sourcePath: `../../${entry.input}`,
    })
  );
});
