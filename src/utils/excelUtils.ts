import { DailyServiceLog, PersonnelLogItem, EquipmentLogItem } from '../types';
import { getDaysInMonth, formatDate } from './dateUtils';

/**
 * Excel generation utilities for Daily Service Logs
 */

/**
 * Generate Excel HTML content for a Daily Service Log
 * @param log - The daily service log
 * @param clientName - Name of the client
 * @returns HTML string for Excel export
 */
export const getDslExcelHtml = (log: DailyServiceLog, clientName: string): string => {
  const personnel = log.personnel || [];
  const equipmentUsed = log.equipmentUsed || [];
  const almansooriRep = log.almansooriRep || { name: '', position: '' };
  const mogApproval1 = log.mogApproval1 || { name: '', position: '' };
  const mogApproval2 = log.mogApproval2 || { name: '', position: '' };

  const daysInMonth = getDaysInMonth(log.date);

  const styles = {
    body: `font-family: Arial, sans-serif; font-size: 10pt;`,
    table: `border-collapse: collapse; width: 100%; border: 1px solid black;`,
    th: `border: 1px solid black; padding: 5px; text-align: center; font-weight: bold;`,
    td: `border: 1px solid black; padding: 5px; text-align: left;`,
    tdCenter: `border: 1px solid black; padding: 5px; text-align: center;`,
    header: `font-size: 16pt; font-weight: bold; text-align: center; border: none;`,
    subheader: `font-size: 12pt; font-weight: bold; text-align: center; border: none;`,
    sectionTitle: `font-weight: bold; background-color: #DDEBF7;`,
    yellowBg: `background-color: #FFFF00; border: 1px solid black; padding: 5px;`,
    lightBlueBg: `background-color: #DDEBF7;`,
    noBorder: `border: none; padding: 5px;`,
    approvalLabel: `border: none; text-align: left; padding: 2px 5px;`,
    approvalValue: `border: none; border-bottom: 1px solid black; text-align: left; padding: 2px 5px;`,
  };

  const renderLogGrid = (items: (PersonnelLogItem | EquipmentLogItem)[]) => {
    return items.map((item, index) => {
      const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
        const status = item.dailyStatus[i] || '';
        return `<td style="${styles.tdCenter}">${status}</td>`;
      }).join('');
      const daysCount = item.dailyStatus.filter(s => s === 'X' || s === 'T').length;
      
      let firstCells = '';
      if ('position' in item) { // Personnel
        firstCells = `<td style="${styles.tdCenter}">${index + 1}</td><td style="${styles.td}">${item.name}</td><td style="${styles.td}">${item.position}</td>`;
      } else { // Equipment
        firstCells = `<td style="${styles.tdCenter}">${index + 1}</td><td style="${styles.td}">${item.name}</td><td style="${styles.tdCenter}">${item.quantity}</td>`;
      }

      return `<tr>${firstCells}${dayCells}<td style="${styles.tdCenter}">${daysCount}</td></tr>`;
    }).join('');
  };

  const dayHeaders = Array.from({length: daysInMonth}, (_, i) => `<th style="${styles.th}${styles.lightBlueBg}">${i+1}</th>`).join('');
  const colspan = 4 + daysInMonth;
  const dateDisplay = formatDate(log.date);

  return `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
  <body style="${styles.body}">
  <table style="${styles.table}">
      <tr>
          <td colspan="5" style="${styles.noBorder}"><img src="https://i.imgur.com/gX1t1q4.png" alt="logo" width="200"></td>
          <td colspan="${colspan - 10}" style="${styles.header}">DAILY SERVICES LOG</td>
          <td colspan="5" style="${styles.noBorder}"><img src="https://i.imgur.com/8aR8qk7.png" alt="vision" width="80"></td>
      </tr>
      <tr><td colspan="${colspan}" style="${styles.subheader}">N: ${log.logNumber}</td></tr>
      <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
      <tr style="${styles.yellowBg}">
          <td style="${styles.td}"><b>Client :</b></td><td colspan="${Math.floor((colspan-4)/2)}" style="${styles.td}">${clientName}</td>
          <td colspan="1"></td>
          <td style="${styles.td}"><b>Contract :</b></td><td colspan="${Math.ceil((colspan-4)/2)}" style="${styles.td}">${log.contract}</td>
      </tr>
      <tr style="${styles.yellowBg}">
          <td style="${styles.td}"><b>Field :</b></td><td colspan="${Math.floor((colspan-4)/2)}" style="${styles.td}">${log.field}</td>
          <td colspan="1"></td>
          <td style="${styles.td}"><b>Job No :</b></td><td colspan="${Math.ceil((colspan-4)/2)}" style="${styles.td}">${log.jobNo}</td>
      </tr>
      <tr style="${styles.yellowBg}">
          <td style="${styles.td}"><b>Well :</b></td><td colspan="${Math.floor((colspan-4)/2)}" style="${styles.td}">${log.well}</td>
          <td colspan="1"></td>
          <td style="${styles.td}"><b>Date :</b></td><td colspan="${Math.ceil((colspan-4)/2)}" style="${styles.td}">${dateDisplay}</td>
      </tr>
      <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
      
      <!-- Personnel Section -->
      <tr><th style="${styles.th}${styles.sectionTitle}" colspan="${colspan}">Personnel</th></tr>
      <tr style="${styles.lightBlueBg}">
          <th style="${styles.th}" width="30"></th>
          <th style="${styles.th}" width="200">Name</th>
          <th style="${styles.th}" width="150">Position</th>
          ${dayHeaders}
          <th style="${styles.th}" width="50">Days</th>
      </tr>
      ${renderLogGrid(personnel)}

      <!-- Equipment Section -->
      <tr><th style="${styles.th}${styles.sectionTitle}" colspan="${colspan}">EQUIPMENT</th></tr>
      <tr style="${styles.lightBlueBg}">
          <th style="${styles.th}"></th>
          <th style="${styles.th}">EQUIPMENT</th>
          <th style="${styles.th}">Qty</th>
          ${dayHeaders}
          <th style="${styles.th}">Days</th>
      </tr>
      ${renderLogGrid(equipmentUsed)}

      <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
      <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
      
      <!-- Approvals -->
      <tr>
          <td colspan="${Math.floor(colspan/3)}" style="font-weight: bold; text-align:center; ${styles.noBorder}">Almansoori Representative</td>
          <td colspan="${Math.ceil(colspan/3)}" style="font-weight: bold; text-align:center; ${styles.noBorder}">${clientName} Approval</td>
          <td colspan="${Math.floor(colspan/3)}" style="font-weight: bold; text-align:center; ${styles.noBorder}">${clientName} Approval</td>
      </tr>
      <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
      <tr>
          <td style="${styles.approvalLabel}">Name :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}">${almansooriRep.name}</td><td style="${styles.noBorder}" colspan="1"></td>
          <td style="${styles.approvalLabel}">Name :</td><td colspan="${Math.ceil(colspan/3) - 2}" style="${styles.approvalValue}">${mogApproval1.name}</td><td style="${styles.noBorder}" colspan="1"></td>
          <td style="${styles.approvalLabel}">Name :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}">${mogApproval2.name}</td>
      </tr>
       <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
      <tr>
          <td style="${styles.approvalLabel}">Position :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}">${almansooriRep.position}</td><td style="${styles.noBorder}" colspan="1"></td>
          <td style="${styles.approvalLabel}">Position :</td><td colspan="${Math.ceil(colspan/3) - 2}" style="${styles.approvalValue}">${mogApproval1.position}</td><td style="${styles.noBorder}" colspan="1"></td>
          <td style="${styles.approvalLabel}">Position :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}">${mogApproval2.position}</td>
      </tr>
       <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
      <tr>
          <td style="${styles.approvalLabel}">Date :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}"></td><td style="${styles.noBorder}" colspan="1"></td>
          <td style="${styles.approvalLabel}">Date :</td><td colspan="${Math.ceil(colspan/3) - 2}" style="${styles.approvalValue}"></td><td style="${styles.noBorder}" colspan="1"></td>
          <td style="${styles.approvalLabel}">Date :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}"></td>
      </tr>
       <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
      <tr>
          <td style="${styles.approvalLabel}">Signature :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}"></td><td style="${styles.noBorder}" colspan="1"></td>
          <td style="${styles.approvalLabel}">Signature :</td><td colspan="${Math.ceil(colspan/3) - 2}" style="${styles.approvalValue}"></td><td style="${styles.noBorder}" colspan="1"></td>
          <td style="${styles.approvalLabel}">Signature :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}"></td>
      </tr>
  </table>
  </body></html>
  `;
};

/**
 * Download Excel file from HTML content
 * @param html - HTML content for Excel
 * @param filename - Name of the file to download
 */
export const downloadExcel = (html: string, filename: string): void => {
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
