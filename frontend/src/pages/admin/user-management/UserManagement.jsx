import React, { useState } from 'react'
import DataTable from '@/components/custom/DataTable'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import ConfirmationDialog from '@/components/custom/ConfirmationDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, UserPlus, Lock, Unlock } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { toast } from 'sonner'
import NativeSelect from '@/components/custom/NativeSelect'
import { useGetAll } from '@/hooks/useApiQueries'
import { useCreateMutation, usePutMutation } from '@/hooks/useApiMutations'

const UserManagement = () => {
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [statusToggleDialogOpen, setStatusToggleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  })

  // Fetch users with general hook
  const { data: users = [], isLoading, error } = useGetAll('/staff')

  // Handle query error
  React.useEffect(() => {
    if (error) {
      toast.error('Failed to fetch users')
    }
  }, [error])

  // Create user mutation with general hook
  const createUserMutation = useCreateMutation('/staff', {
    successMessage: 'User created successfully',
    errorMessage: 'Failed to create user',
    queryKey: ['staff'],
    onSuccess: () => handleDialogClose(),
  })

  const handleAddUser = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    createUserMutation.mutate(formData)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', email: '', role: '' })
  }

  const handleDialogClose = () => {
    setAddUserDialogOpen(false)
    resetForm()
  }

  // Toggle user status mutation with general hook
  const toggleStatusMutation = usePutMutation('/staff', {
    successMessage: (data) => data.message,
    errorMessage: 'Failed to update user status',
    queryKey: ['staff'],
    onSuccess: () => {
      setStatusToggleDialogOpen(false)
      setSelectedUser(null)
    },
  })

  const handleStatusToggle = async () => {
    if (!selectedUser) return
    toggleStatusMutation.mutate({ id: selectedUser._id, data: {} })
  }

  const handleStatusToggleClose = () => {
    setStatusToggleDialogOpen(false)
    setSelectedUser(null)
  }

  // Column configuration
  const columns = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: false
    },
    {
      key: 'fullName',
      label: 'Full Name',
      sortable: true,
      filterable: false
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      filterable: true,
      filterOptions: ['Entrance Staff', 'Tangkal Staff', 'Event Staff', 'Registration Staff'],
      filterValueMap: {
        'Entrance Staff': 'entrance_staff',
        'Tangkal Staff': 'tangkal_staff',
        'Event Staff': 'event_staff',
        'Registration Staff': 'registration_staff'
      },
      render: (value) => (
        <Badge
          variant={value === 'admin' ? 'destructive' : value === 'manager' ? 'default' : 'secondary'}
          className="text-xs capitalize"
        >
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Active', 'Inactive'],
      filterValueMap: {
        'Active': true,
        'Inactive': false
      },
      render: (value) => (
        <Badge
          variant={value ? 'default' : 'outline'}
          className="text-xs"
        >
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'emailVerified',
      label: 'Verified',
      sortable: true,
      filterable: true,
      filterOptions: ['Yes', 'No'],
      filterValueMap: {
        'Yes': true,
        'No': false
      },
      render: (value) => (
        <Badge
          variant={value ? 'default' : 'secondary'}
          className="text-xs"
        >
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      filterable: false,
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleEditUser(row)
            }}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
                     <Button
             variant="ghost"
             size="sm"
             onClick={(e) => {
               e.stopPropagation()
               handleToggleStatus(row)
             }}
             className={`h-8 w-8 p-0 ${row.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
           >
             {row.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
           </Button>
        </div>
      )
    }
  ]

  // Action handlers
  const handleEditUser = (user) => {
    console.log('Edit user:', user)
    // Implement edit user logic
  }

  const handleToggleStatus = (user) => {
    setSelectedUser(user)
    setStatusToggleDialogOpen(true)
  }

  const handleRowClick = (user) => {
    console.log('Row clicked:', user)
    // Implement row click logic (e.g., navigate to user detail page)
  }

  return (
    <PageLayout
      title="User Management"
      description="Manage system users, roles, and permissions"
      headerButton={
        <Button onClick={() => setAddUserDialogOpen(true)} className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      }
    >
      {/* Add User Dialog */}
      <CustomAlertDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        title="Add New User"
        description="Create a new staff account. An email will be sent with login credentials."
        maxHeight="max-h-[500px]"
        actions={
          <>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
                         <Button onClick={handleAddUser} disabled={createUserMutation.isPending}>
               {createUserMutation.isPending ? 'Creating...' : 'Create User'}
             </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name *
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                className="h-10"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="h-10"
              required
            />
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Role *
            </Label>
            <NativeSelect
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              placeholder="Select a role"
              required
            >
              <option value="entrance_staff">Entrance Staff</option>
              <option value="tangkal_staff">Tangkal Staff</option>
              <option value="event_staff">Event Staff</option>
              <option value="registration_staff">Registration Staff</option>
            </NativeSelect>
          </div>
        </div>
      </CustomAlertDialog>

             {/* Status Toggle Confirmation Dialog */}
       <ConfirmationDialog
         open={statusToggleDialogOpen}
         onOpenChange={setStatusToggleDialogOpen}
         title={selectedUser?.isActive ? "Disable Staff Account" : "Enable Staff Account"}
         description={
           selectedUser?.isActive
             ? `Are you sure you want to disable ${selectedUser?.fullName}'s account? They will not be able to log in until the account is re-enabled.`
             : `Are you sure you want to enable ${selectedUser?.fullName}'s account? They will be able to log in again.`
         }
         confirmText={selectedUser?.isActive ? 'Disable Account' : 'Enable Account'}
         onConfirm={handleStatusToggle}
         onCancel={handleStatusToggleClose}
         variant={selectedUser?.isActive ? "destructive" : "default"}
         loading={toggleStatusMutation.isPending}
       />

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        pageSize={10}
        searchable={true}
        filterable={true}
        title="Users"
        onRowClick={handleRowClick}
                 loading={isLoading}
         emptyMessage="No users found"
        className="shadow-sm"
      />
    </PageLayout>
  )
}

export default UserManagement
