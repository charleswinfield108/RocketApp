export const ORDER_STATUS = {
  PENDING: { id: 1, label: 'pending', display: 'PENDING', color: '#C1392B' },
  IN_PROGRESS: { id: 2, label: 'in progress', display: 'IN PROGRESS', color: '#E67E22' },
  DELIVERED: { id: 3, label: 'delivered', display: 'DELIVERED', color: '#27AE60' },
} as const;

export const NEXT_STATUS_ID: Record<string, number> = {
  'pending': ORDER_STATUS.IN_PROGRESS.id,
  'in progress': ORDER_STATUS.DELIVERED.id,
};

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':     return ORDER_STATUS.PENDING.color;
    case 'in progress': return ORDER_STATUS.IN_PROGRESS.color;
    case 'delivered':   return ORDER_STATUS.DELIVERED.color;
    default:            return '#999999';
  }
}

export function getStatusDisplay(status: string): string {
  switch (status) {
    case 'pending':     return ORDER_STATUS.PENDING.display;
    case 'in progress': return ORDER_STATUS.IN_PROGRESS.display;
    case 'delivered':   return ORDER_STATUS.DELIVERED.display;
    default:            return status.toUpperCase();
  }
}
