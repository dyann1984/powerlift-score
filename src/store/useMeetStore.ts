"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LiftType = "squat" | "bench" | "deadlift";
export type AttemptStatus = "pending" | "valid" | "no_lift";

export type Attempt = {
  weight: number;
  status: AttemptStatus;
};

export type Athlete = {
  id: string;
  name: string;
  gender: "M" | "F";
  bodyweight: number;
  category: string;
  club: string;
  photo?: string;
  squat: Attempt[];
  bench: Attempt[];
  deadlift: Attempt[];
};

export type CurrentAttempt = {
  athleteId: string | null;
  lift: LiftType;
  index: number;
  weight: number;
};

type TimerState = "idle" | "running" | "paused" | "finished";

type MeetStore = {
  athletes: Athlete[];
  currentAttempt: CurrentAttempt;
  timerSeconds: number;
  timerState: TimerState;

  addAthlete: (athlete: Omit<Athlete, "id" | "squat" | "bench" | "deadlift">) => void;
  removeAthlete: (id: string) => void;
  setCurrentAttempt: (payload: Partial<CurrentAttempt>) => void;
  setAttemptWeight: (athleteId: string, lift: LiftType, index: number, weight: number) => void;
  setAttemptStatus: (athleteId: string, lift: LiftType, index: number, status: AttemptStatus) => void;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;

  getBestLift: (athlete: Athlete, lift: LiftType) => number;
  getTotal: (athlete: Athlete) => number;
  getRanking: () => Array<{
    rank: number;
    athlete: Athlete;
    squat: number;
    bench: number;
    deadlift: number;
    total: number;
  }>;
};

const emptyAttempts = (): Attempt[] => [
  { weight: 0, status: "pending" },
  { weight: 0, status: "pending" },
  { weight: 0, status: "pending" },
];

function calcCategory(gender: "M" | "F", bw: number) {
  if (gender === "M") {
    if (bw <= 59) return "59 kg";
    if (bw <= 66) return "66 kg";
    if (bw <= 74) return "74 kg";
    if (bw <= 83) return "83 kg";
    if (bw <= 93) return "93 kg";
    if (bw <= 105) return "105 kg";
    if (bw <= 120) return "120 kg";
    return "+120 kg";
  }

  if (bw <= 47) return "47 kg";
  if (bw <= 52) return "52 kg";
  if (bw <= 57) return "57 kg";
  if (bw <= 63) return "63 kg";
  if (bw <= 69) return "69 kg";
  if (bw <= 76) return "76 kg";
  if (bw <= 84) return "84 kg";
  return "+84 kg";
}

export const useMeetStore = create<MeetStore>()(
  persist(
    (set, get) => ({
      athletes: [],
      currentAttempt: {
        athleteId: null,
        lift: "squat",
        index: 0,
        weight: 0,
      },
      timerSeconds: 60,
      timerState: "idle",

      addAthlete: (athlete) =>
        set((state) => ({
          athletes: [
            ...state.athletes,
            {
              id: crypto.randomUUID(),
              ...athlete,
              category: athlete.category || calcCategory(athlete.gender, athlete.bodyweight),
              squat: emptyAttempts(),
              bench: emptyAttempts(),
              deadlift: emptyAttempts(),
            },
          ],
        })),

      removeAthlete: (id) =>
        set((state) => ({
          athletes: state.athletes.filter((a) => a.id !== id),
        })),

      setCurrentAttempt: (payload) =>
        set((state) => ({
          currentAttempt: { ...state.currentAttempt, ...payload },
          timerSeconds: 60,
          timerState: "idle",
        })),

      setAttemptWeight: (athleteId, lift, index, weight) =>
        set((state) => ({
          athletes: state.athletes.map((a) => {
            if (a.id !== athleteId) return a;
            const updated = [...a[lift]];
            updated[index] = { ...updated[index], weight };
            return { ...a, [lift]: updated };
          }),
        })),

      setAttemptStatus: (athleteId, lift, index, status) =>
        set((state) => ({
          athletes: state.athletes.map((a) => {
            if (a.id !== athleteId) return a;
            const updated = [...a[lift]];
            updated[index] = { ...updated[index], status };
            return { ...a, [lift]: updated };
          }),
        })),

      startTimer: () => set({ timerState: "running" }),
      pauseTimer: () => set({ timerState: "paused" }),
      resetTimer: () => set({ timerSeconds: 60, timerState: "idle" }),

      tick: () =>
        set((state) => {
          if (state.timerState !== "running") return state;
          if (state.timerSeconds <= 1) {
            return { timerSeconds: 0, timerState: "finished" };
          }
          return { timerSeconds: state.timerSeconds - 1 };
        }),

      getBestLift: (athlete, lift) => {
        return athlete[lift]
          .filter((a) => a.status === "valid")
          .reduce((max, a) => Math.max(max, a.weight || 0), 0);
      },

      getTotal: (athlete) => {
        const squat = get().getBestLift(athlete, "squat");
        const bench = get().getBestLift(athlete, "bench");
        const deadlift = get().getBestLift(athlete, "deadlift");
        return squat + bench + deadlift;
      },

      getRanking: () => {
        const { athletes } = get();

        return athletes
          .map((athlete) => {
            const squat = get().getBestLift(athlete, "squat");
            const bench = get().getBestLift(athlete, "bench");
            const deadlift = get().getBestLift(athlete, "deadlift");
            const total = squat + bench + deadlift;
            return { athlete, squat, bench, deadlift, total };
          })
          .sort((a, b) => {
            if (b.total !== a.total) return b.total - a.total;
            return a.athlete.bodyweight - b.athlete.bodyweight;
          })
          .map((item, index) => ({
            rank: index + 1,
            ...item,
          }));
      },
    }),
    {
      name: "powerlift-meet-store",
    }
  )
);