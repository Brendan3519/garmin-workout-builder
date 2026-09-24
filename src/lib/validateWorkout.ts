 import { Workout, WorkoutStep, Target } from '../types/workout';

 const VALID_INTENSITIES = ["WARMUP", "ACTIVE", "COOLDOWN", "RECOVERY", "INTERVAL", "REST"];
 const VALID_DURATION_TYPES = ["DISTANCE", "TIME"];
 
export function isValidWorkout(input: unknown): input is Workout {
    if (!(typeof input === "object" && 
      input !== null)) return false;

    const obj = input as Record<string, unknown>;

    return typeof obj.workoutName === "string" && 
    obj.sport === "RUNNING" && 
    Array.isArray(obj.steps) && 
    obj.steps.every(isValidStep);
 }

 function isValidStep(input: unknown): input is WorkoutStep {
    if (!(typeof input === "object" && input !== null)) return false;

    const obj = input as Record<string, unknown>;
    if (obj.type === "WorkoutStep"){
      return typeof obj.intensity === "string" && 
      VALID_INTENSITIES.includes(obj.intensity) && 
      typeof obj.stepOrder === "number" && 
      typeof obj.durationValue === "number" &&
      obj.durationValue > 0 &&
      typeof obj.durationType === "string" &&
      VALID_DURATION_TYPES.includes(obj.durationType) &&
      (obj.target === undefined || isValidTarget(obj.target));
    }

    if (obj.type === "WorkoutRepeatStep"){
      return typeof obj.stepOrder === "number" && 
      typeof obj.repeatValue === "number" && 
      Number.isInteger(obj.repeatValue) &&
      obj.repeatValue >= 1 &&
      Array.isArray(obj.steps) && 
      obj.steps.every(isValidStep);
    }

    return false;
 }

 function isValidTarget(input: unknown): input is Target {
   if (!(typeof input === "object" && input !== null)) return false;

   const obj = input as Record<string, unknown>;
   if (obj.targetType === "PACE"){
      return typeof obj.paceMinValue === "number" && 
      obj.paceMinValue > 0 &&
      typeof obj.paceMaxValue === "number" &&
      obj.paceMaxValue > 0;
   }

   if (obj.targetType === "HEART_RATE"){
      return typeof obj.hrMinValue === "number" && 
      obj.hrMinValue > 0 &&
      typeof obj.hrMaxValue === "number" &&
      obj.hrMaxValue > 0;
   }

   return false;

 }