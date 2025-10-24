import React, { useEffect, useState } from "react";
import "../../assets/styles/dynamicreport.css";
import Logo from "../../assets/images/kibiai.png";
import { initializeA4Pagination } from "../../utils/utility";

interface DynamicReportProps {
  jsonData: any[];
}

const DynamicReport: React.FC<DynamicReportProps> = ({ jsonData }) => {
  const [reportHtml, setReportHtml] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pagination, setPagination] = useState<any>(null);

  console.log(setCurrentPage, pagination);

  useEffect(() => {
    if (jsonData?.length > 0) {
      const html = generateDynamicReport(jsonData);
      setReportHtml(html);
    }
  }, [jsonData]);

  useEffect(() => {
    if (reportHtml) {
      const container = document.getElementById("dynamic-report");
      if (container) container.innerHTML = reportHtml;
    }
  }, [reportHtml]);

  useEffect(() => {
    if (reportHtml) {
      const paginationInstance = initializeA4Pagination();
      setPagination(paginationInstance);
      setTotalPages(paginationInstance.getTotalPages());
    }
  }, [reportHtml]);

  return (
    <div id="main-div">
      {/* Floating Pagination */}
      <div className="floating-pagination">
        <button
          className="pagination-button"
          id="prevPage"
          disabled={currentPage === 1}
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        <span className="pagination-info">
          {currentPage} / {totalPages}
        </span>

        <button
          className="pagination-button"
          id="nextPage"
          disabled={currentPage === totalPages}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div id="dynamic-report"></div>
    </div>
  );
};

export default DynamicReport;

