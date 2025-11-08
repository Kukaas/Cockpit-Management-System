import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'

const DetailsDialog = ({
  open,
  onOpenChange,
  selectedItem,
  formatDate,
  formatCurrency,
  event = null
}) => {
  if (!selectedItem) return null

  const renderFightDetails = (fight) => (
    <div className="space-y-6">
      {/* Fight Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">#</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Fight Information</h3>
            <p className="text-sm text-gray-500">Fight #{fight.fightNumber}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${fight.status === 'completed' ? 'bg-green-100 text-green-800' :
                    fight.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      fight.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {fight.status.replace('_', ' ').charAt(0).toUpperCase() + fight.status.replace('_', ' ').slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 font-semibold text-lg">👥</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Participants</h3>
            <p className="text-sm text-gray-500">Fight participants and their details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fight.participantsID?.map((participant, index) => (
            <div key={participant._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <h4 className="font-medium text-gray-900">Participant {index + 1}</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{participant.participantName}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</label>
                  <p className="mt-1 text-sm text-gray-900">{participant.contactNumber}</p>
                </div>

                {participant.email && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{participant.email}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cock Profiles */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 font-semibold text-lg">🐓</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Cock Profiles</h3>
            <p className="text-sm text-gray-500">Cock details and specifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fight.cockProfileID?.map((cock, index) => (
            <div key={cock._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <h4 className="font-medium text-gray-900">Cock {index + 1}</h4>
              </div>

              <div className="space-y-3">
                {/* Entry Number - shown for all events */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entry Number</label>
                  <p className="mt-1 text-sm text-gray-900">#{cock.entryNo}</p>
                </div>

                {/* Leg Band and Weight - only shown for derby events */}
                {event?.eventType === 'derby' && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Leg Band</label>
                      <p className="mt-1 text-sm text-gray-900">{cock.legband || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</label>
                      <p className="mt-1 text-sm text-gray-900">{cock.weight ? `${cock.weight}kg` : 'N/A'}</p>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${cock.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {cock.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMatchResultDetails = (result) => (
    <div className="space-y-6">
      {/* Match Result Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <span className="text-emerald-600 font-semibold text-lg">🏆</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Match Result</h3>
            <p className="text-sm text-gray-500">Fight #{result.matchID?.fightNumber} - {result.status}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
              <div className="mt-1">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${result.status === 'final' ? 'bg-green-100 text-green-800' :
                  result.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Match Type</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{result.resultMatch?.matchType}</p>
            </div>
          </div>

          {/* Only show match timing for fastest kill events */}
          {event?.eventType === 'fastest_kill' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Match Time</label>
                <p className="mt-1 text-sm text-gray-900">
                  {result.matchTimeSeconds ? (() => {
                    const minutes = Math.floor(result.matchTimeSeconds / 60)
                    const seconds = (result.matchTimeSeconds % 60).toFixed(2)
                    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
                  })() : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Betting Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">₱</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Betting Information</h3>
            <p className="text-sm text-gray-500">Bet amounts and payouts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Bet Pool</label>
            <p className="mt-1 text-lg font-semibold text-blue-700">{formatCurrency(result.totalBetPool)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Plazada</label>
            <p className="mt-1 text-lg font-semibold text-emerald-700">{formatCurrency(result.totalPlazada)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bet Winner</label>
            <div className="mt-1">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${result.betWinner === 'Meron' ? 'bg-blue-100 text-blue-800' :
                result.betWinner === 'Wala' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                {result.betWinner}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {result.participantBets?.map((bet) => (
            <div key={bet.participantID._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${bet.position === 'Meron' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                <h4 className="font-medium text-gray-900">{bet.position}</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Participant</label>
                  <p className="mt-1 text-sm text-gray-900">{bet.participantID.participantName}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bet Amount</label>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{formatCurrency(bet.betAmount)}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {result.betWinner === bet.position ? 'Plazada (Winner - No Plazada)' : 'Plazada (10% - Loser)'}
                  </label>
                  <p className="mt-1 text-sm font-semibold text-emerald-600">
                    {result.betWinner === bet.position ? '₱0' : formatCurrency(bet.betAmount * 0.10)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Winner & Loser */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 font-semibold text-lg">🏅</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Winner & Loser</h3>
            <p className="text-sm text-gray-500">Match outcome details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h4 className="font-medium text-green-800">Winner</h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Participant</label>
                <p className="mt-1 text-sm text-gray-900">{result.resultMatch?.winnerParticipantID?.participantName}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entry Number</label>
                <p className="mt-1 text-sm text-gray-900">#{result.resultMatch?.winnerCockProfileID?.entryNo}</p>
              </div>

              {event?.eventType === 'derby' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Leg Band</label>
                    <p className="mt-1 text-sm text-gray-900">{result.resultMatch?.winnerCockProfileID?.legband || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</label>
                    <p className="mt-1 text-sm text-gray-900">{result.resultMatch?.winnerCockProfileID?.weight ? `${result.resultMatch?.winnerCockProfileID?.weight}kg` : 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <h4 className="font-medium text-red-800">Loser</h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Participant</label>
                <p className="mt-1 text-sm text-gray-900">{result.resultMatch?.loserParticipantID?.participantName}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entry Number</label>
                <p className="mt-1 text-sm text-gray-900">#{result.resultMatch?.loserCockProfileID?.entryNo}</p>
              </div>

              {event?.eventType === 'derby' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Leg Band</label>
                    <p className="mt-1 text-sm text-gray-900">{result.resultMatch?.loserCockProfileID?.legband || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</label>
                    <p className="mt-1 text-sm text-gray-900">{result.resultMatch?.loserCockProfileID?.weight ? `${result.resultMatch?.loserCockProfileID?.weight}kg` : 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payout Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 font-semibold text-lg">💰</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Payout Information</h3>
            <p className="text-sm text-gray-500">Financial details and payouts</p>
          </div>
        </div>

        {(() => {
          const bets = result.participantBets || []
          const meron = bets.find(b => b.position === 'Meron')
          const wala = bets.find(b => b.position === 'Wala')
          const meronAmt = meron?.betAmount || 0
          const walaAmt = wala?.betAmount || 0
          const winnerIsMeron = result.betWinner === 'Meron'
          const outsideBets = Math.max(0, meronAmt - walaAmt)

          // Plazada is collected from the loser (10% of loser's bet)
          const loserBetAmt = winnerIsMeron ? walaAmt : result.betWinner === 'Wala' ? meronAmt : 0
          const totalPlazada = loserBetAmt * 0.10

          // Winner gets their bet amount back (no plazada deduction)
          const meronPayout = winnerIsMeron ? meronAmt : 0
          const walaPayout = !winnerIsMeron && result.betWinner === 'Wala' ? walaAmt : 0

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Meron Payout</label>
                <p className="mt-2 text-xl font-semibold text-purple-700">{formatCurrency(meronPayout)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Wala Payout</label>
                <p className="mt-2 text-xl font-semibold text-purple-700">{formatCurrency(walaPayout)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outside Bets</label>
                <p className="mt-2 text-xl font-semibold text-purple-700">{formatCurrency(outsideBets)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Plazada (from Loser)</label>
                <p className="mt-2 text-xl font-semibold text-emerald-700">{formatCurrency(totalPlazada)}</p>
              </div>
            </div>
          )
        })()}



        {/* Championship Progress for Derby Events */}
        {event?.eventType === 'derby' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold text-sm">🏆</span>
              </div>
              <h4 className="font-semibold text-yellow-800">Championship Progress</h4>
            </div>
            <div className="text-sm text-yellow-700">
              <p>This match contributes to the derby championship. Participants need {event.noCockRequirements} wins to become champions.</p>
              <p className="mt-2">
                <strong>Winner:</strong> {result.resultMatch?.winnerParticipantID?.participantName} -
                Check the Championship tab for current standings and prize distribution.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <CustomAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${selectedItem?.type === 'fight' ? 'Fight Schedule' : 'Match Result'} Details`}
      description={`Detailed information for ${selectedItem?.type === 'fight' ? 'this fight schedule' : 'this match result'}`}
      maxHeight="max-h-[85vh]"
      actions={
        <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
          Close
        </Button>
      }
    >
      <div className="overflow-y-auto pr-2">
        {selectedItem?.type === 'fight'
          ? renderFightDetails(selectedItem)
          : renderMatchResultDetails(selectedItem)
        }
      </div>
    </CustomAlertDialog>
  )
}

export default DetailsDialog
