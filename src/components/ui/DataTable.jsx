import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

/**
 * Reusable DataTable component with sorting
 */
export default function DataTable({
  columns,
  data,
  emptyMessage = "No data available",
  emptyIcon: EmptyIcon,
  onRowClick,
  loading = false,
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal || "").toLowerCase();
    const bStr = String(bVal || "").toLowerCase();
    return sortDirection === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ padding: "3rem" }}
      >
        <div className="loading-spinner" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="empty-state">
        {EmptyIcon && <EmptyIcon size={48} className="empty-state-icon" />}
        <div className="empty-state-title">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                style={{ cursor: col.sortable ? "pointer" : "default" }}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable &&
                    sortColumn === col.key &&
                    (sortDirection === "asc" ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    ))}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick?.(row)}
              style={{ cursor: onRowClick ? "pointer" : "default" }}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
