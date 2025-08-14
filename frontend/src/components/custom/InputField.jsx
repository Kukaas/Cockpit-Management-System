import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

const InputField = ({
	id,
	label,
	icon: Icon,
	description,
	className = '',
	type = 'text',
	showPasswordToggle = false,
	...props
}) => {
	const [showPassword, setShowPassword] = useState(false)
	const isPassword = type === 'password'
	const inputType = isPassword && showPasswordToggle && showPassword ? 'text' : type

	return (
		<div className={`grid gap-2 ${className}`}>
			{label ? <Label htmlFor={id}>{label}</Label> : null}
			<div className="relative">
				{Icon ? <Icon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /> : null}
				<Input
					id={id}
					type={inputType}
					{...props}
					className={`${Icon ? 'pl-8' : ''} ${showPasswordToggle && isPassword ? 'pr-10' : ''}`}
				/>
				{showPasswordToggle && isPassword && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
						onClick={() => setShowPassword(!showPassword)}
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4 text-muted-foreground" />
						) : (
							<Eye className="h-4 w-4 text-muted-foreground" />
						)}
					</Button>
				)}
			</div>
			{description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
		</div>
	)
}

export default InputField


