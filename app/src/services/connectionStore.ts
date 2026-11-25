import { create } from 'zustand';

export type ConnectionStatus = 'connecting' | 'online' | 'offline';

interface ConnectionState {
  status: ConnectionStatus;
  setStatus: (status: ConnectionStatus) => void;
}

/** Live connection status to the game server, shown by the offline banner. */
export const useConnectionStore = create<ConnectionState>()((set) => ({
  status: 'connecting',
  setStatus: (status) => set({ status }),
}));
