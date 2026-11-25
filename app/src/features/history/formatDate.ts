/** "25 Nov, 15:42" in the phone's own language and time format. */
export const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
