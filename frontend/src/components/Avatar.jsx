import React from 'react'
import { Avatar as AvatarUI, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { LogOut, User, Settings } from 'lucide-react'
import useAuth from '@/hooks/useAuth'

const Avatar = ({ className = "size-8" }) => {
	const { user, logout } = useAuth()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-auto p-0">
					<AvatarUI className={className}>
						<AvatarImage src="" alt={user?.fullName || user?.username} />
						<AvatarFallback>
							{user?.firstName?.[0]}{user?.lastName?.[0]}
						</AvatarFallback>
					</AvatarUI>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<div className="flex items-center justify-start gap-2 p-2">
					<AvatarUI className="size-8">
						<AvatarImage src="" alt={user?.fullName || user?.username} />
						<AvatarFallback>
							{user?.firstName?.[0]}{user?.lastName?.[0]}
						</AvatarFallback>
					</AvatarUI>
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">
							{user?.fullName || user?.username}
						</p>
						<p className="text-xs leading-none text-muted-foreground capitalize">
							{user?.role?.replace('_', ' ')}
						</p>
					</div>
				</div>
				<DropdownMenuSeparator />
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
	)
}

export default Avatar
