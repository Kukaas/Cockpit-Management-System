import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'
import { createViewOnlyMatchResultColumns } from '../../events/components/ViewOnlyTableColumns'

const PlazadaReportTab = ({ event, formatCurrency, formatDate }) => {
  const eventId = event?._id

  // Fetch match results for this event
  const { data: matchResultsData = [], isLoading } = useGetAll(
    eventId ? `/match-results/event/${eventId}` : null
  )

  const matchResults = matchResultsData || []

  // Calculate totals
  const totalPlazada = matchResults.reduce((sum, result) => sum + (result.totalPlazada || 0), 0)
  const totalMatches = matchResults.length
  const meronWins = matchResults.filter(r => r.betWinner === 'Meron').length
  const walaWins = matchResults.filter(r => r.betWinner === 'Wala').length
  const draws = matchResults.filter(r => r.betWinner === 'Draw').length

  // Handle view details (no-op for reports)
  const handleViewDetails = () => { }

  // Create table columns
  const matchResultColumns = createViewOnlyMatchResultColumns(
    formatCurrency,
    formatDate,
    handleViewDetails,
    event?.eventType
  )

  // Print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Plazada Report - ${event?.eventName || 'Event'}</title>
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
            <div class="event-title">Plazada Report</div>
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
              <span class="summary-label">Total Matches:</span>
              <span>${totalMatches}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total Plazada Collected:</span>
              <span>${formatCurrency(totalPlazada)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Meron Wins:</span>
              <span>${meronWins}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Wala Wins:</span>
              <span>${walaWins}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Draws:</span>
              <span>${draws}</span>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Fight #</th>
                <th>Bet Winner</th>
                <th>Plazada Collected</th>
                <th>Winner</th>
                <th>Loser</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${matchResults.map((result, index) => {
      const winnerName = result.resultMatch?.winnerParticipantID?.participantName || 'N/A'
      const loserName = result.resultMatch?.loserParticipantID?.participantName || 'N/A'
      return `
                <tr>
                  <td>${index + 1}</td>
                  <td>#${result.matchID?.fightNumber || 'N/A'}</td>
                  <td>${result.betWinner || 'N/A'}</td>
                  <td class="text-right">${formatCurrency(result.totalPlazada || 0)}</td>
                  <td>${winnerName}</td>
                  <td>${loserName}</td>
                  <td>${result.verified ? 'Verified' : 'Unverified'}</td>
                </tr>
              `
    }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">Total:</td>
                <td class="text-right" style="font-weight: bold;">${formatCurrency(totalPlazada)}</td>
                <td colspan="3"></td>
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
        <p>Please select an event to view plazada report</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMatches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Plazada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPlazada)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meron / Wala / Draw</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div>
                Meron:{' '}
                <span className="font-bold text-blue-600">
                  PHP {meronWins}
                </span>
              </div>
              <div>
                Wala:{' '}
                <span className="font-bold text-gray-600">
                  PHP {walaWins}
                </span>
              </div>
              <div>
                Draw:{' '}
                <span className="font-bold text-yellow-600">
                  PHP {draws}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plazada Table */}
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
            data={matchResults}
            columns={matchResultColumns}
            pageSize={10}
            searchable={true}
            filterable={true}
            title="Plazada Report"
            loading={isLoading}
            emptyMessage="No match results found for this event"
            className="shadow-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default PlazadaReportTab

