"use client";

import { RepeatStep, WorkoutStep } from '../types/workout';

interface SortableRepeatStepProps {
    step: RepeatStep;
    renderStep: (step: WorkoutStep) => React.ReactNode;
}

function SortableRepeatStep({ step, renderStep }: SortableRepeatStepProps) {
    return (
        <div style={{ border: '1px solid #ccc', padding: '8px', margin: '4px 0' }}>
            <strong>🔁 Repeat ×{step.repeatValue}</strong>
            <div style={{ paddingLeft: '16px' }}>
                {step.steps.map((subStep) => renderStep(subStep))}
            </div>
        </div>
    );
}

export default SortableRepeatStep;