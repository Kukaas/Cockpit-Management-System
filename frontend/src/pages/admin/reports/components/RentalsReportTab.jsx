import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Building2, Calendar } from 'lucide-react'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'
import { createViewOnlyRentalColumns } from '../../tangkal/components/ViewOnlyRentalColumns'

const RentalsReportTab = ({ event, formatCurrency, formatDate }) => {
  const eventId = event?._id

  // Fetch rentals for this event
  const { data: rentalsData = [], isLoading } = useGetAll(
    eventId ? `/cage-rentals/event/${eventId}` : null
  )

  const rentals = rentalsData || []

  // Calculate totals
  const totalRentals = rentals.length
  const totalRevenue = rentals.reduce((sum, rental) => sum + (rental.totalPrice || 0), 0)
  const paidRentals = rentals.filter(r => r.paymentStatus === 'paid').length
  const unpaidRentals = rentals.filter(r => r.paymentStatus === 'unpaid').length

  // Handle view details (no-op for reports)
  const handleViewDetails = () => { }

  // Create table columns
  const rentalColumns = createViewOnlyRentalColumns(
    formatCurrency,
    formatDate,
    handleViewDetails
  )

  // Print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rentals Report - ${event?.eventName || 'Event'}</title>
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
            .summary {
              margin: 20px 0;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .summary-label {
              font-weight: bold;
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
            .text-right {
              text-align: right;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="event-title">Rentals Report</div>
            <div class="event-title">${event?.eventName || 'Event Name'}</div>
            <div class="event-details">Date: ${event?.date ? new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'N/A'}</div>
            <div class="event-details">Time: ${event?.date ? new Date(event.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : 'N/A'}</div>
            <div class="event-details">Location: ${event?.location || 'N/A'}</div>
            <div class="event-details">Report Generated: ${new Date().toLocaleString('en-US')}</div>
          </div>

          <div class="summary">
            <div class="summary-row">
              <span class="summary-label">Total Rentals:</span>
              <span>${totalRentals}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total Revenue:</span>
              <span>${formatCurrency(totalRevenue)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Paid Rentals:</span>
              <span>${paidRentals}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Unpaid Rentals:</span>
              <span>${unpaidRentals}</span>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Renter Name</th>
                <th>Contact</th>
                <th>Quantity</th>
                <th>Rental Date</th>
                <th>Total Price</th>
                <th>Payment Status</th>
                <th>Rental Status</th>
              </tr>
            </thead>
            <tbody>
              ${rentals.map((rental, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${rental.nameOfRenter || 'N/A'}</td>
                  <td>${rental.contactNumber || '-'}</td>
                  <td>${rental.quantity || 0}</td>
                  <td>${rental.date ? new Date(rental.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'N/A'}</td>
                  <td class="text-right">${formatCurrency(rental.totalPrice || 0)}</td>
                  <td>${rental.paymentStatus ? rental.paymentStatus.charAt(0).toUpperCase() + rental.paymentStatus.slice(1) : 'N/A'}</td>
                  <td>${rental.rentalStatus ? rental.rentalStatus.charAt(0).toUpperCase() + rental.rentalStatus.slice(1) : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" style="text-align: right; font-weight: bold;">Total:</td>
                <td class="text-right" style="font-weight: bold;">${formatCurrency(totalRevenue)}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  if (!eventId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Please select an event to view rentals report</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRentals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{paidRentals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unpaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unpaidRentals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rentals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-end">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={rentals}
            columns={rentalColumns}
            pageSize={10}
            searchable={true}
            filterable={true}
            title="Rentals Report"
            loading={isLoading}
            emptyMessage="No rentals found for this event"
            className="shadow-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default RentalsReportTab

