const NEXT_STATUS = {
  PLACED: 'PREPARING',
  PREPARING: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
}

export const NEXT_STATUS_LABEL = {
  PREPARING: 'Start preparing',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Mark delivered',
}

export function nextStatusFor(status) {
  return NEXT_STATUS[status]
}
