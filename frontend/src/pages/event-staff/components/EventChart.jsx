"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const chartConfig = {
  plazada: {
    label: "Plazada",
    color: "var(--chart-1)",
  },
  fights: {
    label: "Fights",
    color: "var(--chart-3)",
  },
}

const fightStatusConfig = {
  count: {
    label: "Fights",
    color: "var(--chart-1)",
  },
}

const betWinnerConfig = {
  meron: {
    label: "Meron",
    color: "var(--chart-1)",
  },
  wala: {
    label: "Wala",
    color: "var(--chart-2)",
  },
  draws: {
    label: "Draws",
    color: "var(--chart-3)",
  },
}

export function EventChart({ matchResultsData = [], fightSchedulesData = [] }) {
  const [timeRange, setTimeRange] = React.useState("30d")

  // Generate chart data from match results and fight schedules
  const generateChartData = () => {
    if (!matchResultsData || matchResultsData.length === 0) return []

    // Group data by date
    const groupedByDate = matchResultsData.reduce((acc, result) => {
      const date = new Date(result.matchStartTime || result.createdAt).toISOString().split('T')[0]
             if (!acc[date]) {
         acc[date] = {
           date,
           plazada: 0,
           fights: 0,
           meronWins: 0,
           walaWins: 0,
           draws: 0
         }
       }

       acc[date].plazada += result.totalPlazada || 0
       acc[date].fights += 1

      // Count bet winners
      if (result.betWinner === 'Meron') {
        acc[date].meronWins += 1
      } else if (result.betWinner === 'Wala') {
        acc[date].walaWins += 1
      } else if (result.betWinner === 'Draw') {
        acc[date].draws += 1
      }

      return acc
    }, {})

    // Convert to array and sort by date
    const sortedData = Object.values(groupedByDate).sort((a, b) => new Date(a.date) - new Date(b.date))

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

  // Generate fight status data
  const generateFightStatusData = () => {
    if (!fightSchedulesData || fightSchedulesData.length === 0) return []

    const statusCounts = fightSchedulesData.reduce((acc, fight) => {
      const status = fight.status || 'scheduled'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1),
      count
    }))
  }

  const fightStatusData = generateFightStatusData()

  return (
    <div className="space-y-6">
      {/* Plazada and Bet Pool Chart */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
                       <CardTitle>Plazada Statistics</CardTitle>
           <CardDescription>
             Showing plazada earnings over time
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
                  <linearGradient id="fillPlazada" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-plazada)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-plazada)"
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
                         if (name === 'plazada') {
                           return [formatCurrency(value), ' Plazada']
                         }
                         return [value, name]
                       }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="plazada"
                  type="natural"
                  fill="url(#fillPlazada)"
                  stroke="var(--color-plazada)"
                  strokeWidth={2}
                />

                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>No match data available for the selected time period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fight Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Fight Status Distribution */}
         <Card>
           <CardHeader>
             <CardTitle>Fight Status Distribution</CardTitle>
             <CardDescription>
               Current status of all scheduled fights
             </CardDescription>
           </CardHeader>
           <CardContent>
             {fightStatusData.length > 0 ? (
               <ChartContainer config={fightStatusConfig}>
                 <BarChart
                   data={fightStatusData}
                   margin={{
                     top: 20,
                   }}
                 >
                   <CartesianGrid vertical={false} />
                   <XAxis
                     dataKey="status"
                     tickLine={false}
                     tickMargin={10}
                     axisLine={false}
                   />
                   <ChartTooltip
                     cursor={false}
                     content={<ChartTooltipContent hideLabel />}
                   />
                    <Bar dataKey="count" fill="var(--color-count)" radius={8} />
                 </BarChart>
               </ChartContainer>
             ) : (
               <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                 <p>No fight schedule data available</p>
               </div>
             )}
           </CardContent>
         </Card>

                 {/* Bet Winner Distribution */}
         <Card>
           <CardHeader>
             <CardTitle>Bet Winner Distribution</CardTitle>
             <CardDescription>
               Distribution of Meron vs Wala wins
             </CardDescription>
           </CardHeader>
           <CardContent>
             {chartData.length > 0 ? (
                               <ChartContainer config={betWinnerConfig}>
                                     <BarChart
                     data={[
                       {
                         name: 'Meron',
                         value: chartData.reduce((sum, item) => sum + item.meronWins, 0)
                       },
                       {
                         name: 'Wala',
                         value: chartData.reduce((sum, item) => sum + item.walaWins, 0)
                       },
                       {
                         name: 'Draws',
                         value: chartData.reduce((sum, item) => sum + item.draws, 0)
                       }
                     ]}
                    margin={{
                      top: 20,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                                             content={
                         <ChartTooltipContent
                           formatter={(value, name, props) => {
                             return <span>{props.payload.name}: {value}</span>
                           }}
                           hideLabel
                         />
                       }
                    />
                        <Bar
                        dataKey="value"
                        fill="var(--color-wala)"
                        radius={8}
                        barSize={60}
                      />
                  </BarChart>
                </ChartContainer>
             ) : (
               <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                 <p>No match result data available</p>
               </div>
             )}
           </CardContent>
         </Card>
      </div>
    </div>
  )
}
