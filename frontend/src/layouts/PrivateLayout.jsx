import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import SidebarComponent from '@/components/Sidebar'
import useAuth from '@/hooks/useAuth'

function useBreadcrumbs() {
	const location = useLocation()
	const segments = location.pathname.split('/').filter(Boolean)
	const crumbs = []
	let path = ''
	segments.forEach((seg, idx) => {
		path += `/${seg}`
		const label = seg.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
		crumbs.push({ label, path, isLast: idx === segments.length - 1 })
	})
	return crumbs
}


const HeaderBar = () => {
	const crumbs = useBreadcrumbs()
	const { user } = useAuth()

	// Determine the correct home route based on user role
	const getHomeRoute = () => {
		if (!user) return '/admin'

		switch (user.role) {
			case 'admin':
				return '/admin'
			case 'bet_staff':
				return '/bet-staff'
			case 'entrance_staff':
				return '/entrance-staff'
			case 'registration_staff':
				return '/registration-staff'
			case 'tangkal_staff':
				return '/tangkal-staff'
			default:
				return '/admin'
		}
	}

	return (
		<div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
			<div className="flex items-center gap-2 px-4 h-14">
				<SidebarTrigger />
				<Separator orientation="vertical" className="h-6" />
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link to={getHomeRoute()}>Home</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						{crumbs.map((c) => (
							<React.Fragment key={c.path}>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									{c.isLast ? (
										<BreadcrumbPage>{c.label}</BreadcrumbPage>
									) : (
										<BreadcrumbLink asChild>
											<Link to={c.path}>{c.label}</Link>
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
							</React.Fragment>
						))}
					</BreadcrumbList>
				</Breadcrumb>
				{/* <div className="ml-auto flex items-center gap-3">
					<Avatar />
				</div> */}
			</div>
		</div>
	)
}

const PrivateLayout = ({ children }) => {
	return (
		<SidebarProvider>
			<div className="flex min-h-svh w-full">
				<SidebarComponent />
				<SidebarInset>
					<HeaderBar />
					<div className="p-4">
						{children}
					</div>
				</SidebarInset>
			</div>
		</SidebarProvider>
	)
}

export default PrivateLayout
