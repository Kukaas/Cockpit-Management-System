
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
          body {
            font-family: 'Courier New', monospace;
            width: 300px; /* Approximate thermal printer width */
            margin: 0;
            padding: 10px;
            font-size: 12px;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 14px;
            margin-bottom: 5px;
          }
          .divider {
            border-top: 1px dashed black;
            margin: 10px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .label {
            font-weight: bold;
          }
          .features {
            margin-top: 10px;
          }
          .cages {
            margin: 10px 0;
            word-break: break-all;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
          }
          @media print {
            body {
              margin: 0;
              width: auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${event?.name || 'Cockpit Management'}</div>
          <div class="subtitle">RENTAL RECEIPT</div>
          <div>${date} ${time}</div>
        </div>

        <div class="divider"></div>

        <div class="row">
          <span class="label">Renter:</span>
          <span>${rental.nameOfRenter}</span>
        </div>
        <div class="row">
          <span class="label">Contact:</span>
          <span>${rental.contactNumber || '-'}</span>
        </div>

        <div class="divider"></div>

        <div class="cages">
          <div class="label">Cages Rented (${rental.quantity}):</div>
          <div>${cages}</div>
        </div>

        <div class="divider"></div>

        <div class="row" style="font-size: 14px; font-weight: bold;">
          <span>TOTAL:</span>
          <span>PHP ${totalAmount.toLocaleString()}</span>
        </div>

        <div class="row" style="margin-top: 5px;">
          <span>Status:</span>
          <span>${(rental.paymentStatus || 'UNPAID').toUpperCase()}</span>
        </div>

        <div class="footer">
          <p>Thank you for your patronage!</p>
          <p>Please keep this receipt.</p>
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
