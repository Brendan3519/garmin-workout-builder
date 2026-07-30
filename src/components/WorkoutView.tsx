"use client";

import { useState } from 'react';
import { StepIntensity, Workout, WorkoutStep, Target } from '../types/workout';
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
    const [targetDrafts, setTargetDrafts] = useState<{ [key: string]: string }>({});

function targetDraftKey(stepOrder: number, field: string){
    return `${stepOrder}-${field}`;
}

function handleTargetValueChange(targetStepOrder: number, field: string, newValue: number) {
    const updatedSteps = steps.map((step) => {
        if (step.stepOrder !== targetStepOrder || !step.target) return step;
        return {...step, target: {...step.target, [field]: newValue } as Target};
    });
    setSteps(updatedSteps);
}

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

function handleRemoveTarget(targetStepOrder: number) {
    const updatedSteps = steps.map((step) =>
        step.stepOrder === targetStepOrder
            ? {...step, target: undefined}
        : step
    );
    setSteps(updatedSteps)
}


function handleIntensityChange(targetStepOrder: number, newIntensity: StepIntensity){
    const updatedSteps = steps.map((step) =>
        step.stepOrder === targetStepOrder
            ? {...step, intensity: newIntensity}
            : step
        );
        setSteps(updatedSteps);
}

function handleTargetTypeChange(targetStepOrder: number, newTargetType: 'PACE' | 'HEART_RATE') {
let newTarget: Target;

switch (newTargetType) {
    case 'PACE':
        newTarget = { targetType: "PACE", paceMinValue: 0.0, paceMaxValue: 0.0 };
        break;
    case 'HEART_RATE':
        newTarget = { targetType: "HEART_RATE", hrMinValue: 0.0, hrMaxValue: 0.0 };
        break;
    default:
        throw new Error(`Unhandled target type: ${newTargetType}`);
}

const updatedSteps = steps.map((step) =>
    step.stepOrder === targetStepOrder
        ? { ...step, target: newTarget }
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
                        <select
                            value={step.target?.targetType ?? 'NONE'}
                            onChange={(e) => {
                                const selected = e.target.value;
                                if (selected === 'NONE') {
                                    handleRemoveTarget(step.stepOrder);
                                } else {
                                    handleTargetTypeChange(step.stepOrder, selected as 'PACE' | 'HEART_RATE');
                                }
                            }}
                        >
                            <option value='NONE'>No Target</option>
                            <option value='PACE'>PACE</option>
                            <option value='HEART_RATE'>HEART_RATE</option>
                        </select>
                        {step.target?.targetType === 'PACE' && (
                            <>
                                {' '}Pace:{' '}
                                <input
                                    type="number"
                                    value={targetDrafts[targetDraftKey(step.stepOrder, 'paceMinValue')] ?? step.target.paceMinValue}
                                    onChange={(e) => setTargetDrafts({...targetDrafts, [targetDraftKey(step.stepOrder, 'paceMinValue')]: e.target.value})}
                                    onBlur={() => {
                                        const draft = targetDrafts[targetDraftKey(step.stepOrder, 'paceMinValue')];
                                        if (draft !== undefined && draft !== '' && !isNaN(Number(draft))) {
                                            handleTargetValueChange(step.stepOrder, 'paceMinValue', Number(draft));
                                        }
                                    }}
                                />
                                {' to '}
                                <input
                                    type="number"
                                    value={targetDrafts[targetDraftKey(step.stepOrder, 'paceMaxValue')] ?? step.target.paceMaxValue}
                                    onChange={(e) => setTargetDrafts({ ...targetDrafts, [targetDraftKey(step.stepOrder, 'paceMaxValue')]: e.target.value })}
                                    onBlur={() => {
                                        const draft = targetDrafts[targetDraftKey(step.stepOrder, 'paceMaxValue')];
                                        if (draft !== undefined && draft !== '' && !isNaN(Number(draft))) {
                                            handleTargetValueChange(step.stepOrder, 'paceMaxValue', Number(draft));
                                        }
                                    }}
                                />
                            </>
                        )}
                        {step.target?.targetType === 'HEART_RATE' && (
                            <>
                                {' '}HR:{' '}
                                <input
                                    type="number"
                                    value={targetDrafts[targetDraftKey(step.stepOrder, 'hrMinValue')] ?? step.target.hrMinValue}
                                    onChange={(e) => setTargetDrafts({ ...targetDrafts, [targetDraftKey(step.stepOrder, 'hrMinValue')]: e.target.value })}
                                    onBlur={() => {
                                        const draft = targetDrafts[targetDraftKey(step.stepOrder, 'hrMinValue')];
                                        if (draft !== undefined && draft !== '' && !isNaN(Number(draft))) {
                                            handleTargetValueChange(step.stepOrder, 'hrMinValue', Number(draft));
                                        }
                                    }}
                                />
                                {' to '}
                                <input
                                    type="number"
                                    value={targetDrafts[targetDraftKey(step.stepOrder, 'hrMaxValue')] ?? step.target.hrMaxValue}
                                    onChange={(e) => setTargetDrafts({ ...targetDrafts, [targetDraftKey(step.stepOrder, 'hrMaxValue')]: e.target.value })}
                                    onBlur={() => {
                                        const draft = targetDrafts[targetDraftKey(step.stepOrder, 'hrMaxValue')];
                                        if (draft !== undefined && draft !== '' && !isNaN(Number(draft))) {
                                            handleTargetValueChange(step.stepOrder, 'hrMaxValue', Number(draft));
                                        }
                                    }}
                                />
                            </>
                        )}
                        <button onClick={() => handleRemoveStep(step.stepOrder)}>Remove</button>
                    </p>
                );
            })}
            <button onClick={handleAddStep}>Add Step</button>
        </div>
    );
}

export default WorkoutView;