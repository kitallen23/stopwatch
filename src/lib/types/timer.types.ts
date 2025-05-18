export type Timer = {
    id: string;
    name: string;
    entries: TimerEntry[];
};

export type TimerEntry = {
    id: string;
    notes: string;
    times: TimeSegment[];
    createdAt?: number | null;
};

// Note that these numbers are timestamps (like Date().getTime())
export type TimeSegment = [number, number];
