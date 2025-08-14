import React from 'react'
import PrivateLayout from './PrivateLayout'

const PageLayout = ({ children, title, description, headerButton }) => {
  return (
    <PrivateLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {headerButton && (
            <div className="flex-shrink-0">
              {headerButton}
            </div>
          )}
        </div>
        {children}
      </div>
    </PrivateLayout>
  )
}

export default PageLayout
