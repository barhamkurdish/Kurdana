import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/pdf.min.mjs";

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);

  const state = {
    pdfDoc: null,
    pageNumber: 1,
    scale: 1,
    rendering: false,
    pendingPage: null,
    fitMode: true
  };

  const modal = $("#readerModal");
  const canvas = $("#pdfCanvas");
  const ctx = canvas?.getContext("2d");
  const empty = $("#readerEmpty");
  const loading = $("#readerLoading");
  const pageCurrent = $("#readerPageCurrent");
  const pageTotal = $("#readerPageTotal");
  const zoomValue = $("#readerZoomValue");
  const fileName = $("#readerFileName");
  const prevBtn = $("#readerPrev");
  const nextBtn = $("#readerNext");

  if (!modal || !canvas || !ctx) return;

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/pdf.worker.min.mjs";

  const setLoading = (show) => {
    loading.hidden = !show;
  };

  const updateControls = () => {
    const total = state.pdfDoc?.numPages || 0;
    pageCurrent.textContent = total ? String(state.pageNumber) : "0";
    pageTotal.textContent = String(total);
    zoomValue.textContent = `${Math.round(state.scale * 100)}%`;
    prevBtn.disabled = !state.pdfDoc || state.pageNumber <= 1;
    nextBtn.disabled = !state.pdfDoc || state.pageNumber >= total;
  };

  const open = (label = "") => {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    if (label) fileName.textContent = label;
    updateControls();
  };

  const close = () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal-layer.show")) {
      document.body.classList.remove("modal-open");
    }
  };

  const getFitScale = async (page) => {
    const container = document.querySelector(".reader-stage");
    const baseViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(280, container.clientWidth - 70);
    const availableHeight = Math.max(300, container.clientHeight - 44);
    const widthScale = availableWidth / baseViewport.width;
    const heightScale = availableHeight / baseViewport.height;
    return Math.min(widthScale, heightScale, 2.2);
  };

  const renderPage = async (num) => {
    if (!state.pdfDoc) return;
    state.rendering = true;
    setLoading(true);

    try {
      const page = await state.pdfDoc.getPage(num);
      let scale = state.scale;

      if (state.fitMode) {
        scale = await getFitScale(page);
        state.scale = scale;
      }

      const viewport = page.getViewport({ scale });
      const outputScale = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      canvas.style.display = "block";

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

      await page.render({
        canvasContext: ctx,
        viewport,
        transform
      }).promise;

      empty.style.display = "none";
      pageCurrent.textContent = String(num);
      pageTotal.textContent = String(state.pdfDoc.numPages);
      updateControls();
    } catch (error) {
      console.error("Kurdana Reader:", error);
      const core = window.KurdanaCore;
      core?.toast?.("خوێندنەوەی PDF سەرکەوتوو نەبوو.");
    } finally {
      state.rendering = false;
      setLoading(false);

      if (state.pendingPage !== null) {
        const pending = state.pendingPage;
        state.pendingPage = null;
        renderPage(pending);
      }
    }
  };

  const queueRender = (num) => {
    if (state.rendering) {
      state.pendingPage = num;
    } else {
      renderPage(num);
    }
  };

  const showPage = (delta) => {
    if (!state.pdfDoc) return;
    const next = state.pageNumber + delta;
    if (next < 1 || next > state.pdfDoc.numPages) return;
    state.pageNumber = next;
    state.fitMode = true;
    queueRender(state.pageNumber);
    updateControls();
  };

  const zoom = (delta) => {
    if (!state.pdfDoc) return;
    state.fitMode = false;
    const next = Math.max(.5, Math.min(3, state.scale + delta));
    state.scale = Number(next.toFixed(2));
    queueRender(state.pageNumber);
    updateControls();
  };

  const fit = () => {
    if (!state.pdfDoc) return;
    state.fitMode = true;
    queueRender(state.pageNumber);
  };

  const loadPdf = async (source, name = "PDF") => {
    open(name);
    setLoading(true);

    try {
      const loadingTask = pdfjsLib.getDocument(source);
      state.pdfDoc = await loadingTask.promise;
      state.pageNumber = 1;
      state.scale = 1;
      state.fitMode = true;
      empty.style.display = "none";
      await renderPage(state.pageNumber);
    } catch (error) {
      console.error("Kurdana PDF load error:", error);
      fileName.textContent = "هەڵە لە کردنەوەی PDF";
      state.pdfDoc = null;
      canvas.style.display = "none";
      empty.style.display = "block";
      const core = window.KurdanaCore;
      core?.toast?.("ئەم PDF ـە نەکرایەوە. دڵنیابە کە فایلەکە دروستە.");
    } finally {
      setLoading(false);
      updateControls();
    }
  };

  const loadFile = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      window.KurdanaCore?.toast?.("تەنیا فایلەکانی PDF وەردەگیرێن.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      loadPdf({ data: new Uint8Array(reader.result) }, file.name);
    };
    reader.readAsArrayBuffer(file);
  };

  $("#readerClose")?.addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });

  $("#readerPrev")?.addEventListener("click", () => showPage(-1));
  $("#readerNext")?.addEventListener("click", () => showPage(1));
  $("#readerZoomOut")?.addEventListener("click", () => zoom(-.15));
  $("#readerZoomIn")?.addEventListener("click", () => zoom(.15));
  $("#readerFit")?.addEventListener("click", fit);

  $("#readerZoomValue")?.addEventListener("click", fit);

  $("#readerFileInput")?.addEventListener("change", (event) => {
    loadFile(event.target.files?.[0]);
  });

  $("#readerEmptyFileInput")?.addEventListener("change", (event) => {
    loadFile(event.target.files?.[0]);
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("show") || !state.pdfDoc) return;
    if (event.key === "ArrowLeft") showPage(1);
    if (event.key === "ArrowRight") showPage(-1);
    if (event.key === "+" || event.key === "=") zoom(.15);
    if (event.key === "-") zoom(-.15);
  });

  // Any book/reader button opens the reader. Since the current mock book data
  // has no real PDFs, the reader starts in file-select mode.
  const openReaderButtons = () => {
    document.querySelectorAll(".reader-launch").forEach((button) => {
      if (button.dataset.readerBound === "1") return;
      button.dataset.readerBound = "1";
      button.addEventListener("click", () => open("کتێبی Kurdana"));
    });
  };

  openReaderButtons();

  window.KurdanaReader = {
    open,
    close,
    loadFile,
    loadPdf,
    next: () => showPage(1),
    previous: () => showPage(-1),
    zoomIn: () => zoom(.15),
    zoomOut: () => zoom(-.15),
    fit
  };
})();
