/**
 * Utility function to print individual entrance tickets
 * @param {Object} params - Print parameters
 * @param {Object} params.event - Event object with details
 * @param {Number} params.count - Number of tickets to print
 * @param {Function} params.formatDate - Function to format dates
 * @param {Function} params.formatCurrency - Function to format currency
 * @param {Date} params.entranceTime - Time of entrance
 * @param {String} params.entranceId - MongoDB entrance record ID
 */
export const printEntranceTickets = ({
    event,
    count = 1,
    formatDate,
    formatCurrency,
    entranceTime = new Date(),
    entranceId = ''
}) => {
    const printWindow = window.open('', '_blank')

    // Generate ticket HTML for each entrance
    const ticketsHTML = Array.from({ length: count }, (_, index) => `
        <div class="ticket" style="page-break-after: ${index < count - 1 ? 'always' : 'auto'};">
            <div class="ticket-header">
                <h1>ENTRANCE TICKET</h1>
                ${entranceId ? `<div class="ticket-number">#${entranceId}</div>` : ''}
            </div>

            <div class="ticket-body">
                <div class="event-info">
                    <div class="info-row">
                        <span class="label">Event:</span>
                        <span class="value">${event?.eventName || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Type:</span>
                        <span class="value">${event?.eventType ? event.eventType.replace('_', ' ').toUpperCase() : 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Event Date:</span>
                        <span class="value">${formatDate(event?.date || new Date())}</span>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="entrance-info">
                    <div class="info-row highlight">
                        <span class="label">Entrance Fee:</span>
                        <span class="value price">${formatCurrency(event?.entranceFee || 0)}</span>
                    </div>
                    <div class="info-row highlight">
                        <span class="label">Entry Time:</span>
                        <span class="value time">${formatDate(entranceTime)}</span>
                    </div>
                </div>
            </div>

            <div class="ticket-footer">
                <p>Please keep this ticket for verification</p>
                <p class="print-time">Printed: ${formatDate(new Date())}</p>
            </div>
        </div>
    `).join('')

    const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Entrance Tickets - ${event?.eventName || 'Event'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
          }

          .ticket {
            width: 400px;
            margin: 0 auto 20px;
            background: white;
            border: 2px solid #333;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }

          .ticket-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            position: relative;
          }

          .ticket-header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
            letter-spacing: 2px;
          }

          .ticket-number {
            font-size: 18px;
            font-weight: bold;
            background: rgba(255,255,255,0.2);
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            margin-top: 5px;
          }

          .ticket-body {
            padding: 25px;
          }

          .event-info,
          .entrance-info {
            margin-bottom: 15px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px dashed #e0e0e0;
          }

          .info-row:last-child {
            border-bottom: none;
          }

          .info-row.highlight {
            background: #f9f9f9;
            padding: 12px;
            margin: 5px -12px;
            border-radius: 5px;
            border: none;
          }

          .label {
            font-weight: 600;
            color: #666;
            font-size: 14px;
          }

          .value {
            font-weight: 500;
            color: #333;
            font-size: 14px;
            text-align: right;
          }

          .value.price {
            color: #10b981;
            font-size: 18px;
            font-weight: bold;
          }

          .value.time {
            color: #3b82f6;
            font-weight: bold;
          }

          .divider {
            height: 2px;
            background: linear-gradient(to right, transparent, #667eea, transparent);
            margin: 20px 0;
          }

          .ticket-footer {
            background: #f9f9f9;
            padding: 15px;
            text-align: center;
            border-top: 2px dashed #ddd;
          }

          .ticket-footer p {
            font-size: 12px;
            color: #666;
            margin: 3px 0;
          }

          .print-time {
            font-size: 10px;
            color: #999;
            margin-top: 8px;
          }

          @media print {
            body {
              background: white;
              padding: 0;
            }

            .ticket {
              box-shadow: none;
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
    printWindow.focus()

    // Auto-print after a short delay
    setTimeout(() => {
        printWindow.print()
        // Don't close automatically - let user close after printing
    }, 500)
}
