import React, { useState } from 'react'
import DataTable from '@/components/custom/DataTable'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, Trash2, Eye, UserPlus } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import api from '@/services/api'
import { toast } from 'sonner'
import NativeSelect from '@/components/custom/NativeSelect'

const UserManagement = () => {
  const [loading, setLoading] = useState(false)
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  })

  // Fetch users on component mount
  React.useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/staff')
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

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

    try {
      setLoading(true)
      const response = await api.post('/staff', formData)

      if (response.data.success) {
        toast.success('User created successfully')
        handleDialogClose()
        fetchUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Error creating user:', error)
      const message = error.response?.data?.message || 'Failed to create user'
      toast.error(message)
    } finally {
      setLoading(false)
    }
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
              handleViewUser(row)
            }}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
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
              handleDeleteUser(row)
            }}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  // Action handlers
  const handleViewUser = (user) => {
    console.log('View user:', user)
    // Implement view user logic
  }

  const handleEditUser = (user) => {
    console.log('Edit user:', user)
    // Implement edit user logic
  }

  const handleDeleteUser = (user) => {
    console.log('Delete user:', user)
    // Implement delete user logic with confirmation
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
            <Button onClick={handleAddUser} disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
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

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        pageSize={10}
        searchable={true}
        filterable={true}
        title="Users"
        onRowClick={handleRowClick}
        loading={loading}
        emptyMessage="No users found"
        className="shadow-sm"
      />
    </PageLayout>
  )
}

export default UserManagement
