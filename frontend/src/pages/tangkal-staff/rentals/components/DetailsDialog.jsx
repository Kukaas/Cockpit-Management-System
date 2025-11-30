import React from 'react'
import { Button } from '@/components/ui/button'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import { formatDate } from '@/lib/utils'

const DetailsDialog = ({
  open,
  onOpenChange,
  selectedItem,
  formatDate,
  formatCurrency
}) => {
  if (!selectedItem) return null


  const renderRentalDetails = (rental) => (
    <div className="space-y-6">
      {/* Rental Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">🏠</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Rental Information</h3>
            <p className="text-sm text-gray-500">Cage rental details and specifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Renter Name</label>
              <p className="mt-1 text-sm text-gray-900">{rental.nameOfRenter || 'N/A'}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Number</label>
              <p className="mt-1 text-sm text-gray-900">{rental.contactNumber || 'N/A'}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rental Date</label>
              <p className="mt-1 text-sm text-gray-900">{rental.date ? formatDate(rental.date) : 'N/A'}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Arena</label>
              <p className="mt-1 text-sm text-gray-900">{rental.arena || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</label>
              <p className="mt-1 text-sm text-gray-900">{rental.quantity || 0} cage{(rental.quantity || 0) > 1 ? 's' : ''}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Price</label>
              <p className="mt-1 text-lg font-semibold text-green-700">{formatCurrency(rental.totalPrice || 0)}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Status</label>
              <div className="mt-1">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${rental.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {rental.paymentStatus ? rental.paymentStatus.charAt(0).toUpperCase() + rental.paymentStatus.slice(1) : 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rental Status</label>
              <div className="mt-1">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${rental.rentalStatus === 'returned' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                  {rental.rentalStatus ? rental.rentalStatus.charAt(0).toUpperCase() + rental.rentalStatus.slice(1) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cage Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 font-semibold text-lg">🔢</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Cage Details</h3>
            <p className="text-sm text-gray-500">Rented cages and their specifications</p>
          </div>
        </div>

        <div className="space-y-3">
          {rental.cages?.map((cage, index) => (
            <div key={cage._id || index} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Cage {index + 1}</h4>
                  <p className="text-xs text-gray-500">Rental Unit</p>
                </div>
              </div>

              <div className="bg-white rounded-md p-3 border border-gray-100">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Cage Number</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">#{cage.cageNo?.cageNumber || cage.cageNo || 'N/A'}</p>
              </div>

              {(cage.cageNo?.description || cage.cageNo?.location) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {cage.cageNo?.description && (
                    <div className="bg-white rounded-md p-2 border border-gray-100">
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Description</label>
                      <p className="mt-1 text-sm text-gray-700">{cage.cageNo.description}</p>
                    </div>
                  )}

                  {cage.cageNo?.location && (
                    <div className="bg-white rounded-md p-2 border border-gray-100">
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Location</label>
                      <p className="mt-1 text-sm text-gray-700">{cage.cageNo.location}</p>
                    </div>
                  )}
                </div>
              )}
              <div>
                {cage.returnedAt ? (
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    Returned {formatDate(cage.returnedAt)}
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Active
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Information */}
      {rental.eventID && rental.eventID._id && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-lg">🎯</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Event Information</h3>
              <p className="text-sm text-gray-500">Associated event details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Event Name</label>
                <p className="mt-1 text-sm text-gray-900">{rental.eventID?.eventName || 'N/A'}</p>
              </div>

            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Event Date</label>
              <p className="mt-1 text-sm text-gray-900">{rental.eventID?.date ? formatDate(rental.eventID.date) : 'N/A'}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Event Location</label>
              <p className="mt-1 text-sm text-gray-900">{rental.eventID?.location || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <span className="text-emerald-600 font-semibold text-lg">💰</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Financial Summary</h3>
            <p className="text-sm text-gray-500">Payment and pricing details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Price</label>
            <p className="mt-2 text-xl font-semibold text-emerald-700">{formatCurrency(rental.totalPrice || 0)}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</label>
            <p className="mt-2 text-xl font-semibold text-blue-700">{rental.quantity || 0} cage{(rental.quantity || 0) > 1 ? 's' : ''}</p>
          </div>

        </div>
      </div>
    </div>
  )

  return (
    <CustomAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rental Details"
      description="Detailed information about this cage rental"
      maxHeight="max-h-[85vh]"
      actions={
        <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
          Close
        </Button>
      }
    >
      <div className="overflow-y-auto pr-2">
        {renderRentalDetails(selectedItem)}
      </div>
    </CustomAlertDialog>
  )
}

export default DetailsDialog
