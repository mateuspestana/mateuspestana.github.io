const EXAMS = {
  case: {
    title: "A1 prática — Case Observatório Conexão Bairro",
    file: "prova-a1-case.ipynb",
    dictionary: "dados/dicionario-de-dados.md",
    dataFiles: ["publicacoes_brutas.csv", "publicacoes_analise.csv"],
  },
  festival: {
    title: "A1 prática — Missão Festival ViraBairro",
    file: "prova-a1-festival-virabairro.ipynb",
    dictionary: "dados/dicionario-festival-virabairro.md",
    dataFiles: ["publicacoes_brutas.csv", "publicacoes_analise.csv"],
  },
  urbanos: {
    title: "A1 prática — Central de Serviços Urbanos",
    file: "prova-a1-central-servicos-urbanos.ipynb",
    dictionary: "dados/dicionario-solicitacoes-urbanas.md",
    dataFiles: ["solicitacoes_brutas.csv", "solicitacoes_analise.csv"],
  },
  cybersyn: {
    title: "A1 prática — Operação de abastecimento CyberSyn",
    file: "prova-a1-cybersyn-abastecimento.ipynb",
    dictionary: "dados/dicionario-cybersyn-abastecimento.md",
    dataFiles: ["carregamentos_brutos.csv", "carregamentos_analise.csv"],
  },
};

const STORAGE_KEY = "fgv-prova-browser-v1";
const APP_ROOT = document.documentElement.dataset.provaRoot || ".";
const DEFAULT_THEME = document.documentElement.dataset.theme || "editorial";
const asset = (path) => `${APP_ROOT.replace(/\/$/, "")}/${path}`;
let pyodide;
let originalNotebook;
let currentExam;
let runtimePromise;
let executionCounter = 0;
let cellOutputs = {};
let loadedDictionary;

const $ = (selector) => document.querySelector(selector);

function status(message, kind = "") {
  const element = $("#runtime-status");
  element.textContent = message;
  element.className = `runtime-status ${kind}`;
}

function applyTheme(theme) {
  const selectedTheme = theme === "cybersyn" ? "cybersyn" : "editorial";
  document.documentElement.dataset.theme = selectedTheme;
  $("#theme-select").value = selectedTheme;
}

function safeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(text) {
  return safeText(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderMarkdown(source) {
  const wrapper = document.createElement("article");
  wrapper.className = "markdown-cell";
  const lines = source.trim().split("\n");
  let list;
  const flushList = () => { if (list) { wrapper.append(list); list = null; } };
  const isTableDivider = (line) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
  const tableCells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.includes("|") && isTableDivider(lines[index + 1] || "")) {
      flushList();
      const table = document.createElement("table");
      const header = document.createElement("thead");
      const headerRow = document.createElement("tr");
      tableCells(line).forEach((cell) => {
        const heading = document.createElement("th");
        heading.innerHTML = inlineMarkdown(cell);
        headerRow.append(heading);
      });
      header.append(headerRow);
      table.append(header);
      const body = document.createElement("tbody");
      index += 2;
      while (index < lines.length && lines[index].includes("|")) {
        const row = document.createElement("tr");
        tableCells(lines[index]).forEach((cell) => {
          const value = document.createElement("td");
          value.innerHTML = inlineMarkdown(cell);
          row.append(value);
        });
        body.append(row);
        index += 1;
      }
      index -= 1;
      table.append(body);
      wrapper.append(table);
    } else if (/^---+$/.test(line.trim())) {
      flushList();
      wrapper.insertAdjacentHTML("beforeend", "<hr>");
    } else if (/^### /.test(line)) {
      flushList();
      wrapper.insertAdjacentHTML("beforeend", `<h3>${inlineMarkdown(line.slice(4))}</h3>`);
    } else if (/^## /.test(line)) {
      flushList();
      wrapper.insertAdjacentHTML("beforeend", `<h2>${inlineMarkdown(line.slice(3))}</h2>`);
    } else if (/^# /.test(line)) {
      flushList();
      wrapper.insertAdjacentHTML("beforeend", `<h1>${inlineMarkdown(line.slice(2))}</h1>`);
    } else if (/^[-*] /.test(line)) {
      if (!list) list = document.createElement("ul");
      const item = document.createElement("li");
      item.innerHTML = inlineMarkdown(line.slice(2));
      list.append(item);
    } else if (/^\d+\. /.test(line)) {
      if (!list) list = document.createElement("ol");
      const item = document.createElement("li");
      item.innerHTML = inlineMarkdown(line.replace(/^\d+\. /, ""));
      list.append(item);
    } else if (line.trim()) {
      flushList();
      const paragraph = document.createElement("p");
      paragraph.innerHTML = inlineMarkdown(line);
      wrapper.append(paragraph);
    }
  }
  flushList();
  return wrapper;
}

