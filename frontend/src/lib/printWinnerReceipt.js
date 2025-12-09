/**
 * Utility function to print winner receipt
 * @param {Object} params - Print parameters
 * @param {Object} params.event - Event object with details
 * @param {Object} params.fight - Fight object with details
 * @param {Object} params.winner - Winner participant object
 * @param {Number} params.payoutAmount - Amount winner receives
 * @param {String} params.position - Winner position (Meron/Wala)
 * @param {Function} params.formatDate - Function to format dates
 * @param {Function} params.formatCurrency - Function to format currency
 */
export const printWinnerReceipt = ({
    event,
    fight,
    winner,
    payoutAmount,
    position = '',
    formatDate,
    formatCurrency
}) => {
    const printWindow = window.open('', '_blank')

    const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Winner Receipt - ${event?.eventName || 'Event'}</title>
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
            font-size: 14px;
          }

          .receipt {
            width: 300px;
            margin: 0 auto;
            background: white;
            border: 2px dashed #333;
            padding: 20px;
          }

          .receipt-header {
            text-align: center;
            border-bottom: 2px dashed #333;
            padding-bottom: 15px;
            margin-bottom: 15px;
          }

          .receipt-header h1 {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
          }

          .receipt-header .subtitle {
            font-size: 12px;
            color: #666;
          }

          .receipt-body {
            margin-bottom: 15px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dotted #ddd;
          }

          .info-row:last-child {
            border-bottom: none;
          }

          .label {
            font-weight: 600;
            color: #666;
            font-size: 12px;
          }

          .value {
            font-weight: 500;
            color: #333;
            font-size: 12px;
            text-align: right;
          }

          .highlight-section {
            background: #f9f9f9;
            padding: 15px;
            margin: 15px -5px;
            border: 2px solid #333;
            text-align: center;
          }

          .highlight-section .label {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            display: block;
          }

          .highlight-section .amount {
            font-size: 28px;
            font-weight: bold;
            color: #10b981;
          }

          .position-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            margin-top: 5px;
          }

          .position-meron {
            background: #fee2e2;
            color: #991b1b;
          }

          .position-wala {
            background: #dbeafe;
            color: #1e40af;
          }

          .receipt-footer {
            border-top: 2px dashed #333;
            padding-top: 15px;
            text-align: center;
            margin-top: 15px;
          }

          .receipt-footer p {
            font-size: 11px;
            color: #666;
            margin: 3px 0;
          }

          .thank-you {
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
          }

          @media print {
            body {
              background: white;
              padding: 0;
            }

            .receipt {
              box-shadow: none;
              margin: 0 auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
            <div class="receipt-header">
                <h1>WINNER RECEIPT</h1>
                <div class="subtitle">Official Payment Receipt</div>
            </div>

            <div class="receipt-body">
                <div class="info-row">
                    <span class="label">Event:</span>
                    <span class="value">${event?.eventName || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Event Date:</span>
                    <span class="value">${formatDate(event?.date || new Date())}</span>
                </div>
                <div class="info-row">
                    <span class="label">Fight No:</span>
                    <span class="value">#${fight?.fightNumber || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Winner:</span>
                    <span class="value">${winner?.participantName || winner?.entryName || 'N/A'}</span>
                </div>
                ${position ? `
                <div class="info-row">
                    <span class="label">Position:</span>
                    <span class="value">
                        <span class="position-badge ${position === 'Meron' ? 'position-meron' : 'position-wala'}">${position}</span>
                    </span>
                </div>
                ` : ''}
            </div>

            <div class="highlight-section">
                <span class="label">AMOUNT RECEIVED</span>
                <div class="amount">${formatCurrency(payoutAmount || 0)}</div>
            </div>

            <div class="receipt-footer">
                <p>Receipt Date: ${formatDate(new Date())}</p>
                <p class="thank-you">CONGRATULATIONS!</p>
                <p>Keep this receipt for your records</p>
            </div>
        </div>
      </body>
    </html>
  `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()

    // Auto-print after a short delay
    setTimeout(() => {
        printWindow.print()
        // Don't close automatically - let user close after printing
    }, 500)
}
