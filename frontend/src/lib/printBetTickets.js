/**
 * Utility function to print bet tickets
 * @param {Object} params - Print parameters
 * @param {Object} params.event - Event object with details
 * @param {Object} params.fight - Fight object with details
 * @param {Array} params.bets - Array of bet objects { participantName, amount, position, timestamp }
 * @param {Function} params.formatCurrency - Function to format currency
 * @param {Function} params.formatDate - Function to format dates
 */
export const printBetTickets = ({
    event,
    fight,
    bets = [],
    formatCurrency,
    formatDate
}) => {
    // Create an invisible iframe for printing
    const iframeId = 'print-bet-ticket-frame'
    let printFrame = document.getElementById(iframeId)

    if (printFrame) {
        document.body.removeChild(printFrame)
    }

    printFrame = document.createElement('iframe')
    printFrame.id = iframeId
    printFrame.style.position = 'fixed'
    printFrame.style.right = '0'
    printFrame.style.bottom = '0'
    printFrame.style.width = '0'
    printFrame.style.height = '0'
    printFrame.style.border = '0'
    document.body.appendChild(printFrame)

    const printWindow = printFrame.contentWindow

    // Generate ticket HTML for each bet
    const ticketsHTML = bets.map((bet, index) => `
        <div class="ticket" style="page-break-after: ${index < bets.length - 1 ? 'always' : 'auto'};">
            <div class="ticket-header">
                <h1>BET TICKET</h1>
                <div class="subtitle">${event?.eventName || 'Event'}</div>
            </div>

            <div class="ticket-body">
                <div class="info-row">
                    <span class="label">Fight No:</span>
                    <span class="value fight-number">#${fight?.fightNumber || 'N/A'}</span>
                </div>

                <div class="info-row">
                    <span class="label">Date:</span>
                    <span class="value">${formatDate(new Date())}</span>
                </div>

                <div class="divider"></div>

                <div class="bet-info">
                    <div class="info-row">
                        <span class="label">Side:</span>
                        <span class="value position-badge ${bet.position === 'Meron' ? 'position-meron' : bet.position === 'Wala' ? 'position-wala' : ''}">
                            ${bet.position || bet.participantName}
                        </span>
                    </div>

                    <div class="info-row highlight">
                        <span class="label">Amount:</span>
                        <span class="value amount">${formatCurrency(bet.betAmount)}</span>
                    </div>
                </div>
            </div>

            <div class="ticket-footer">
                <p>Valid only for Fight #${fight?.fightNumber}</p>
                <p class="print-time">Printed: ${formatDate(new Date())}</p>
            </div>
        </div>
    `).join('')

    const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bet Tickets - Fight #${fight?.fightNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Courier New', monospace;
            background-color: #f5f5f5;
            padding: 20px;
          }

          .ticket {
            width: 300px;
            margin: 0 auto 20px;
            background: white;
            border: 2px dashed #333;
            padding: 15px;
          }

          .ticket-header {
            text-align: center;
            border-bottom: 2px dashed #333;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }

          .ticket-header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .subtitle {
            font-size: 12px;
            color: #555;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .label {
            font-weight: bold;
            font-size: 14px;
            color: #555;
          }

          .value {
            font-weight: bold;
            font-size: 14px;
            text-align: right;
          }

          .fight-number {
            font-size: 18px;
            color: #000;
          }

          .divider {
            border-top: 1px dashed #ccc;
            margin: 10px 0;
          }

          .highlight {
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #eee;
          }

          .amount {
            font-size: 24px;
            color: #10b981;
          }

          .position-badge {
            padding: 4px 8px;
            border-radius: 4px;
            text-transform: uppercase;
          }

          .position-meron {
            background-color: #fee2e2;
            color: #991b1b;
          }

          .position-wala {
            background-color: #dbeafe;
            color: #1e40af;
          }

          .ticket-footer {
            border-top: 2px dashed #333;
            padding-top: 10px;
            margin-top: 15px;
            text-align: center;
            font-size: 10px;
            color: #666;
          }

          .print-time {
            color: #999;
            margin-top: 5px;
          }

          @media print {
            body {
              background: white;
              padding: 0;
            }

            .ticket {
              margin: 0 auto;
              page-break-after: always;
            }

            .ticket:last-child {
              page-break-after: auto;
            }
          }
        </style>
      </head>
      <body>
        ${ticketsHTML}
      </body>
    </html>
  `

    printWindow.document.write(printContent)
    printWindow.document.close()

    // Auto-print after a short delay
    setTimeout(() => {
        printWindow.focus()
        printWindow.print()
    }, 500)
}
