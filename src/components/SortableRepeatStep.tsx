"use client";

import { RepeatStep, WorkoutStep } from '../types/workout';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { isNumberDraftInvalid } from './WorkoutView';
import posthog from 'posthog-js';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface SortableRepeatStepProps {
    step: RepeatStep;
    renderStep: (step: WorkoutStep) => React.ReactNode;
    handleRepeatCountChange: (targetStepOrder: number, newCount: number) => void;
}

function SortableRepeatStep({ step, renderStep, handleRepeatCountChange }: SortableRepeatStepProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.stepOrder });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    const [repeatDraft, setRepeatDraft] = useState<string | undefined>(undefined);
    return (
        <div ref={setNodeRef} style={style}>
            <span {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: '8px' }}>
                ☰
            </span>
            <strong>🔁 Repeat ×
                <input
                    type="number"
                    value={repeatDraft ?? step.repeatValue}
                    placeholder="1"
                    onChange={(e) =>
                        setRepeatDraft(e.target.value)}
                    onBlur={() => {
                        const isValid = !isNumberDraftInvalid(repeatDraft);
                        const newValue = isValid ? Math.max(1, Number(repeatDraft)) : step.repeatValue;
                        
                        if (isValid && repeatDraft !== undefined) {
                            handleRepeatCountChange(step.stepOrder, newValue);
                            if (newValue !== step.repeatValue) {
                                posthog.capture('workout_repeat_count_edited', {
                                    step_order: step.stepOrder,
                                    old_value: step.repeatValue,
                                    new_value: newValue,
                                });
                            }
                        }
                        setRepeatDraft(undefined);
                    }}
                />
            </strong>
            <div style={{ paddingLeft: '16px' }}>
                <SortableContext
                    items={step.steps.map((subStep) => subStep.stepOrder)}
                    strategy={verticalListSortingStrategy}
                >
                {step.steps.map((subStep) => renderStep(subStep))}
                </SortableContext>
            </div>
        </div>
    );
}

export default SortableRepeatStep;