import React from 'react'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useGetAll } from '@/hooks/useApiQueries'

const UnifiedPrintButton = ({ event, formatCurrency, formatDate }) => {
    const eventId = event?._id

    // Fetch all data needed for reports
    const { data: rentalsData = [] } = useGetAll(
        eventId ? `/cage-rentals/event/${eventId}` : null
    )

    const { data: entrancesData = [] } = useGetAll(
        eventId ? `/entrances?eventID=${eventId}` : null
    )

    const { data: matchResultsData = [] } = useGetAll(
        eventId ? `/match-results/event/${eventId}` : null
    )

    const { data: participantsData = [] } = useGetAll(
        eventId ? `/participants?eventID=${eventId}` : null
    )

    // Process Rentals Data
    const rentals = rentalsData || []
    const totalRentals = rentals.length
    const totalRentalRevenue = rentals.reduce((sum, rental) => sum + (rental.totalPrice || 0), 0)
    const paidRentals = rentals.filter(r => r.paymentStatus === 'paid').length
    const unpaidRentals = rentals.filter(r => r.paymentStatus === 'unpaid').length

    // Process Entrances Data
    const entrances = entrancesData || []
    const totalEntrances = entrances.reduce((sum, entrance) => sum + (entrance.count || 0), 0)
    const totalEntranceRevenue = totalEntrances * (event?.entranceFee || 0)

    // Process Plazada Data
    const matchResults = matchResultsData || []
    const totalPlazada = matchResults
        .filter(r => r.betWinner === 'Meron' || r.betWinner === 'Wala')
        .reduce((sum, result) => sum + (result.totalPlazada || 0), 0)
    const totalMatches = matchResults.length
    const meronWins = matchResults.filter(r => r.betWinner === 'Meron').length
    const walaWins = matchResults.filter(r => r.betWinner === 'Wala').length
    const draws = matchResults.filter(r => r.betWinner === 'Draw').length

    // Process Entry Fees Data
    const participants = participantsData || []
    const participantsWithEntryFee = participants.filter(p => p.entryFee && p.entryFee > 0)
    const totalEntryFeeParticipants = participantsWithEntryFee.length
    const totalEntryFeeRevenue = participantsWithEntryFee.reduce((sum, participant) => sum + (participant.entryFee || 0), 0)

    // Grand Total
    const grandTotalRevenue = totalRentalRevenue + totalEntranceRevenue + totalPlazada + totalEntryFeeRevenue

    const handlePrintAll = () => {
        const printWindow = window.open('', '_blank')

        const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Full Event Report - ${event?.eventName || 'Event'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              line-height: 1.4;
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
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-top: 30px;
              margin-bottom: 15px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
              page-break-after: avoid;
            }
            .summary-box {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .summary-label {
              font-weight: bold;
            }
            .grand-total {
              margin-top: 30px;
              padding: 20px;
              background-color: #333;
              color: white;
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              border-radius: 5px;
              page-break-inside: avoid;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .text-right {
              text-align: right;
            }
            .page-break {
              page-break-before: always;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="event-title">Full Event Report</div>
            <div class="event-title">${event?.eventName || 'Event Name'}</div>
            <div class="event-details">Date: ${event?.date ? new Date(event.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'N/A'}</div>
            <div class="event-details">Location: ${event?.location || 'N/A'}</div>
            <div class="event-details">Report Generated: ${new Date().toLocaleString('en-US')}</div>
          </div>

          <!-- Executive Summary -->
          <div class="section-title">Executive Summary</div>
          <div class="summary-box">
            <div class="summary-row">
              <span class="summary-label">Rentals Revenue:</span>
              <span>${formatCurrency(totalRentalRevenue)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Entrances Revenue:</span>
              <span>${formatCurrency(totalEntranceRevenue)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Plazada Revenue:</span>
              <span>${formatCurrency(totalPlazada)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Entry Fees Revenue:</span>
              <span>${formatCurrency(totalEntryFeeRevenue)}</span>
            </div>
            <div style="border-top: 1px solid #ccc; margin-top: 10px; padding-top: 10px;" class="summary-row">
              <span class="summary-label">Total Event Revenue:</span>
              <span style="font-size: 1.2em;">${formatCurrency(grandTotalRevenue)}</span>
            </div>
          </div>

          <!-- Rentals Section -->
          <div class="section-title">Rentals Report</div>
          <div class="summary-box">
            <div class="summary-row">
              <span class="summary-label">Total Rentals:</span>
              <span>${totalRentals}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Paid / Unpaid:</span>
              <span>${paidRentals} / ${unpaidRentals}</span>
            </div>
             <div class="summary-row" style="margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 5px;">
              <span class="summary-label">Total Rentals Revenue:</span>
              <span>${formatCurrency(totalRentalRevenue)}</span>
            </div>
          </div>

          <!-- Entrances Section -->
          <div class="section-title">Entrances Report</div>
          <div class="summary-box">
            <div class="summary-row">
              <span class="summary-label">Total Entrances:</span>
              <span>${totalEntrances}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Entrance Fee:</span>
              <span>${formatCurrency(event?.entranceFee || 0)}</span>
            </div>
            <div class="summary-row" style="margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 5px;">
              <span class="summary-label">Total Entrances Revenue:</span>
              <span>${formatCurrency(totalEntranceRevenue)}</span>
            </div>
          </div>

          <!-- Plazada Section -->
          <div class="section-title">Plazada Report</div>
          <div class="summary-box">
            <div class="summary-row">
              <span class="summary-label">Total Matches:</span>
              <span>${totalMatches}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Meron / Wala:</span>
              <span>${meronWins} / ${walaWins}</span>
            </div>
            <div class="summary-row" style="margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 5px;">
              <span class="summary-label">Total Plazada Revenue:</span>
              <span>${formatCurrency(totalPlazada)}</span>
            </div>
          </div>

          ${participantsWithEntryFee.length > 0 ? `
            <!-- Entry Fees Section -->
            <div class="section-title">Entry Fees Report</div>
            <div class="summary-box">
              <div class="summary-row">
                <span class="summary-label">Participants:</span>
                <span>${totalEntryFeeParticipants}</span>
              </div>
               <div class="summary-row" style="margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 5px;">
                <span class="summary-label">Total Entry Fees Revenue:</span>
                <span>${formatCurrency(totalEntryFeeRevenue)}</span>
              </div>
            </div>
          ` : ''}

          <div class="grand-total">
            GRAND TOTAL REVENUE: ${formatCurrency(grandTotalRevenue)}
          </div>

        </body>
      </html>
    `

        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
    }

    return (
        <Button onClick={handlePrintAll} variant="default" className="gap-2">
            <Printer className="h-4 w-4" />
            Print All Reports
        </Button>
    )
}

export default UnifiedPrintButton
