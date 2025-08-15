import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarSeparator } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, User, Settings, BarChart3, Users, Settings as SettingsIcon, TrendingUp, CheckSquare, ClipboardList, Shield, AlertTriangle, Calendar, PartyPopper, FileText, ClipboardCheck, UserPlus, Swords, File } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import logo from '@/assets/logo.png'

const SidebarComponent = () => {
	const { user, logout } = useAuth()
	const location = useLocation()

	// Navigation items based on user role
	const getNavigationItems = (role) => {
		const baseItems = [
			{
				label: 'Dashboard',
				path: `/${role.replace('_', '-')}`,
				icon: <BarChart3 className="size-4" />
			}
		]

		switch (role) {
			case 'admin':
				return [
					...baseItems,
					{
						label: 'User Management',
						path: '/admin/users',
						icon: <Users className="size-4" />
					},
					{
						label: 'Event Management',
						path: '/admin/events',
						icon: <Calendar className="size-4" />
					},
				]
			case 'entrance_staff':
				return [
					...baseItems,
					{
						label: 'Entrance Registration',
						path: '/entrance-staff/entrance-registration',
						icon: <CheckSquare className="size-4" />
					},
				]
			case 'tangkal_staff':
				return [
					...baseItems,
					{
						label: 'Cage Availability',
						path: '/tangkal-staff/cage-availability',
						icon: <File className="size-4" />
					},
					{
						label: 'Cage Rentals',
						path: '/tangkal-staff/cage-rentals',
						icon: <Shield className="size-4" />
					},
				]
			case 'event_staff':
				return [
					...baseItems,
					{
						label: 'Event Schedule',
						path: '/event-staff/schedule',
						icon: <Calendar className="size-4" />
					},
					{
						label: 'Fight Schedule',
						path: '/event-staff/fight-schedule',
						icon: <Swords className="size-4" />
					}
				]
			case 'registration_staff':
				return [
					...baseItems,
					{
						label: 'Registrations',
						path: '/registration-staff/participant-registration',
						icon: <FileText className="size-4" />
					},
				]
			default:
				return baseItems
		}
	}

	const navigationItems = getNavigationItems(user?.role || 'registration_staff')

	return (
		<Sidebar>
			<SidebarHeader className="px-3 py-3">
				<div className="flex items-center gap-3">
					<div className="size-8 rounded bg-black grid place-items-center">
						<img src={logo} alt="Cockpit" className="size-6 object-contain invert" />
					</div>
					<div className="font-semibold">Cockpit Management</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map((item) => (
								<SidebarMenuItem key={item.path}>
									<SidebarMenuButton
										asChild
										className={`transition-colors duration-200 ${location.pathname === item.path ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
									>
									<Link to={item.path}>
										<span className={`mr-2 ${location.pathname === item.path ? 'text-gray-700 dark:text-gray-300' : 'text-muted-foreground'}`}>{item.icon}</span>
										<span className={location.pathname === item.path ? 'font-medium' : ''}>{item.label}</span>
									</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarSeparator />

			<SidebarFooter className="px-4 py-2">
				<div className="flex items-center gap-3 mb-3">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-auto p-2 w-full justify-start">
								<Avatar className="size-8 mr-3">
									<AvatarImage src="" alt={user?.fullName || user?.username} />
									<AvatarFallback>
										{user?.firstName?.[0]}{user?.lastName?.[0]}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col items-start text-left">
									<span className="text-sm font-medium">
										{user?.fullName || user?.username}
									</span>
									<span className="text-xs text-muted-foreground capitalize">
										{user?.role?.replace('_', ' ')}
									</span>
								</div>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuItem>
								<User className="mr-2 h-4 w-4" />
								Profile
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings className="mr-2 h-4 w-4" />
								Settings
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={logout} className="text-red-600">
								<LogOut className="mr-2 h-4 w-4" />
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className="text-xs text-muted-foreground text-center">
					© {new Date().getFullYear()} Cockpit
				</div>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}

export default SidebarComponent