function sourceOf(cell) {
  return Array.isArray(cell.source) ? cell.source.join("") : cell.source || "";
}

function sourceLines(text) {
  return text.split(/(?<=\n)/);
}

function isAnswerCell(source) {
  return /^\*\*(Resposta da (Questão|Missão) .+):\*\*/.test(source.trim());
}

function answerLabel(source) {
  return (source.match(/^\*\*(Resposta da (?:Questão|Missão) .+):\*\*/) || ["", "Resposta"])[1];
}

function draftKey() {
  return `${STORAGE_KEY}:${currentExam}`;
}

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(draftKey()) || "{}"); } catch { return {}; }
}

function formValue(cellIndex) {
  return document.querySelector(`[data-cell-index="${cellIndex}"]`)?.value || "";
}

function saveDraft(showMessage = true) {
  const draft = { code: {}, answers: {}, savedAt: new Date().toISOString() };
  document.querySelectorAll("textarea[data-cell-index]").forEach((input) => {
    const bucket = input.dataset.kind === "answer" ? draft.answers : draft.code;
    bucket[input.dataset.cellIndex] = input.value;
  });
  localStorage.setItem(draftKey(), JSON.stringify(draft));
  if (showMessage) status("Rascunho salvo somente neste navegador.", "ready");
}

function makeAnswerCell(source, index, saved) {
  const cell = document.createElement("section");
  cell.className = "answer-cell";
  const label = document.createElement("label");
  label.htmlFor = `answer-${index}`;
  label.textContent = answerLabel(source);
  const textarea = document.createElement("textarea");
  textarea.id = `answer-${index}`;
  textarea.dataset.cellIndex = index;
  textarea.dataset.kind = "answer";
  textarea.placeholder = "Escreva sua resposta aqui.";
  textarea.value = saved.answers?.[index] || "";
  textarea.addEventListener("input", () => saveDraft(false));
  cell.append(label, textarea);
  return cell;
}

