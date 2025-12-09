/**
 * Shared utility function to print entrance tally reports
 * @param {Object} params - Print parameters
 * @param {Object} params.event - Event object with details
 * @param {Array} params.entrances - Array of entrance records
 * @param {Function} params.formatDate - Function to format dates
 * @param {Function} params.formatCurrency - Function to format currency
 * @param {Number} params.totalEntrances - Total number of entrances
 * @param {Number} params.totalRevenue - Total revenue
 */
export const printEntranceReport = ({
  event,
  entrances = [],
  formatDate,
  formatCurrency,
  totalEntrances = 0,
  totalRevenue = 0
}) => {
  const printWindow = window.open('', '_blank')

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Entrance Tally Report - ${event?.eventName || 'Event'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .event-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .event-details {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .stats-section {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 15px;
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
          }
          .stat-box {
            text-align: center;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #333;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .table th,
          .table td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
          }
          .table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .count-column {
            width: 150px;
            text-align: center;
          }
          .date-column {
            width: 200px;
          }
          .revenue-column {
            width: 150px;
            text-align: right;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #333;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="event-title">Entrance Tally Report</div>
          <div class="event-details">${event?.eventName || 'Event'}</div>
          <div class="event-details">${formatDate(event?.date || new Date())}</div>
        </div>

        <div class="stats-section">
          <div class="stat-box">
            <div class="stat-label">Total Tally Records</div>
            <div class="stat-value">${entrances.length}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Total Entrances</div>
            <div class="stat-value">${totalEntrances}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Total Revenue</div>
            <div class="stat-value">${formatCurrency(totalRevenue)}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Capacity Status</div>
            <div class="stat-value">${totalEntrances} / ${event?.maxCapacity || 0}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Average per Tally</div>
            <div class="stat-value">${entrances.length > 0 ? Math.round(totalEntrances / entrances.length) : 0}</div>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th class="count-column">No. of Entrances</th>
              <th class="revenue-column">Revenue</th>
              <th class="date-column">Date Recorded</th>
            </tr>
          </thead>
          <tbody>
            ${entrances.map((entrance) => `
              <tr>
                <td class="count-column">${entrance.count} ${entrance.count === 1 ? 'entrance' : 'entrances'}</td>
                <td class="revenue-column">${formatCurrency((entrance.eventID?.entranceFee || event?.entranceFee || 0) * entrance.count)}</td>
                <td class="date-column">${formatDate(entrance.date)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated on ${formatDate(new Date())}</p>
        </div>
      </body>
    </html>
  `

  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

