 import { Workout, WorkoutStep } from '../types/workout';
 
 function isValidWorkout(input: unknown): input is Workout {
    if (!(typeof input === "object" && input !== null)) return false;

    const obj = input as Record<string, unknown>;
    return typeof obj.workoutName === "string" && obj.sport === "RUNNING" && Array.isArray(obj.steps) && obj.steps.every(isValidStep);
 }

 function isValidStep(input: unknown): input is WorkoutStep {
    if (!(typeof input === "object" && input !== null)) return false;

    return true;
 }