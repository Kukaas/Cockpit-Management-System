/**
 * Shared utility function to print fight schedule reports
 * @param {Object} params - Print parameters
 * @param {Object} params.event - Event object with details
 * @param {Array} params.fightSchedules - Array of fight schedule records
 * @param {Function} params.formatDate - Function to format dates
 */
export const printFightSchedule = ({
  event,
  fightSchedules = [],
  formatDate
}) => {
  const printWindow = window.open('', '_blank')

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Fight Schedule - ${event?.eventName || 'Event'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            font-size: 12px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .event-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .event-details {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .table th,
          .table td {
            border: 1px solid #333;
            padding: 6px;
            text-align: left;
            font-size: 11px;
          }
          .table th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
          }
          .table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .fight-no {
            width: 60px;
            text-align: center;
            font-weight: bold;
          }
          .entry-name {
            width: 200px;
          }
          .weight {
            width: 80px;
            text-align: center;
          }
          .vs {
            width: 40px;
            text-align: center;
            font-weight: bold;
          }
          .footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #333;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            @page {
              margin: 1cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="event-title">${event?.eventName || 'Event'}</div>
          <div class="event-details">${formatDate(event?.date || new Date())}</div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th class="fight-no">NO.</th>
              <th class="entry-name">ENTRY NAME</th>
              <th class="weight">WT</th>
              <th class="vs">VS</th>
              <th class="entry-name">ENTRY NAME</th>
              <th class="weight">WT</th>
            </tr>
          </thead>
          <tbody>
            ${fightSchedules.map((fight) => {
    const participant1 = fight.participantsID?.[0]
    const participant2 = fight.participantsID?.[1]
    const cock1 = fight.cockProfileID?.[0]
    const cock2 = fight.cockProfileID?.[1]

    // Get entry name - show entry name (team name) instead of participant name
    const entryName1 = participant1?.entryName || participant1?.participantName || 'N/A'
    const entryName2 = participant2?.entryName || participant2?.participantName || 'N/A'

    // Get weight - show in grams if available
    const weight1 = cock1?.weight ? `${cock1.weight} g` : 'N/A'
    const weight2 = cock2?.weight ? `${cock2.weight} g` : 'N/A'

    return `
                <tr>
                  <td class="fight-no">${fight.fightNumber || ''}</td>
                  <td class="entry-name">${entryName1}</td>
                  <td class="weight">${weight1}</td>
                  <td class="vs">-</td>
                  <td class="entry-name">${entryName2}</td>
                  <td class="weight">${weight2}</td>
                </tr>
              `
  }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated on ${formatDate(new Date())}</p>
          <p>Total Fights: ${fightSchedules.length}</p>
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

