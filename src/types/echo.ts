export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface Session {
  id: string;
  listener_id: string;
  speaker_id: string;
  status: "waiting" | "active" | "ended";
  created_at: string;
}

export interface Badge {
  id: string;
  label: string;
  variant: "default" | "earned";
}
