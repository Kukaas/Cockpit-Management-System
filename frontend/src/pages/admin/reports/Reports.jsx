import React from 'react'
import DataTable from '@/components/custom/DataTable'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll } from '@/hooks/useApiQueries'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

const Reports = () => {
    const navigate = useNavigate()

    // Fetch events
    const { data: events = [], isLoading } = useGetAll('/events')

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Handle row click to navigate to report details
    const handleRowClick = (event) => {
        navigate(`/admin/reports/${event._id}`)
    }

    // Create table columns
    const columns = [
        {
            key: 'eventName',
            label: 'Event Name',
            sortable: true,
            filterable: false,
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{value}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {row.location}
                    </span>
                </div>
            )
        },
        {
            key: 'date',
            label: 'Date & Time',
            sortable: true,
            filterable: false,
            render: (value) => (
                <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(value)}</span>
                </div>
            )
        },
        {
            key: 'eventType',
            label: 'Type',
            sortable: true,
            filterable: true,
            filterOptions: ['Regular', 'Derby', 'Fastest Kill'],
            filterValueMap: {
                'Regular': 'regular',
                'Derby': 'derby',
                'Fastest Kill': 'fastest_kill'
            },
            render: (value) => (
                <Badge
                    variant={
                        value === 'derby' ? 'default' :
                            value === 'fastest_kill' ? 'secondary' :
                                'outline'
                    }
                    className="text-xs capitalize"
                >
                    {value === 'fastest_kill' ? 'Fastest Kill' : value}
                </Badge>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            filterable: true,
            filterOptions: ['Active', 'Completed'],
            filterValueMap: {
                'Active': 'active',
                'Completed': 'completed',
            },
            render: (value) => (
                <Badge
                    variant={
                        value === 'active' ? 'default' :
                            value === 'completed' ? 'secondary' :
                                'outline'
                    }
                    className="text-xs capitalize"
                >
                    {value.replace('_', ' ').charAt(0).toUpperCase() + value.replace('_', ' ').slice(1)}
                </Badge>
            )
        }
    ]

    return (
        <PageLayout
            title="Reports"
            description="View financial reports for events - Rentals, Entrances, and Plazada"
            headerButton={
                <Button variant="outline" onClick={() => navigate('/admin')}>
                    Back to Dashboard
                </Button>
            }
        >
            <DataTable
                data={events}
                columns={columns}
                pageSize={10}
                searchable={true}
                filterable={true}
                title="Select Event for Reports"
                onRowClick={handleRowClick}
                loading={isLoading}
                emptyMessage="No events found"
                className="shadow-sm"
            />
        </PageLayout>
    )
}

export default Reports

