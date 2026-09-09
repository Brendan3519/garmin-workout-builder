"use client";

import { useState } from 'react';
import { StepIntensity, Workout, WorkoutStep, Target } from '../types/workout';
import posthog from 'posthog-js';
import SortableStep from './SortableStep';
import SortableRepeatStep from './SortableRepeatStep';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

interface WorkoutViewProps {
    workout: Workout;
}

export function isDurationDraftInvalid(draft: string | undefined) {
    return draft !== undefined && (draft === '' || isNaN(Number(draft)));
}

export function targetDraftKey(stepOrder: number, field: string) {
    return `${stepOrder}-${field}`;
}

function WorkoutView({ workout }: WorkoutViewProps) {
    const [workoutName, setWorkoutName] = useState(workout.workoutName);
    const [steps, setSteps] = useState(workout.steps);
    const [valueBeforeEdit, setValueBeforeEdit] = useState<number | null>(null);
    const [durationDrafts, setDurationDrafts] = useState<{ [stepOrder: number]: string }>({});
    const [targetDrafts, setTargetDrafts] = useState<{ [key: string]: string }>({});

    function handleDurationChange(targetStepOrder: number, newValue: number) {
        const updatedSteps = steps.map((step) =>
            step.stepOrder === targetStepOrder ? { ...step, durationValue: newValue } : step
        );
        setSteps(updatedSteps);
    }

    function handleDurationFocus(currentValue: number) {
        setValueBeforeEdit(currentValue);
    }

    function handleDurationBlur(step: WorkoutStep, newValue: number) {
        if (step.type !== "WorkoutStep") return;
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
            type: 'WorkoutStep',
            stepOrder: nextStepOrder,
            intensity: 'ACTIVE',
            durationType: 'DISTANCE',
            durationValue: 1000,
        };
        setSteps([...steps, newStep]);
    }

    function handleRemoveStep(targetStepOrder: number) {
        setSteps(steps.filter((step) => step.stepOrder !== targetStepOrder));
    }

    function handleIntensityChange(targetStepOrder: number, newIntensity: StepIntensity) {
        const updatedSteps = steps.map((step) =>
            step.stepOrder === targetStepOrder ? { ...step, intensity: newIntensity } : step
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
            step.stepOrder === targetStepOrder ? { ...step, target: newTarget } : step
        );
        setSteps(updatedSteps);
    }

    function handleRemoveTarget(targetStepOrder: number) {
        const updatedSteps = steps.map((step) =>
            step.stepOrder === targetStepOrder ? { ...step, target: undefined } : step
        );
        setSteps(updatedSteps);
    }

    function handleTargetValueChange(targetStepOrder: number, field: string, newValue: number) {
        const updatedSteps = steps.map((step) => {
            if (step.type !== "WorkoutStep") return step;
            if (step.stepOrder !== targetStepOrder || !step.target) return step;
            return { ...step, target: { ...step.target, [field]: newValue } as Target };
        });
        setSteps(updatedSteps);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }
        const oldIndex = steps.findIndex((step) => step.stepOrder === active.id);
        const newIndex = steps.findIndex((step) => step.stepOrder === over.id);
        setSteps(arrayMove(steps, oldIndex, newIndex));
    }

    function mapStepsRecursive(
    steps: WorkoutStep[],
    transform: (step: WorkoutStep) => WorkoutStep
): WorkoutStep[] {
    return steps.map((step) => {
        if (step.type === "WorkoutRepeatStep") {
            return transform({ ...step, steps: mapStepsRecursive(step.steps, transform) });
        }
        return transform(step);
    });
}

    function renderStep(step: WorkoutStep): React.ReactNode {
        if (step.type === "WorkoutRepeatStep") {
            return (
                <SortableRepeatStep
                    key={step.stepOrder}
                    step={step}
                    renderStep={renderStep}
                />
            );
        }
        return (
            <SortableStep
                key={step.stepOrder}
                step={step}
                durationDrafts={durationDrafts}
                setDurationDrafts={setDurationDrafts}
                targetDrafts={targetDrafts}
                setTargetDrafts={setTargetDrafts}
                handleDurationChange={handleDurationChange}
                handleDurationFocus={handleDurationFocus}
                handleDurationBlur={handleDurationBlur}
                handleRemoveStep={handleRemoveStep}
                handleIntensityChange={handleIntensityChange}
                handleTargetTypeChange={handleTargetTypeChange}
                handleRemoveTarget={handleRemoveTarget}
                handleTargetValueChange={handleTargetValueChange}
            />
        );
    }

    return (
        <div>
            <input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
            />
            <DndContext id="workout-dnd" onDragEnd={handleDragEnd}>
                <SortableContext
                    items={steps.map((step) => step.stepOrder)}
                    strategy={verticalListSortingStrategy}
                >
                    {steps.map((step) => renderStep(step))}
                </SortableContext>
            </DndContext>
            <button onClick={handleAddStep}>Add Step</button>
        </div>
    );
}

export default WorkoutView;