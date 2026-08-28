import WorkoutView from '../components/WorkoutView'
import { Workout } from '../types/workout'

const sevenKRun: Workout = {
  workoutName: 'Hard 7km Run',
  sport: 'RUNNING',
  steps: [
    { type: 'WorkoutStep', stepOrder: 1, intensity: 'WARMUP', durationType: 'DISTANCE', durationValue: 1000 },
    {
      type: 'WorkoutStep',
      stepOrder: 2,
      intensity: 'ACTIVE',
      durationType: 'DISTANCE',
      durationValue: 5000,
      target: { targetType: 'PACE', paceMinValue: 3.8, paceMaxValue: 4.2 },
    },
    { type: 'WorkoutStep', stepOrder: 3, intensity: 'COOLDOWN', durationType: 'DISTANCE', durationValue: 1000 },
  ],
};