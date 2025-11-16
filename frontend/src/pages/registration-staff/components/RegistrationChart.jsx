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
  participants: {
    label: "Participants",
    color: "var(--chart-1)",
  },
  cockProfiles: {
    label: "Cock Profiles",
    color: "var(--chart-2)",
  },
}

const participantStatusConfig = {
  count: {
    label: "Participants",
    color: "var(--chart-1)",
  },
}

const cockProfileStatusConfig = {
  count: {
    label: "Cock Profiles",
    color: "var(--chart-2)",
  },
}

const eventTypeConfig = {
  derby: {
    label: "Derby",
    color: "var(--chart-1)",
  },
  regular: {
    label: "Regular",
    color: "var(--chart-2)",
  },
}

export function RegistrationChart({ participantsData = [], cockProfilesData = [] }) {
  const [timeRange, setTimeRange] = React.useState("30d")

  // Generate chart data from participants and cock profiles
  const generateChartData = () => {
    if (!participantsData || participantsData.length === 0) return []

    // Group data by date
    const groupedByDate = participantsData.reduce((acc, participant) => {
      const date = new Date(participant.registrationDate || participant.createdAt).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          participants: 0,
          cockProfiles: 0,
          registeredParticipants: 0
        }
      }

      acc[date].participants += 1

      // Count participant status
      if (participant.status === 'registered') {
        acc[date].registeredParticipants += 1
      }

      return acc
    }, {})

    // Add cock profile data
    if (cockProfilesData && cockProfilesData.length > 0) {
      cockProfilesData.forEach(profile => {
        const date = new Date(profile.createdAt).toISOString().split('T')[0]
        if (!groupedByDate[date]) {
          groupedByDate[date] = {
            date,
            participants: 0,
            cockProfiles: 0,
            registeredParticipants: 0
          }
        }
        groupedByDate[date].cockProfiles += 1
      })
    }

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

  // Generate participant status data
  const generateParticipantStatusData = () => {
    if (!participantsData || participantsData.length === 0) return []

    const statusCounts = participantsData.reduce((acc, participant) => {
      const status = participant.status || 'registered'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }))
  }

  const participantStatusData = generateParticipantStatusData()

  // Generate cock profile status data
  const generateCockProfileStatusData = () => {
    if (!cockProfilesData || cockProfilesData.length === 0) return []

    const statusCounts = cockProfilesData.reduce((acc, profile) => {
      const status = profile.status || 'available'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // Ensure all statuses are included even if count is 0
    const allStatuses = ['available', 'scheduled', 'fought']
    allStatuses.forEach(status => {
      if (!statusCounts[status]) {
        statusCounts[status] = 0
      }
    })

    return Object.entries(statusCounts)
      .filter(([status, count]) => allStatuses.includes(status))
      .map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count
      }))
      .sort((a, b) => {
        // Sort by status order: available, scheduled, fought
        const order = { 'Available': 0, 'Scheduled': 1, 'Fought': 2 }
        return order[a.status] - order[b.status]
      })
  }

  const cockProfileStatusData = generateCockProfileStatusData()

  // Generate event type data
  const generateEventTypeData = () => {
    if (!cockProfilesData || cockProfilesData.length === 0) return []

    const eventTypeCounts = cockProfilesData.reduce((acc, profile) => {
      const eventType = profile.eventID?.eventType || 'regular'
      acc[eventType] = (acc[eventType] || 0) + 1
      return acc
    }, {})

    return Object.entries(eventTypeCounts).map(([eventType, count]) => ({
      eventType: eventType.charAt(0).toUpperCase() + eventType.slice(1),
      count
    }))
  }

  const eventTypeData = generateEventTypeData()

  return (
    <div className="space-y-6">
      {/* Registration Trends Chart */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Registration Trends</CardTitle>
            <CardDescription>
              Showing participant registrations and cock profiles over time
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
                  <linearGradient id="fillParticipants" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-participants)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-participants)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillCockProfiles" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-cockProfiles)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-cockProfiles)"
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
                        if (name === 'participants') {
                          return [value, ' Participants']
                        }
                        if (name === 'cockProfiles') {
                          return [value, ' Cock Profiles']
                        }
                        return [value, name]
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="participants"
                  type="natural"
                  fill="url(#fillParticipants)"
                  stroke="var(--color-participants)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="cockProfiles"
                  type="natural"
                  fill="url(#fillCockProfiles)"
                  stroke="var(--color-cockProfiles)"
                  strokeWidth={2}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>No registration data available for the selected time period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participant Status Distribution */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Participant Status Distribution</CardTitle>
            <CardDescription>
              Current status of all registered participants
            </CardDescription>
          </CardHeader>
          <CardContent>
            {participantStatusData.length > 0 ? (
              <ChartContainer config={participantStatusConfig}>
                <BarChart
                  data={participantStatusData}
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
                <p>No participant data available</p>
              </div>
            )}
          </CardContent>
        </Card> */}

        {/* Cock Profile Status Distribution */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Cock Profile Status Distribution</CardTitle>
            <CardDescription>
              Current status of all cock profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cockProfileStatusData.length > 0 ? (
              <ChartContainer config={cockProfileStatusConfig}>
                <BarChart
                  data={cockProfileStatusData}
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
                <p>No cock profile data available</p>
              </div>
            )}
          </CardContent>
        </Card> */}

        {/* Event Type Distribution */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Event Type Distribution</CardTitle>
            <CardDescription>
              Distribution of cock profiles by event type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventTypeData.length > 0 ? (
              <ChartContainer config={eventTypeConfig}>
                <BarChart
                  data={eventTypeData}
                  margin={{
                    top: 20,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="eventType"
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
                <p>No cock profile data available</p>
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
