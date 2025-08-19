"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
}

export function RentalChart({ rentalsData = [] }) {
  const [timeRange, setTimeRange] = React.useState("30d")

  // Generate chart data from rentals
  const generateChartData = () => {
    if (!rentalsData || rentalsData.length === 0) return []

    // Group rentals by date
    const groupedByDate = rentalsData.reduce((acc, rental) => {
      const date = new Date(rental.date).toISOString().split('T')[0]
      if (!acc[date]) {
              acc[date] = {
        date,
        revenue: 0
      }
      }

      acc[date].revenue += rental.totalPrice || 0

      return acc
    }, {})

    // Convert to array and sort by date
    const sortedData = Object.values(groupedByDate).sort((a, b) => new Date(a.date) - new Date(b.date))

    // Debug log to check the data
    console.log('Chart data:', sortedData)

    return sortedData
  }

  const chartData = generateChartData()

  // Filter data based on time range
  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    let daysToSubtract = 30

    if (timeRange === "7d") {
      daysToSubtract = 7
    } else if (timeRange === "90d") {
      daysToSubtract = 90
    }

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  // Format currency for tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value)
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Rental Statistics</CardTitle>
          <CardDescription>
            Showing rental activity and revenue over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.1}
                  />
                </linearGradient>

              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  // Format Y-axis labels based on the data type
                  if (value > 1000) {
                    return formatCurrency(value)
                  }
                  return value.toString()
                }}
              />
                             <ChartTooltip
                 cursor={false}
                 content={
                   <ChartTooltipContent
                     labelFormatter={(value) => {
                       return new Date(value).toLocaleDateString("en-US", {
                         month: "short",
                         day: "numeric",
                         year: "numeric"
                       })
                     }}
                     formatter={(value, name) => {
                       if (name === 'revenue') {
                         return [formatCurrency(value), ' Revenue']
                       }
                       return [value, name]
                     }}
                     indicator="dot"
                   />
                 }
               />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
                strokeWidth={2}
              />
              <Area
                dataKey="activeRentals"
                type="natural"
                fill="url(#fillActiveRentals)"
                stroke="var(--color-activeRentals)"
                strokeWidth={2}
              />
              <Area
                dataKey="returnedRentals"
                type="natural"
                fill="url(#fillReturnedRentals)"
                stroke="var(--color-returnedRentals)"
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No rental data available for the selected time period</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
