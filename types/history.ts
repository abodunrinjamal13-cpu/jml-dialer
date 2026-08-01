export type CallType = "incoming" | "outgoing" | "missed";
export type CallStatus = "answered" | "missed" | "rejected";

export interface HistoryItemType {
  id: string;
  name: string;
  number: string;
  type: CallType;
  status: CallStatus;
  duration?: number;
  timestamp: string;
}
