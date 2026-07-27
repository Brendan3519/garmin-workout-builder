"use client";

import { useState } from 'react';
import { StepIntensity, Workout, WorkoutStep } from '../types/workout';
import posthog from 'posthog-js';

interface WorkoutViewProps {
    workout: Workout;
}

function isDurationDraftInvalid(draft: string | undefined) {
    return draft !== undefined && (draft === '' || isNaN(Number(draft)));
}

function WorkoutView({ workout }: WorkoutViewProps) {
    const [workoutName, setWorkoutName] = useState(workout.workoutName);
    const [steps, setSteps] = useState(workout.steps);
    const [valueBeforeEdit, setValueBeforeEdit] = useState<number | null>(null);
    const [durationDrafts, setDurationDrafts] = useState<{ [stepOrder: number]: string }>({});

    function handleDurationChange(targetStepOrder: number, newValue: number) {
        const updatedSteps = steps.map((step) =>
            step.stepOrder === targetStepOrder
                ? { ...step, durationValue: newValue }
                : step
        );
        setSteps(updatedSteps);
    }

    function handleDurationFocus(currentValue: number) {
        setValueBeforeEdit(currentValue);
    }

    function handleDurationBlur(step: WorkoutStep, newValue: number) {
        if (valueBeforeEdit !== null && newValue !== valueBeforeEdit) {
            posthog.capture('workout_duration_edited', {
                step_order: step.stepOrder,
                intensity: step.intensity,
                old_value: valueBeforeEdit,
                new_value: newValue,
            });
        }
        setValueBeforeEdit(null);
    }

    function handleAddStep() {
        const nextStepOrder = steps.length > 0
            ? Math.max(...steps.map((step) => step.stepOrder)) + 1
            : 1;

        const newStep: WorkoutStep = {
            stepOrder: nextStepOrder,
            intensity: 'ACTIVE',
            durationType: 'DISTANCE',
            durationValue: 1000,
        };

        setSteps([...steps, newStep]);
    }

    function handleRemoveStep(targetStepOrder: number) {
        setSteps(steps.filter((step) => step.stepOrder != targetStepOrder))
    }

    function handleIntensityChange(targetStepOrder: number, newIntensity: StepIntensity){
        const updatedSteps = steps.map((step) =>
            step.stepOrder === targetStepOrder
                ? {...step, intensity: newIntensity}
                : step
            );
            setSteps(updatedSteps);
    }

    return (
        <div>
            <input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
            />
            {steps.map((step) => {
                const draft = durationDrafts[step.stepOrder];
                const showError = isDurationDraftInvalid(draft);

                return (
                    <p key={step.stepOrder}>
                        <select
                            value={step.intensity}
                            onChange={(e) => handleIntensityChange(step.stepOrder, e.target.value as StepIntensity)}
                        >
                            <option value="WARMUP">WARMUP</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="COOLDOWN">COOLDOWN</option>
                            <option value="RECOVERY">RECOVERY</option>
                            <option value="INTERVAL">INTERVAL</option>
                            <option value="REST">REST</option>
                        </select>
                        {' '}
                        <input
                            type="number"
                            value={draft ?? step.durationValue}
                            placeholder="0"
                            onChange={(e) =>
                                setDurationDrafts({ ...durationDrafts, [step.stepOrder]: e.target.value })
                            }
                            onFocus={() => handleDurationFocus(step.durationValue)}
                            onBlur={() => {
                                const isValid = !isDurationDraftInvalid(draft);
                                const newValue = isValid ? Number(draft) : step.durationValue;
                                if (isValid && draft !== undefined) {
                                    handleDurationChange(step.stepOrder, newValue);
                                }
                                handleDurationBlur(step, newValue);
                            }}
                            style={showError ? { borderColor: 'red' } : undefined}
                        />
                        m ({step.durationType})
                        {showError && <span style={{ color: 'red' }}> Value cannot be blank</span>}
                        {step.target?.targetType && <span> - target: {step.target.targetType}</span>}
                        <button onClick={() => handleRemoveStep(step.stepOrder)}>Remove</button>
                    </p>
                );
            })}
            <button onClick={handleAddStep}>Add Step</button>
        </div>
    );
}

export default WorkoutView;