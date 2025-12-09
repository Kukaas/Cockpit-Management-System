
export const printRentalReceipt = (rental, event) => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Please allow popups to print receipt');
    return;
  }

  const cages = rental.cages?.map(c => c.cageNo?.cageNumber || c.cageNo || 'Unknown').join(', ') || 'No cages';
  const totalAmount = rental.totalPrice || 0;
  const date = new Date(rental.date).toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Rental Receipt</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Courier New', monospace;
            width: 400px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }

          .receipt {
            border: 2px dashed #333;
            padding: 20px;
            background: white;
          }

          .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 2px dashed #333;
          }

          .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
          }

          .subtitle {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .date-time {
            font-size: 11px;
            color: #666;
            margin-top: 5px;
          }

          .section {
            margin: 12px 0;
            padding: 0;
          }

          .section-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
            color: #333;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 13px;
          }

          .label {
            font-weight: bold;
            color: #555;
          }

          .value {
            text-align: right;
            color: #000;
          }

          .cages-section {
            margin: 12px 0;
            padding: 12px;
            background: #f5f5f5;
            border-radius: 4px;
          }

          .cages-list {
            font-size: 11px;
            line-height: 1.5;
            word-break: break-all;
            margin-top: 5px;
          }

          .divider {
            border-top: 2px dashed #999;
            margin: 15px 0;
          }

          .total-section {
            margin: 15px 0;
            padding: 15px;
            background: #f9f9f9;
            border: 2px solid #333;
            border-radius: 4px;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .total-label {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
          }

          .total-amount {
            font-size: 20px;
            font-weight: bold;
            color: #2d5016;
          }

          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            margin-top: 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
          }

          .status-paid {
            background: #d4edda;
            color: #155724;
          }

          .status-unpaid {
            background: #f8d7da;
            color: #721c24;
          }

          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px dashed #333;
            font-size: 11px;
            color: #666;
          }

          .footer p {
            margin: 5px 0;
          }

          .thank-you {
            font-weight: bold;
            font-size: 12px;
            color: #333;
            margin-bottom: 8px;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
              width: auto;
            }

            .receipt {
              border: 2px dashed #333;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="title">${event?.eventName || 'Cockpit Management'}</div>
            <div class="subtitle">Cage Rental Receipt</div>
            <div class="date-time">${date} • ${time}</div>
          </div>

          <div class="section">
            <div class="section-title">Renter Information</div>
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">${rental.nameOfRenter}</span>
            </div>
            <div class="info-row">
              <span class="label">Contact:</span>
              <span class="value">${rental.contactNumber || 'N/A'}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="cages-section">
            <div class="section-title">Cages Rented (${rental.quantity})</div>
            <div class="cages-list">${cages}</div>
          </div>

          <div class="divider"></div>

          <div class="total-section">
            <div class="total-row">
              <span class="total-label">Total Amount:</span>
              <span class="total-amount">₱${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div style="text-align: center; margin-top: 10px;">
              <span class="status-badge ${rental.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}">
                ${(rental.paymentStatus || 'UNPAID').toUpperCase()}
              </span>
            </div>
          </div>

          <div class="footer">
            <p class="thank-you">Thank you for your patronage!</p>
            <p>Please keep this receipt for your records.</p>
            <p style="margin-top: 10px; font-size: 10px;">Receipt printed on ${new Date().toLocaleString()}</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