// ================== MAIN FUNCTION ==================
function generateDynamicReport(jsonData: any[]): string {
  let tableData = "";
  let tableData_ = "";
  const prefixMap: Record<string, string> = {};
  let fieldPrefix: Record<string, string> = {};
  let fieldSuffix: Record<string, string> = {};
  let bodySortKeys: string[] = [];
  let bodyFieldOrder: string[] = [];
  let bodySortOrder: any[] = [];

  console.log(bodySortOrder);

  function multiSort(array: any[], sortKeys: string[]) {
    return array.sort((a, b) => {
      for (let key of sortKeys) {
        const trimmedKey = key.trim();
        if (a[trimmedKey] < b[trimmedKey]) return -1;
        if (a[trimmedKey] > b[trimmedKey]) return 1;
      }
      return 0;
    });
  }

  function groupBy(array: any[], key: string) {
    const trimmedKey = key.trim();
    return array.reduce((result: any, currentValue: any) => {
      (result[currentValue[trimmedKey]] =
        result[currentValue[trimmedKey]] || []).push(currentValue);
      return result;
    }, {});
  }

  function generateTitleHeader(titleHeader: any) {
    return `
      <div className="title-header">
        <img src="${Logo}" alt="logo" style="width:100px">
        <div>
          <h1>${titleHeader.MainHeading}</h1>
         <h2>KiBiz Systems • 800-946-2854 • www.kibizsystems.com</h2>
      </div>
      </div>
    `;
  }

  function generateNestedSubsummaries(
    data: any[],
    subsummaries: any[],
    level = 0,
    key = ""
  ): string {
    tableData = tableData ? tableData + "_" + key : key;

    if (level >= subsummaries.length) {
      tableData_ = tableData;
      tableData = "";
      return generateBodyTable(data, bodySortKeys, tableData_);
    }

    const currentSubsummary = subsummaries[level];
    const groupField = currentSubsummary.SubsummaryFields[0];
    const groupedData = groupBy(data, groupField);
    const sortOrder = (currentSubsummary.SortOrder || "asc").toLowerCase();
    const groupedEntries = Object.entries(groupedData).sort(
      ([aKey], [bKey]) => {
        let result;
        if (!isNaN(Number(aKey)) && !isNaN(Number(bKey))) {
          result = Number(aKey) - Number(bKey);
        } else {
          result = String(aKey).localeCompare(String(bKey));
        }
        return sortOrder === "asc" ? result : -result;
      }
    );

    const totals = currentSubsummary.SubsummaryTotal || [];
    const displayFields = currentSubsummary.SubsummaryDisplay || [];

    let html = "";

    for (let [groupValue, group] of groupedEntries as [string, any[]][]) {
      const groupFieldPrefix =
        prefixMap[groupField] || fieldPrefix[groupField.trim()] || "";
      const groupFieldSuffix = fieldSuffix[groupField.trim()] || "";

      let displayInfo = "";
      displayFields.forEach((field: string) => {
        const trimmedField = field.trim();
        const prefix = prefixMap[field] || fieldPrefix[trimmedField] || "";
        const suffix = fieldSuffix[trimmedField] || "";
        const value = group[0]?.[field] || "";
        displayInfo += `<span className="display-item"><span className="display-label">${field}:</span> <span className="display-value">${prefix}${value}${suffix}</span></span>`;
      });

      let groupTotals: Record<string, number> = {};
      totals.forEach((field: string) => {
        const sum = group.reduce((acc, item) => {
          const value = parseFloat(item[field]);
          return acc + (isNaN(value) ? 0 : value);
        }, 0);
        groupTotals[field] = sum;
      });

      html += `
        <div className="subsummary level-${level}">
          <h${level + 3} className="subsummary-header">
            <span className="field-name">${groupField.trim()}</span>: ${groupFieldPrefix}${
              groupValue || "N/A"
            }${groupFieldSuffix}
          </h${level + 3}>
          ${
            displayInfo
              ? `<div className="subsummary-display">${displayInfo}</div>`
              : ""
          }
          <div className="subsummary-content">
            ${generateNestedSubsummaries(
              group,
              subsummaries,
              level + 1,
              groupField.trim() + "-" + groupValue
            )}
            ${
              totals.length > 0 ? generateSectionTotals(groupTotals, level) : ""
            }
          </div>
        </div>
      `;
    }

    return html;
  }

  function generateSectionTotals(
    totals: Record<string, number>,
    level: number
  ) {
    console.log(level);
    let html =
      '<div className="section-totals"><div className="totals-title">Totals</div><div className="totals-grid">';
    for (let [field, total] of Object.entries(totals)) {
      const formattedTotal = total.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      html += `
        <div className="total-item">
          <span className="total-label">Total ${field}:</span>
          <span className="total-value">${formattedTotal}</span>
        </div>
      `;
    }
    html += "</div></div>";
    return html;
  }

  // ✅ Added back — Trailing Grand Summary
  function generateTrailingSummary(summaryFields: string[], bodyData: any[]) {
    let totals: Record<string, number> = {};
    if (!summaryFields || summaryFields.length === 0) return "";

    summaryFields.forEach((field) => {
      const trimmedField = field.trim();
      totals[trimmedField] = bodyData.reduce(
        (sum, row) => sum + (parseFloat(row[trimmedField]) || 0),
        0
      );
    });

    let html = '<div className="trailing-summary"><h3>Grand Total</h3><table>';
    for (let [field, total] of Object.entries(totals)) {
      const formattedTotal = total.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      html += `<tr><td>Total ${field}</td><td>${formattedTotal}</td></tr>`;
    }
    html += "</table></div>";
    return html;
  }

  function generateBodyTable(
    data: any[],
    sortKeys: string[],
    tableData_: string
  ) {
    const sortedData = multiSort(data, sortKeys);
    const displayFields =
      bodyFieldOrder && bodyFieldOrder.length > 0
        ? bodyFieldOrder
        : Object.keys(data[0]) || [];

    let html = `<table className="body-table" data-table-heading="${tableData_}"><thead><tr>`;
    displayFields.forEach((field) => {
      html += `<th>${field.trim()}</th>`;
    });
    html += "</tr></thead><tbody>";

    sortedData.forEach((row) => {
      html += "<tr>";
      displayFields.forEach((field) => {
        html += `<td>${row[field] || ""}</td>`;
      });
      html += "</tr>";
    });

    html += "</tbody></table>";
    return html;
  }

  let reportHtml =
    '<div className="dynamic-report" id="dynamic-printable-report">';
  reportHtml += `<div className="current-date">${new Date().toLocaleDateString()}</div>`;

  const titleHeader = jsonData.find((item) => "TitleHeader" in item);
  if (titleHeader) reportHtml += generateTitleHeader(titleHeader.TitleHeader);

  const bodyData = jsonData.find((item) => "Body" in item)?.Body?.BodyField;
  bodySortKeys = jsonData.find((item) => "Body" in item)?.Body?.Sorting || [];
  bodyFieldOrder =
    jsonData.find((item) => "Body" in item)?.Body?.BodyFieldOrder || [];

  if (bodyData) {
    const subsummaries = jsonData
      .filter((item) => "Subsummary" in item)
      .map((item) => item.Subsummary);
    reportHtml += generateNestedSubsummaries(bodyData, subsummaries);

    const trailingSummary = jsonData.find(
      (item) => "TrailingGrandSummary" in item
    );
    if (trailingSummary) {
      reportHtml += generateTrailingSummary(
        trailingSummary.TrailingGrandSummary.TrailingGrandSummary,
        bodyData
      );
    }
  }

  reportHtml += "</div>";
  reportHtml = reportHtml.replace(/className=/g, "class=");
  return reportHtml;
}
