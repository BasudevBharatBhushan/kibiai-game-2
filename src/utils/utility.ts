// src/utils/utility.ts
export function initializeA4Pagination() {
  const A4_WIDTH = 794; // ~210mm at 96 DPI
  const A4_HEIGHT = 1123; // ~297mm at 96 DPI
  const PAGE_PADDING = 38; // ~10mm padding
  const CONTENT_HEIGHT = A4_HEIGHT - PAGE_PADDING * 6;

  let currentPageIndex = 1;
  let totalPages = 0;

  const topLevelSubsummaries = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".dynamic-report > .subsummary.level-0"
    )
  );

  function calculatePages() {
    const tempContainer = document.createElement("div");
    tempContainer.className = "dynamic-report";
    tempContainer.style.visibility = "hidden";
    tempContainer.style.position = "absolute";
    tempContainer.style.width = `${A4_WIDTH - PAGE_PADDING * 2}px`;
    tempContainer.style.padding = `${PAGE_PADDING}px`;
    document.body.appendChild(tempContainer);

    const pageBreaks: HTMLElement[][] = [];
    let currentHeight = 0;
    let currentPage: HTMLElement[] = [];

    topLevelSubsummaries.forEach((summary) => {
      const clone = summary.cloneNode(true) as HTMLElement;
      tempContainer.appendChild(clone);
      const elementHeight = clone.offsetHeight;
      tempContainer.removeChild(clone);

      if (
        currentHeight + elementHeight > CONTENT_HEIGHT &&
        currentPage.length > 0
      ) {
        pageBreaks.push([...currentPage]);
        currentPage = [summary];
        currentHeight = elementHeight;
      } else {
        currentPage.push(summary);
        currentHeight += elementHeight;
      }
    });

    if (currentPage.length > 0) {
      pageBreaks.push(currentPage);
    }

    document.body.removeChild(tempContainer);

    return pageBreaks;
  }

  const pages = calculatePages();
  totalPages = pages.length;
  const totalPagesEl = document.getElementById("totalPages");
  if (totalPagesEl) totalPagesEl.textContent = totalPages.toString();

  function updatePageDisplay() {
    topLevelSubsummaries.forEach((summary) => {
      summary.style.display = "none";
    });

    if (pages[currentPageIndex - 1]) {
      pages[currentPageIndex - 1].forEach((summary) => {
        summary.style.display = "block";
      });
    }

    const trailingSummary =
      document.querySelector<HTMLElement>(".trailing-summary");
    if (trailingSummary) {
      trailingSummary.style.display =
        currentPageIndex === totalPages ? "block" : "none";
    }

    const currentPageEl = document.getElementById("currentPage");
    if (currentPageEl) currentPageEl.textContent = currentPageIndex.toString();

    const prevBtn = document.getElementById("prevPage") as HTMLButtonElement;
    const nextBtn = document.getElementById("nextPage") as HTMLButtonElement;

    if (prevBtn) prevBtn.disabled = currentPageIndex === 1;
    if (nextBtn) nextBtn.disabled = currentPageIndex === totalPages;
  }

  document.getElementById("prevPage")?.addEventListener("click", () => {
    if (currentPageIndex > 1) {
      currentPageIndex--;
      updatePageDisplay();
    }
  });

  document.getElementById("nextPage")?.addEventListener("click", () => {
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
      pages.length = 0;
      pages.push(...calculatePages());
      totalPages = pages.length;
      const totalPagesEl = document.getElementById("totalPages");
      if (totalPagesEl) totalPagesEl.textContent = totalPages.toString();
      currentPageIndex = Math.min(oldPage, totalPages);
      updatePageDisplay();
    }, 200);
  });

  updatePageDisplay();

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
      pages.length = 0;
      pages.push(...calculatePages());
      totalPages = pages.length;
      const totalPagesEl = document.getElementById("totalPages");
      if (totalPagesEl) totalPagesEl.textContent = totalPages.toString();
      currentPageIndex = Math.min(oldPage, totalPages);
      updatePageDisplay();
    },
  };
}
