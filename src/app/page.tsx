import WorkoutView from '../components/WorkoutView';
import { Workout } from '../types/workout';

const sevenKRun: Workout = {
  workoutName: 'Hard 7km Run',
  sport: 'RUNNING',
  steps: [
    { type: 'WorkoutStep', stepOrder: 1, intensity: 'WARMUP', durationType: 'DISTANCE', durationValue: 1000 },
    {
      type: 'WorkoutRepeatStep',
      stepOrder: 2,
      repeatValue: 4,
      steps: [
        { type: 'WorkoutStep', stepOrder: 21, intensity: 'ACTIVE', durationType: 'DISTANCE', durationValue: 400 },
        { type: 'WorkoutStep', stepOrder: 22, intensity: 'RECOVERY', durationType: 'DISTANCE', durationValue: 200 },
      ],
    },
    { type: 'WorkoutStep', stepOrder: 3, intensity: 'COOLDOWN', durationType: 'DISTANCE', durationValue: 1000 },
  ],
};

export default function Home() {
  return <WorkoutView workout={sevenKRun} />;
}