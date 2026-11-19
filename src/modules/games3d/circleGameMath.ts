export const CIRCLE_SEAT_COUNT = 6;
export const TWO_PI = Math.PI * 2;

export function getSeatAngle(seatIdx: number, seatCount: number = CIRCLE_SEAT_COUNT): number {
  return (seatIdx / seatCount) * TWO_PI;
}

/**
 * Finds the next seated participant following physical clockwise seat order
 * around the circle, avoiding zig-zagging after participants swap seats.
 */
export function findNextSeatedByCircleOrder(
  seatOfParticipant: readonly number[],
  currentParticipantIdx: number,
  fallbackSeatIdx: number = 0
): number {
  const count = seatOfParticipant.length;
  if (count === 0) return 0;

  const occupantSeat =
    currentParticipantIdx >= 0 && currentParticipantIdx < count
      ? seatOfParticipant[currentParticipantIdx]
      : -1;
  const startSeat = occupantSeat >= 0 ? occupantSeat : fallbackSeatIdx;

  for (let offset = 1; offset <= count; offset++) {
    const candidateSeat = (((startSeat + offset) % count) + count) % count;
    const occupantIdx = seatOfParticipant.indexOf(candidateSeat);
    if (occupantIdx !== -1) {
      return occupantIdx;
    }
  }

  return 0;
}

/**
 * Computes the forward race finish angle (~1 full lap clockwise) aligned
 * exactly with the goal seat angle.
 */
export function computeForwardLapTarget(
  startAngle: number,
  goalSeatIdx: number,
  minLapRadians: number = Math.PI * 1.45,
  seatCount: number = CIRCLE_SEAT_COUNT
): number {
  const goalBase = getSeatAngle(goalSeatIdx, seatCount);
  let target = goalBase;
  while (target <= startAngle + minLapRadians) {
    target += TWO_PI;
  }
  return target;
}

/**
 * Advances a walker monotonically forward around the circle toward a seat,
 * gently settling if already slightly past the stop offset.
 */
export function advanceMonotonicAngle(
  currentAngle: number,
  desiredAngle: number,
  maxStep: number
): number {
  const shortSigned = Math.atan2(
    Math.sin(desiredAngle - currentAngle),
    Math.cos(desiredAngle - currentAngle)
  );
  // If already at or slightly past the stop offset, settle smoothly instead of looping again
  if (Math.abs(shortSigned) < 0.035 || (shortSigned < 0 && shortSigned > -0.35)) {
    return currentAngle + shortSigned * Math.min(1, maxStep * 2.5);
  }
  const forwardDelta = (((desiredAngle - currentAngle) % TWO_PI) + TWO_PI) % TWO_PI;
  return currentAngle + Math.min(forwardDelta, maxStep);
}