function makeCodeCell(source, index, ordinal, saved) {
  const cell = document.createElement("section");
  cell.className = "code-cell";
  const heading = document.createElement("div");
  heading.className = "code-head";
  const title = document.createElement("span");
  const questionLabel = source.match(/^#\s*((?:Questão|Missão)\s+\d+(?:\.\d+)?[^\n]*)/m)?.[1];
  title.textContent = questionLabel ? questionLabel.toUpperCase() : `CÉLULA DE CÓDIGO ${ordinal}`;
  const button = document.createElement("button");
  button.className = "button primary run-button";
  button.type = "button";
  button.textContent = "Executar";
  const textarea = document.createElement("textarea");
  textarea.className = "code-input";
  textarea.dataset.cellIndex = index;
  textarea.dataset.kind = "code";
  textarea.spellcheck = false;
  textarea.value = saved.code?.[index] ?? source;
  const output = document.createElement("div");
  output.className = "cell-output";
  button.addEventListener("click", () => runCell(index, textarea, output, button));
  textarea.addEventListener("input", () => saveDraft(false));
  heading.append(title, button);
  cell.append(heading, textarea, output);
  return cell;
}

function renderNotebook(notebook) {
  const saved = loadDraft();
  const container = $("#notebook");
  container.replaceChildren();
  cellOutputs = {};
  executionCounter = 0;
  let codeOrdinal = 0;
  notebook.cells.forEach((cell, index) => {
    const source = sourceOf(cell);
    if (cell.cell_type === "code") container.append(makeCodeCell(source, index, ++codeOrdinal, saved));
    else if (isAnswerCell(source)) container.append(makeAnswerCell(source, index, saved));
    else container.append(renderMarkdown(source));
  });
  typesetMath(container);
}

function typesetMath(element) {
  if (window.MathJax?.typesetPromise) return window.MathJax.typesetPromise([element]).catch(() => {});
  return Promise.resolve();
}

async function loadExam(examKey) {
  currentExam = examKey;
  const exam = EXAMS[examKey];
  const response = await fetch(asset(exam.file));
  if (!response.ok) throw new Error("Não foi possível abrir o arquivo da prova.");
  originalNotebook = await response.json();
  $("#exam-label").textContent = exam.title;
  loadedDictionary = undefined;
  $("#dictionary-menu").open = false;
  $("#dictionary-content").textContent = "Abra para consultar os campos e os limites da base.";
  renderNotebook(originalNotebook);
}

async function loadDictionary() {
  const exam = EXAMS[currentExam];
  if (loadedDictionary === exam.dictionary) return;
  const content = $("#dictionary-content");
  content.textContent = "Carregando dicionário…";
  const response = await fetch(asset(exam.dictionary));
  if (!response.ok) throw new Error("Não foi possível carregar o dicionário de dados.");
  const documentView = renderMarkdown(await response.text());
  documentView.className = "dictionary-document";
  content.replaceChildren(documentView);
  loadedDictionary = exam.dictionary;
  await typesetMath(content);
}

async function placeDataFiles() {
  pyodide.FS.mkdirTree("dados");
  await Promise.all(EXAMS[currentExam].dataFiles.map(async (filename) => {
    const response = await fetch(asset(`dados/${filename}`));
    if (!response.ok) throw new Error(`Não foi possível carregar dados/${filename}.`);
    pyodide.FS.writeFile(`dados/${filename}`, new Uint8Array(await response.arrayBuffer()));
  }));
}

async function prepareRuntime() {
  if (pyodide) return pyodide;
  if (runtimePromise) return runtimePromise;
  runtimePromise = (async () => {
    $("#prepare-button").disabled = true;
    status("Preparando o interpretador Python no navegador…");
    if (!window.loadPyodide) throw new Error("O carregador do Pyodide não ficou disponível. Verifique sua conexão e recarregue a página.");
    pyodide = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.3/full/" });
    status("Carregando NumPy, pandas, Matplotlib, Altair e scikit-learn. Na primeira vez isso pode levar alguns minutos…");
    await pyodide.loadPackage(["numpy", "pandas", "matplotlib", "altair", "scikit-learn"]);
    await pyodide.runPythonAsync("import matplotlib\nmatplotlib.use('AGG')\nimport numpy, pandas, matplotlib.pyplot, altair, sklearn");
    await placeDataFiles();
    status("Ambiente pronto: NumPy, pandas, Matplotlib, Altair e scikit-learn estão disponíveis.", "ready");
    $("#prepare-button").textContent = "Ambiente Python pronto";
    return pyodide;
  })().catch((error) => {
    runtimePromise = undefined;
    pyodide = undefined;
    $("#prepare-button").disabled = false;
    status(`Não foi possível iniciar o ambiente: ${error.message}`, "error");
    throw error;
  });
  return runtimePromise;
}

function makeOutputBlock(className = "output") {
  const block = document.createElement("pre");
  block.className = className;
  return block;
}

async function renderOutput(result, outputElement) {
  outputElement.replaceChildren();
  if (result.stdout || result.stderr) {
    const stream = makeOutputBlock(result.error ? "output error-output" : "output");
    stream.textContent = `${result.stdout || ""}${result.stderr || ""}`;
    outputElement.append(stream);
  }
  if (result.result_html) {
    const html = document.createElement("div");
    html.className = "output-result";
    html.innerHTML = result.result_html;
    outputElement.append(html);
  } else if (result.result_text) {
    const value = makeOutputBlock("output");
    value.textContent = result.result_text;
    outputElement.append(value);
  }
  for (const image of result.images || []) {
    const visual = document.createElement("img");
    visual.className = "output-image";
    visual.alt = "Gráfico gerado pela célula";
    visual.src = `data:image/png;base64,${image}`;
    outputElement.append(visual);
  }
  if (result.altair_spec) {
    const chart = document.createElement("div");
    chart.className = "chart";
    outputElement.append(chart);
    if (window.vegaEmbed) await window.vegaEmbed(chart, result.altair_spec, { actions: false });
  }
}

async function runCell(index, textarea, outputElement, button) {
  button.disabled = true;
  button.textContent = "Executando…";
  try {
    await prepareRuntime();
    pyodide.globals.set("student_code", textarea.value);
    const raw = await pyodide.runPythonAsync(`
import ast, base64, io, json, traceback
from contextlib import redirect_stdout, redirect_stderr
import matplotlib.pyplot as plt

_stdout, _stderr = io.StringIO(), io.StringIO()
_result, _error = None, None
try:
    _tree = ast.parse(student_code, mode="exec")
    with redirect_stdout(_stdout), redirect_stderr(_stderr):
        if _tree.body and isinstance(_tree.body[-1], ast.Expr):
            _prefix = ast.Module(body=_tree.body[:-1], type_ignores=[])
            ast.fix_missing_locations(_prefix)
            exec(compile(_prefix, "<celula>", "exec"), globals())
            _last = ast.Expression(_tree.body[-1].value)
            ast.fix_missing_locations(_last)
            _result = eval(compile(_last, "<celula>", "eval"), globals())
        else:
            exec(compile(_tree, "<celula>", "exec"), globals())
except Exception:
    _error = traceback.format_exc()

_images = []
for _number in plt.get_fignums():
    _buffer = io.BytesIO()
    plt.figure(_number).savefig(_buffer, format="png", dpi=140, bbox_inches="tight")
    _images.append(base64.b64encode(_buffer.getvalue()).decode("ascii"))
plt.close("all")

_result_html, _result_text, _altair_spec = None, None, None
if _result is not None:
    if _result.__class__.__module__.startswith("altair") and hasattr(_result, "to_dict"):
        _altair_spec = _result.to_dict()
    elif hasattr(_result, "_repr_html_"):
        _result_html = _result._repr_html_()
    else:
        _result_text = repr(_result)

json.dumps({
    "stdout": _stdout.getvalue(), "stderr": _stderr.getvalue(), "error": _error,
    "result_html": _result_html, "result_text": _result_text,
    "images": _images, "altair_spec": _altair_spec
}, default=str)
    `);
    const result = JSON.parse(raw);
    if (result.error) {
      result.stderr = `${result.stderr || ""}${result.error}`;
      result.error = true;
    }
    await renderOutput(result, outputElement);
    cellOutputs[index] = { ...result, execution_count: ++executionCounter };
    saveDraft(false);
  } catch (error) {
    const result = { stdout: "", stderr: String(error), error: true, images: [] };
    await renderOutput(result, outputElement);
    cellOutputs[index] = { ...result, execution_count: ++executionCounter };
  } finally {
    button.disabled = false;
    button.textContent = "Executar";
  }
}

function notebookOutputs(result) {
  if (!result) return [];
  const outputs = [];
  if (result.stdout || result.stderr) outputs.push({ output_type: "stream", name: result.stderr ? "stderr" : "stdout", text: `${result.stdout || ""}${result.stderr || ""}` });
  if (result.result_html || result.result_text || result.altair_spec) outputs.push({
    output_type: "execute_result", execution_count: result.execution_count,
    data: {
      "text/plain": result.result_text || "Gráfico Altair",
      ...(result.result_html ? { "text/html": result.result_html } : {}),
      ...(result.altair_spec ? { "application/vnd.vegalite.v5+json": result.altair_spec } : {}),
    }, metadata: {},
  });
  for (const image of result.images || []) outputs.push({ output_type: "display_data", data: { "image/png": image }, metadata: {} });
  return outputs;
}

function exportNotebook() {
  saveDraft(false);
  const name = $("#student-name").value.trim();
  const studentId = $("#student-id").value.trim();
  if (!name || !studentId) return alert("Preencha nome e matrícula antes de baixar a entrega.");
  const notebook = structuredClone(originalNotebook);
  notebook.metadata = {
    ...notebook.metadata,
    fgv_prova_browser: { nome: name, matricula: studentId, prova: currentExam, exportado_em: new Date().toISOString() },
  };
  notebook.cells = notebook.cells.map((cell, index) => {
    const source = sourceOf(cell);
    if (cell.cell_type === "code") {
      return { ...cell, source: sourceLines(formValue(index)), execution_count: cellOutputs[index]?.execution_count || null, outputs: notebookOutputs(cellOutputs[index]) };
    }
    if (isAnswerCell(source)) return { ...cell, source: sourceLines(`**${answerLabel(source)}:**\n\n${formValue(index)}\n`) };
    return cell;
  });
  const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: "application/x-ipynb+json" });
  const link = document.createElement("a");
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "aluno";
  link.href = URL.createObjectURL(blob);
  link.download = `prova-a1-${slug}-${studentId}.ipynb`;
  link.click();
  URL.revokeObjectURL(link.href);
  status("Entrega baixada. Abra o notebook no VS Code e confirme seus dados, respostas e resultados antes de enviá-lo.", "ready");
}

$("#student-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = $("#student-name").value.trim();
  const studentId = $("#student-id").value.trim();
  if (!name || !studentId) return;
  const examKey = $("#exam-select").value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, studentId, examKey }));
  $("#student-label").textContent = `${name} · Matrícula ${studentId}`;
  $("#identification").hidden = true;
  $("#workspace").hidden = false;
  try { await loadExam(examKey); } catch (error) { status(error.message, "error"); }
});

$("#prepare-button").addEventListener("click", () => prepareRuntime().catch(() => {}));
$("#save-button").addEventListener("click", () => saveDraft(true));
$("#export-button").addEventListener("click", exportNotebook);
$("#theme-select").addEventListener("change", (event) => applyTheme(event.currentTarget.value));
$("#dictionary-menu").addEventListener("toggle", (event) => {
  if (event.currentTarget.open) loadDictionary().catch((error) => {
    $("#dictionary-content").textContent = error.message;
  });
});

applyTheme(DEFAULT_THEME);

const identity = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; } })();
if (identity) {
  $("#student-name").value = identity.name || "";
  $("#student-id").value = identity.studentId || "";
  $("#exam-select").value = identity.examKey || "case";
}
