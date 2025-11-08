import type { Transaction } from "@/lib/types";
import { format } from "date-fns";

// Function to export data to CSV
export const exportToCsv = (data: Transaction[], filename: string) => {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
  const rows = data.map(tx => [
    format(new Date(tx.date), 'yyyy-MM-dd'),
    tx.type,
    tx.category,
    tx.amount.toFixed(2),
    `"${tx.description.replace(/"/g, '""')}"`
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to export data to a simple text format (for PDF copy-paste)
export const exportToTxt = (data: Transaction[], filename: string, title: string) => {
  let report = `${title}\n`;
  report += `Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}\n`;
  report += '-----------------------------------------------------------\n\n';

  data.forEach(tx => {
    report += `Date:        ${format(new Date(tx.date), 'yyyy-MM-dd')}\n`;
    report += `Type:        ${tx.type}\n`;
    report += `Category:    ${tx.category}\n`;
    report += `Amount:      $${tx.amount.toFixed(2)}\n`;
    report += `Description: ${tx.description}\n`;
    report += '-----------------------------------------------------------\n';
  });

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
