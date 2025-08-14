import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const InputField = ({ id, label, icon: Icon, description, className = '', ...props }) => {
	return (
		<div className={`grid gap-2 ${className}`}>
			{label ? <Label htmlFor={id}>{label}</Label> : null}
			<div className="relative">
				{Icon ? <Icon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /> : null}
				<Input id={id} {...props} className={Icon ? 'pl-8' : undefined} />
			</div>
			{description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
		</div>
	)
}

export default InputField


