export type StepIntensity = "WARMUP" | "ACTIVE" | "COOLDOWN" | "RECOVERY" | "INTERVAL" | "REST";

export type DurationType = "DISTANCE" | "TIME";

export type Target =
    | { targetType: "PACE"; paceMinValue: number; paceMaxValue: number }
    | { targetType: "HEART_RATE"; hrMinValue: number; hrMaxValue: number };

export interface NormalStep {
    type: "WorkoutStep";
    stepOrder: number;
    intensity: StepIntensity;
    durationType: DurationType;
    durationValue: number;
    target?: Target;
}

export interface RepeatStep {
    type: "WorkoutRepeatStep";
    stepOrder: number;
    repeatValue: number;
    steps: WorkoutStep[];
}

export type WorkoutStep = NormalStep | RepeatStep;

export interface Workout {
    workoutName: string;
    sport: "RUNNING";
    steps: WorkoutStep[];
}
