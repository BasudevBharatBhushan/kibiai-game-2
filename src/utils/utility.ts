// src/utils/utility.ts
export function initializeA4Pagination(onPageChange: (page: number) => void) {
  // ---------- CONFIG ----------
  const LETTER_WIDTH = 816; // 8.5" @ 96 DPI
  const LETTER_HEIGHT = 500; // 11" @ 96 DPI
  const PAGE_PADDING = 38;
  const CONTENT_HEIGHT = LETTER_HEIGHT - PAGE_PADDING * 6;

  const SELECTORS = {
    topLevelSubsummary: ".dynamic-report > .subsummary.level-0",
    subsummaryHeader: ".subsummary-header",
    subsummaryDisplay: ".subsummary-display",
    totalsBlock: ".section-totals",
    table: "table.body-table",
    thead: "thead",
    tbody: "tbody",
  };

  let currentPageIndex = 1;
  let totalPages = 0;

  function clearOldPaginationMarks(root: Document | HTMLElement = document) {
    root.querySelectorAll("[data-page-index]").forEach((el) => {
      el.removeAttribute("data-page-index");
      (el as HTMLElement).style.removeProperty("display");
    });
    root.querySelectorAll(".thead-repeat").forEach((el) => el.remove());
  }
  clearOldPaginationMarks();

  const topLevelSubsummaries = Array.from(
    document.querySelectorAll<HTMLElement>(SELECTORS.topLevelSubsummary)
  );

  if (topLevelSubsummaries.length === 0) {
    const measureBox = makeMeasureBox();
    let currentHeight = 0;
    let pageIndex = 1;

    const bodyTables = Array.from(
      document.querySelectorAll<HTMLTableElement>(SELECTORS.table)
    );

    for (const table of bodyTables) {
      const tbody = table.querySelector<HTMLTableSectionElement>(
        SELECTORS.tbody
      );
      if (!tbody) continue;

      const rows = Array.from(
        tbody.querySelectorAll<HTMLTableRowElement>("tr")
      );
      for (const row of rows) {
        const rowH = measureHeight(row, measureBox);
        if (currentHeight + rowH > CONTENT_HEIGHT && currentHeight > 0) {
          pageIndex++;
          currentHeight = 0;
        }
        row.setAttribute("data-page-index", String(pageIndex));
        currentHeight += rowH;
      }
    }

    document.body.removeChild(measureBox);
    totalPages = pageIndex;

    // ✅ Ensure nav buttons exist & work
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");

    prevBtn?.addEventListener("click", () => {
      if (currentPageIndex > 1) {
        currentPageIndex--;
        updatePageDisplay();
      }
    });

    nextBtn?.addEventListener("click", () => {
      if (currentPageIndex < totalPages) {
        currentPageIndex++;
        updatePageDisplay();
      }
    });

    updatePageDisplay();
    return exposeAPI();
  }

  function makeMeasureBox(): HTMLElement {
    const box = document.createElement("div");
    box.className = "dynamic-report";
    box.style.visibility = "hidden";
    box.style.position = "absolute";
    box.style.left = "-99999px";
    box.style.top = "0";
    box.style.width = `${LETTER_WIDTH - PAGE_PADDING * 2}px`;
    box.style.padding = `${PAGE_PADDING}px`;
    document.body.appendChild(box);
    return box;
  }

  function measureHeight(
    node: Node | HTMLElement,
    measureBox: HTMLElement
  ): number {
    const clone =
      node instanceof HTMLElement
        ? (node.cloneNode(true) as HTMLElement)
        : document.createElement("div");
    measureBox.appendChild(clone);
    const h = (clone as HTMLElement).offsetHeight;
    measureBox.removeChild(clone);
    return h;
  }

  function calculatePages(): number {
    const measureBox = makeMeasureBox();
    let currentHeight = 0;
    let pageIndex = 1;

    function ensureFitsOrNewPage(nextHeight: number) {
      if (currentHeight + nextHeight > CONTENT_HEIGHT && currentHeight > 0) {
        pageIndex += 1;
        currentHeight = 0;
      }
    }

    function markForPage(el: HTMLElement, page: number) {
      el.setAttribute("data-page-index", String(page));
    }

    for (const sub of topLevelSubsummaries) {
      const headerEl = sub.querySelector<HTMLElement>(
        SELECTORS.subsummaryHeader
      );
      const displayEl = sub.querySelector<HTMLElement>(
        SELECTORS.subsummaryDisplay
      );

      let headerBlockHeight = 0;
      if (headerEl) headerBlockHeight += measureHeight(headerEl, measureBox);
      if (displayEl) headerBlockHeight += measureHeight(displayEl, measureBox);

      if (headerBlockHeight > 0) {
        ensureFitsOrNewPage(headerBlockHeight);
        if (headerEl) markForPage(headerEl, pageIndex);
        if (displayEl) markForPage(displayEl, pageIndex);
        currentHeight += headerBlockHeight;
      }

      const tables = Array.from(
        sub.querySelectorAll<HTMLTableElement>(SELECTORS.table)
      );
      for (const table of tables) {
        const tbody = table.querySelector<HTMLTableSectionElement>(
          SELECTORS.tbody
        );
        if (!tbody) continue;

        const rowNodes = Array.from(
          tbody.querySelectorAll<HTMLTableRowElement>("tr")
        );
        if (rowNodes.length === 0) continue;

        for (const row of rowNodes) {
          const rowH = measureHeight(row, measureBox);

          if (currentHeight + rowH > CONTENT_HEIGHT && currentHeight > 0) {
            pageIndex += 1;
            currentHeight = 0;
          }

          markForPage(row, pageIndex);
          currentHeight += rowH;
        }
      }

      const totals = Array.from(
        sub.querySelectorAll<HTMLElement>(SELECTORS.totalsBlock)
      );
      for (const t of totals) {
        const h = measureHeight(t, measureBox);
        ensureFitsOrNewPage(h);
        markForPage(t, pageIndex);
        currentHeight += h;
      }
    }

    const trailingSummary =
      document.querySelector<HTMLElement>(".trailing-summary");
    if (trailingSummary) {
      const h = measureHeight(trailingSummary, measureBox);
      ensureFitsOrNewPage(h);
      markForPage(trailingSummary, pageIndex);
      currentHeight += h;
    }

    document.body.removeChild(measureBox);
    return pageIndex;
  }

  function toggleVisibilityForPage(page: number) {
    const paginated = Array.from(
      document.querySelectorAll<HTMLElement>("[data-page-index]")
    );

    paginated.forEach((el) => {
      if (!el.dataset.originalDisplay) {
        el.dataset.originalDisplay = getComputedStyle(el).display || "block";
      }
    });

    paginated.forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });

    const showNow = paginated.filter(
      (el) => el.dataset.pageIndex === String(page)
    );
    showNow.forEach((el) => {
      const original = el.dataset.originalDisplay || "block";
      if (el.tagName === "TR") {
        (el as HTMLElement).style.display = "table-row";
      } else if (el.tagName === "TH" || el.tagName === "TD") {
        (el as HTMLElement).style.display = "table-cell";
      } else {
        (el as HTMLElement).style.display = original;
      }
    });

    const tables = Array.from(
      document.querySelectorAll<HTMLTableElement>("table.body-table")
    );
    tables.forEach((tbl) => {
      const visibleRows = tbl.querySelectorAll<HTMLElement>(
        `tr[data-page-index="${page}"]`
      );
      (tbl as HTMLElement).style.display =
        visibleRows.length > 0 ? "table" : "none";
    });

    const subs = Array.from(
      document.querySelectorAll<HTMLElement>(".subsummary")
    );
    subs.forEach((s) => {
      const hasVisible = s.querySelector<HTMLElement>(
        `[data-page-index="${page}"]`
      );
      (s as HTMLElement).style.display = hasVisible ? "block" : "none";
    });

    const report = document.querySelector<HTMLElement>(".dynamic-report");
    if (report) report.style.display = "block";
  }

  function updateTotalsUI(current: number, total: number) {
    const totalPagesEl = document.getElementById("totalPages");
    if (totalPagesEl) totalPagesEl.textContent = String(total);
    const currentPageEl = document.getElementById("currentPage");
    if (currentPageEl) currentPageEl.textContent = String(current);

    const prevBtn = document.getElementById(
      "prevPage"
    ) as HTMLButtonElement | null;
    const nextBtn = document.getElementById(
      "nextPage"
    ) as HTMLButtonElement | null;
    if (prevBtn) prevBtn.disabled = current <= 1;
    if (nextBtn) nextBtn.disabled = current >= total;
  }

  function updatePageDisplay() {
    toggleVisibilityForPage(currentPageIndex);
    onPageChange(currentPageIndex);
    updateTotalsUI(currentPageIndex, totalPages);
  }

  totalPages = calculatePages();
  updatePageDisplay();

  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  prevBtn?.addEventListener("click", () => {
    if (currentPageIndex > 1) {
      currentPageIndex--;
      updatePageDisplay();
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (currentPageIndex < totalPages) {
      currentPageIndex++;
      updatePageDisplay();
    }
  });

  let resizeTimeout: any;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const oldPage = currentPageIndex;
      clearOldPaginationMarks();
      totalPages = calculatePages();
      currentPageIndex = Math.min(oldPage, totalPages);
      updatePageDisplay();
    }, 200);
  });

  function exposeAPI() {
    return {
      getCurrentPage: () => currentPageIndex,
      getTotalPages: () => totalPages,
      goToPage: (pageNum: number) => {
        if (pageNum > 0 && pageNum <= totalPages) {
          currentPageIndex = pageNum;
          updatePageDisplay();
        }
      },
      recalculatePages: () => {
        const oldPage = currentPageIndex;
        clearOldPaginationMarks();
        totalPages = calculatePages();
        currentPageIndex = Math.min(oldPage, totalPages);
        updatePageDisplay();
      },
    };
  }

  return exposeAPI();
}
