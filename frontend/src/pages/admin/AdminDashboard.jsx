import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const AdminDashboard = () => {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle>Overview</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">Welcome to the Cockpit Management System.</CardContent>
			</Card>
		</div>
	)
}

export default AdminDashboard
