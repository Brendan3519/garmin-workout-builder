export type StepIntensity = "WARMUP" | "ACTIVE" | "COOLDOWN" | "RECOVERY" | "INTERVAL" | "REST";

export type DurationType = "DISTANCE" | "TIME";

export type Target = 
  | { targetType: "PACE"; paceMinValue: number; paceMaxValue: number }
  | { targetType: "HEART_RATE"; hrMinValue: number; hrMaxValue: number };

export interface WorkoutStep {
    stepOrder: number;
    intensity: StepIntensity;
    durationType: DurationType;
    durationValue: number;
    target?: Target;
}

export interface Workout {
    workoutName: string;
    sport: "RUNNING";
    steps: WorkoutStep[];
}

const sevenKRun: Workout = {
  workoutName: "Hard 7km Run",
  sport: "RUNNING",
  steps: [
    { stepOrder: 1, intensity: "WARMUP", durationType: "DISTANCE", durationValue: 1000 },
    { stepOrder: 2, 
      intensity: "ACTIVE", 
      durationType: "DISTANCE", 
      durationValue: 5000,
      target: {targetType: "PACE", paceMinValue: 3.8, paceMaxValue: 4.2 }
    },
    { stepOrder: 3, intensity: "COOLDOWN", durationType: "DISTANCE", durationValue: 1000 },
  ],
};