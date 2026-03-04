import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Loader2 } from 'lucide-react'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import NativeSelect from '@/components/custom/NativeSelect'
import api from '@/services/api'
import { toast } from 'sonner'

const AggregateReportButton = ({ events = [] }) => {
    const [open, setOpen] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [reportType, setReportType] = useState('type') // type, month, year

    // Filter states
    const [selectedEventType, setSelectedEventType] = useState('regular')
    const [selectedMonth, setSelectedMonth] = useState('all') // Changed initial state to 'all'
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    // Options
    const eventTypes = [
        { value: 'regular', label: 'Regular' },
        { value: 'derby', label: 'Derby' },
        { value: 'fastest_kill', label: 'Fastest Kill' },
        { value: 'hits_ulutan', label: 'Hits Ulutan' }
    ]

    const months = [
        { value: 'all', label: 'All Months' },
        { value: 0, label: 'January' },
        { value: 1, label: 'February' },
        { value: 2, label: 'March' },
        { value: 3, label: 'April' },
        { value: 4, label: 'May' },
        { value: 5, label: 'June' },
        { value: 6, label: 'July' },
        { value: 7, label: 'August' },
        { value: 8, label: 'September' },
        { value: 9, label: 'October' },
        { value: 10, label: 'November' },
        { value: 11, label: 'December' }
    ]

    const currentYear = new Date().getFullYear()
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount)
    }

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            // 1. Filter events based on selection
            let filteredEvents = []
            let reportTitle = ''

            if (reportType === 'type') {
                filteredEvents = events.filter(e => {
                    const d = new Date(e.date)
                    const typeMatch = e.eventType === selectedEventType
                    const yearMatch = d.getFullYear() === Number(selectedYear)
                    const monthMatch = selectedMonth === 'all' || d.getMonth() === Number(selectedMonth)
                    return typeMatch && yearMatch && monthMatch
                })

                const typeLabel = eventTypes.find(t => t.value === selectedEventType)?.label
                const monthLabel = selectedMonth === 'all' ? 'All Months' : months.find(m => m.value === Number(selectedMonth))?.label
                reportTitle = `Report by Event Type: ${typeLabel} (${monthLabel} ${selectedYear})`

            } else if (reportType === 'month') {
                filteredEvents = events.filter(e => {
                    const d = new Date(e.date)
                    return d.getMonth() === Number(selectedMonth) && d.getFullYear() === Number(selectedYear)
                })
                const monthName = months.find(m => m.value === Number(selectedMonth))?.label
                reportTitle = `Monthly Report: ${monthName} ${selectedYear}`
            } else if (reportType === 'year') {
                filteredEvents = events.filter(e => {
                    const d = new Date(e.date)
                    return d.getFullYear() === Number(selectedYear)
                })
                reportTitle = `Annual Report: ${selectedYear}`
            }

            if (filteredEvents.length === 0) {
                toast.error('No events found for the selected criteria')
                setGenerating(false)
                return
            }

            // 2. Aggregate Data
            // We need to fetch details for each event to get accurate financials
            const aggregatedData = {
                totalEvents: filteredEvents.length,
                rentalsRevenue: 0,
                entranceRevenue: 0,
                plazadaRevenue: 0,
                entryFeesRevenue: 0,
                grandTotal: 0,
                events: [] // Store individual event summaries
            }

            // Fetch data in parallel
            const eventPromises = filteredEvents.map(async (event) => {
                try {
                    const [rentalsRes, entrancesRes, matchesRes, participantsRes] = await Promise.all([
                        api.get(`/cage-rentals/event/${event._id}`),
                        api.get(`/entrances?eventID=${event._id}`),
                        api.get(`/match-results/event/${event._id}`),
                        api.get(`/participants?eventID=${event._id}`)
                    ])

                    const rentals = rentalsRes.data?.data || rentalsRes.data || []
                    const entrances = entrancesRes.data?.data || entrancesRes.data || []
                    const matches = matchesRes.data?.data || matchesRes.data || []
                    const participants = participantsRes.data?.data || participantsRes.data || []

                    // Calculate subtotals
                    const rentalRev = rentals.reduce((sum, r) => sum + (r.totalPrice || 0), 0)

                    const entranceRev = entrances.reduce((sum, e) => sum + (e.count || 0) * (event.entranceFee || 0), 0)

                    const plazadaRev = matches
                        .filter(r => r.betWinner === 'Meron' || r.betWinner === 'Wala')
                        .reduce((sum, result) => sum + (result.totalPlazada || 0), 0)

                    const entryFeeRev = participants
                        .filter(p => p.entryFee && p.entryFee > 0)
                        .reduce((sum, participant) => sum + (participant.entryFee || 0), 0)

                    const totalRev = rentalRev + entranceRev + plazadaRev + entryFeeRev

                    return {
                        name: event.eventName,
                        date: new Date(event.date).toLocaleDateString(),
                        type: event.eventType,
                        rentalRev,
                        entranceRev,
                        plazadaRev,
                        entryFeeRev,
                        totalRev
                    }
                } catch (error) {
                    console.error(`Error fetching data for event ${event._id}`, error)
                    return null
                }
            })

            const eventResults = (await Promise.all(eventPromises)).filter(Boolean)

            // Sum up totals
            eventResults.forEach(res => {
                aggregatedData.rentalsRevenue += res.rentalRev
                aggregatedData.entranceRevenue += res.entranceRev
                aggregatedData.plazadaRevenue += res.plazadaRev
                aggregatedData.entryFeesRevenue += res.entryFeeRev
                aggregatedData.grandTotal += res.totalRev
                aggregatedData.events.push(res)
            })

            // 3. Print Report
            printReport(reportTitle, aggregatedData)
            setOpen(false)

        } catch (error) {
            console.error('Error generating report:', error)
            toast.error('Failed to generate report')
        } finally {
            setGenerating(false)
        }
    }

    const printReport = (title, data) => {
        const printWindow = window.open('', '_blank')
        const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 14px; color: #666; }
            .summary-box { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .summary-label { font-weight: bold; }
            .grand-total { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ccc; font-size: 18px; font-weight: bold; }

            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background: #f5f5f5; text-align: center; }
            td:first-child { text-align: left; }

            .signature-section {
              margin-top: 80px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              page-break-inside: avoid;
            }
            .signature-box {
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #333;
              margin-bottom: 5px;
              width: 80%;
              margin-left: auto;
              margin-right: auto;
            }
            .signature-label {
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }

            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${title}</div>
            <div class="subtitle">Generated: ${new Date().toLocaleString()}</div>
          </div>

          <div class="summary-box">
            <div class="title" style="font-size: 18px; margin-bottom: 15px;">Executive Summary</div>
            <div class="summary-row">
              <span class="summary-label">Total Events:</span>
              <span>${data.totalEvents}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Rentals Revenue:</span>
              <span>${formatCurrency(data.rentalsRevenue)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Entrances Revenue:</span>
              <span>${formatCurrency(data.entranceRevenue)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Plazada Revenue:</span>
              <span>${formatCurrency(data.plazadaRevenue)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Entry Fees Revenue:</span>
              <span>${formatCurrency(data.entryFeesRevenue)}</span>
            </div>
            <div class="summary-row grand-total">
              <span class="summary-label">TOTAL REVENUE:</span>
              <span>${formatCurrency(data.grandTotal)}</span>
            </div>
          </div>

          <h3>Event Breakdown</h3>
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Rentals</th>
                <th>Entrances</th>
                <th>Plazada</th>
                <th>Entry Fees</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.events.map(ev => `
                <tr>
                  <td>${ev.name}</td>
                  <td style="text-align: center;">${ev.date}</td>
                  <td style="text-align: center; text-transform: capitalize;">${ev.type.replace('_', ' ')}</td>
                  <td>${formatCurrency(ev.rentalRev)}</td>
                  <td>${formatCurrency(ev.entranceRev)}</td>
                  <td>${formatCurrency(ev.plazadaRev)}</td>
                  <td>${formatCurrency(ev.entryFeeRev)}</td>
                  <td style="font-weight: bold;">${formatCurrency(ev.totalRev)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Name and Signature of Owner</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Name and Signature of Admin</div>
            </div>
          </div>

        </body>
      </html>
    `
        printWindow.document.write(printContent)
        printWindow.document.close()

        // Auto-print
        setTimeout(() => {
            printWindow.focus()
            printWindow.print()
            // printWindow.close() // Optional: auto-close after print
        }, 500)
    }

    return (
        <>
            <Button variant="default" onClick={() => setOpen(true)} className="gap-2">
                <FileText className="h-4 w-4" />
                Generate Report
            </Button>

            <CustomAlertDialog
                open={open}
                onOpenChange={(val) => !generating && setOpen(val)}
                title="Generate Aggregate Report"
                description="Select report parameters to generate financial summary."
                actions={
                    <>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={generating}>
                            Cancel
                        </Button>
                        <Button onClick={handleGenerate} disabled={generating}>
                            {generating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Report'
                            )}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Report Type</label>
                        <NativeSelect
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="type">By Event Type</option>
                            <option value="month">By Month</option>
                            <option value="year">By Year</option>
                        </NativeSelect>
                    </div>

                    {reportType === 'type' && (
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Event Type</label>
                                <NativeSelect
                                    value={selectedEventType}
                                    onChange={(e) => setSelectedEventType(e.target.value)}
                                >
                                    {eventTypes.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </NativeSelect>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Month</label>
                                    <NativeSelect
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    >
                                        {months.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </NativeSelect>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Year</label>
                                    <NativeSelect
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                    >
                                        {years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </NativeSelect>
                                </div>
                            </div>
                        </div>
                    )}

                    {reportType === 'month' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Month</label>
                                <NativeSelect
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </NativeSelect>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Year</label>
                                <NativeSelect
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </NativeSelect>
                            </div>
                        </div>
                    )}

                    {reportType === 'year' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Year</label>
                            <NativeSelect
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </NativeSelect>
                        </div>
                    )}
                </div>
            </CustomAlertDialog>
        </>
    )
}

export default AggregateReportButton
