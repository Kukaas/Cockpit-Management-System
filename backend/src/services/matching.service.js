import CockProfile from '../models/cockProfile.model.js';
import FightSchedule from '../models/fightSchedule.model.js';
import Event from '../models/event.model.js';

/**
 * Attempts to find a match for a newly registered cock profile.
 * Only applies to non-derby events as per requirements.
 *
 * @param {Object} newCock - The newly created cock profile document
 * @param {string} scheduledBy - The ID of the user who scheduled the fight (current user)
 * @returns {Object|null} - The created fight schedule or null if no match found
 */
export const matchAndScheduleFight = async (newCock, scheduledBy) => {
    try {
        // 1. Get event details to check type
        const event = await Event.findById(newCock.eventID);

        // As per user request: "all events except derby"
        if (!event || event.eventType === 'derby') {
            return null;
        }

        // 2. Find available cocks for the same event
        // Must be different participant and currently available
        const availableCocks = await CockProfile.find({
            eventID: newCock.eventID,
            status: 'available',
            isActive: true,
            _id: { $ne: newCock._id },
            participantID: { $ne: newCock.participantID }
        });

        if (availableCocks.length === 0) {
            return null;
        }

        // 3. Selection strategy:
        // If weights are provided, we try to match by closest weight for fairness.
        // Otherwise, we just take the first available cock.
        let opponent = null;

        if (newCock.weight) {
            let minDiff = Infinity;
            for (const cock of availableCocks) {
                if (cock.weight) {
                    const diff = Math.abs(newCock.weight - cock.weight);
                    if (diff < minDiff) {
                        minDiff = diff;
                        opponent = cock;
                    }
                }
            }
        }

        // Fallback to first available if no specific weight match was found or preferred
        if (!opponent) {
            opponent = availableCocks[0];
        }

        // 4. Create the fight schedule
        // Get the last fight number for this event to determine the next one
        const lastFight = await FightSchedule.findOne({ eventID: newCock.eventID }).sort({ fightNumber: -1 });
        const fightNumber = lastFight ? lastFight.fightNumber + 1 : 1;

        const fightSchedule = new FightSchedule({
            eventID: newCock.eventID,
            participantsID: [newCock.participantID, opponent.participantID],
            cockProfileID: [newCock._id, opponent._id],
            fightNumber,
            scheduledBy
        });

        await fightSchedule.save();

        // 5. Update both cocks' status to 'scheduled'
        // Update newCock
        newCock.status = 'scheduled';
        await newCock.save();

        // Update opponent
        opponent.status = 'scheduled';
        await opponent.save();

        return fightSchedule;
    } catch (error) {
        console.error('Error in real-time matching service:', error);
        return null; // Fail gracefully to not block registration
    }
};
