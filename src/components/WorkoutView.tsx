"use client";

import { useState } from 'react';
import { Workout, WorkoutStep } from '../types/workout';
import posthog from 'posthog-js';

interface WorkoutViewProps {
    workout: Workout;
}

function WorkoutView({ workout }: WorkoutViewProps) {
    const [workoutName, setWorkoutName] = useState(workout.workoutName);
    const [steps, setSteps] = useState(workout.steps);
    const [valueBeforeEdit, setValueBeforeEdit] = useState<number | null>(null);

    function handleDurationChange(targetStepOrder: number, newValue: number) {
        const updatedSteps = steps.map((step) => 
            step.stepOrder === targetStepOrder
            ? {...step, durationValue: newValue }
            : {...step}
        );
        setSteps(updatedSteps);
    }

    function handleDurationFocus(currentValue: number) {
        setValueBeforeEdit(currentValue)
    }

    function handleDurationBlur(step: WorkoutStep) {
        if (valueBeforeEdit !== null 
            //&& step.durationValue !== valueBeforeEdit
            ) {
            posthog.capture('workout_duration_edited', {
                step_order: step.stepOrder,
                intensity: step.intensity,
                old_value: valueBeforeEdit,
                new_value: step.durationValue,
            })
        }
        setValueBeforeEdit(null);
    }

    return (
        <div>
            <input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
            />
           {steps.map((step) => (
            <p key={step.stepOrder}>
                {step.intensity}:{' '}
                <input
                    type="number"
                    value={step.durationValue}
                    onChange={(e) => handleDurationChange(step.stepOrder, Number(e.target.value))}
                    onFocus={() => handleDurationFocus(step.durationValue)}
                    onBlur={() => handleDurationBlur(step)}
                />
                m ({step.durationType})
                {step.target?.targetType && <span> - target: {step.target.targetType}</span>}
            </p>
           ))}
        </div>
    );
}

export default WorkoutView;