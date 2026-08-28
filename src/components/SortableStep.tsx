"use client";

import { WorkoutStep, StepIntensity, NormalStep } from '../types/workout';
import { isDurationDraftInvalid, targetDraftKey } from './WorkoutView';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface SortableStepProps {
    step: NormalStep;
    durationDrafts: { [stepOrder: number]: string };
    setDurationDrafts: (drafts: { [stepOrder: number]: string }) => void;
    targetDrafts: { [key: string]: string };
    setTargetDrafts: (drafts: { [key: string]: string }) => void;
    handleDurationChange: (targetStepOrder: number, newValue: number) => void;
    handleDurationFocus: (currentValue: number) => void;
    handleDurationBlur: (step: WorkoutStep, newValue: number) => void;
    handleRemoveStep: (targetStepOrder: number) => void;
    handleIntensityChange: (targetStepOrder: number, newIntensity: StepIntensity) => void;
    handleTargetTypeChange: (targetStepOrder: number, newTargetType: 'PACE' | 'HEART_RATE') => void;
    handleRemoveTarget: (targetStepOrder: number) => void;
    handleTargetValueChange: (targetStepOrder: number, field: string, newValue: number) => void;
}

function SortableStep({
    step,
    durationDrafts,
    setDurationDrafts,
    targetDrafts,
    setTargetDrafts,
    handleDurationChange,
    handleDurationFocus,
    handleDurationBlur,
    handleRemoveStep,
    handleIntensityChange,
    handleTargetTypeChange,
    handleRemoveTarget,
    handleTargetValueChange,
}: SortableStepProps) {
    const draft = durationDrafts[step.stepOrder];
    const showError = isDurationDraftInvalid(draft);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.stepOrder });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <p ref={setNodeRef} style={style}>
            <span {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: '8px' }}>
                ☰
            </span>
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
                <option value="NONE">No Target</option>
                <option value="PACE">PACE</option>
                <option value="HEART_RATE">HEART_RATE</option>
            </select>
            {step.target?.targetType === 'PACE' && (
                <>
                    {' '}Pace:{' '}
                    <input
                        type="number"
                        value={targetDrafts[targetDraftKey(step.stepOrder, 'paceMinValue')] ?? step.target.paceMinValue}
                        onChange={(e) => setTargetDrafts({ ...targetDrafts, [targetDraftKey(step.stepOrder, 'paceMinValue')]: e.target.value })}
                        onBlur={() => {
                            const targetDraft = targetDrafts[targetDraftKey(step.stepOrder, 'paceMinValue')];
                            if (targetDraft !== undefined && targetDraft !== '' && !isNaN(Number(targetDraft))) {
                                handleTargetValueChange(step.stepOrder, 'paceMinValue', Number(targetDraft));
                            }
                        }}
                    />
                    {' to '}
                    <input
                        type="number"
                        value={targetDrafts[targetDraftKey(step.stepOrder, 'paceMaxValue')] ?? step.target.paceMaxValue}
                        onChange={(e) => setTargetDrafts({ ...targetDrafts, [targetDraftKey(step.stepOrder, 'paceMaxValue')]: e.target.value })}
                        onBlur={() => {
                            const targetDraft = targetDrafts[targetDraftKey(step.stepOrder, 'paceMaxValue')];
                            if (targetDraft !== undefined && targetDraft !== '' && !isNaN(Number(targetDraft))) {
                                handleTargetValueChange(step.stepOrder, 'paceMaxValue', Number(targetDraft));
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
                            const targetDraft = targetDrafts[targetDraftKey(step.stepOrder, 'hrMinValue')];
                            if (targetDraft !== undefined && targetDraft !== '' && !isNaN(Number(targetDraft))) {
                                handleTargetValueChange(step.stepOrder, 'hrMinValue', Number(targetDraft));
                            }
                        }}
                    />
                    {' to '}
                    <input
                        type="number"
                        value={targetDrafts[targetDraftKey(step.stepOrder, 'hrMaxValue')] ?? step.target.hrMaxValue}
                        onChange={(e) => setTargetDrafts({ ...targetDrafts, [targetDraftKey(step.stepOrder, 'hrMaxValue')]: e.target.value })}
                        onBlur={() => {
                            const targetDraft = targetDrafts[targetDraftKey(step.stepOrder, 'hrMaxValue')];
                            if (targetDraft !== undefined && targetDraft !== '' && !isNaN(Number(targetDraft))) {
                                handleTargetValueChange(step.stepOrder, 'hrMaxValue', Number(targetDraft));
                            }
                        }}
                    />
                </>
            )}
            <button onClick={() => handleRemoveStep(step.stepOrder)}>Remove</button>
        </p>
    );
}

export default SortableStep;