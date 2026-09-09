"use client";

import { RepeatStep, WorkoutStep } from '../types/workout';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableRepeatStepProps {
    step: RepeatStep;
    renderStep: (step: WorkoutStep) => React.ReactNode;
}

function SortableRepeatStep({ step, renderStep }: SortableRepeatStepProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.stepOrder });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div ref={setNodeRef} style={style}>
            <span {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: '8px' }}>
                ☰
            </span>
            <strong>🔁 Repeat ×{step.repeatValue}</strong>
            <div style={{ paddingLeft: '16px' }}>
                {step.steps.map((subStep) => renderStep(subStep))}
            </div>
        </div>
    );
}

export default SortableRepeatStep;