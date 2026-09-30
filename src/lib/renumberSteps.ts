import { WorkoutStep } from "@/types/workout";

export function renumberSteps(steps: WorkoutStep[]): WorkoutStep[] {
    let count = 1;

    function walk(list: WorkoutStep[]): WorkoutStep[] {
        return list.map((step) => {
            const stepNumber = count;
            count += 1;

            if (step.type === "WorkoutRepeatStep") {
               
                return { ...step, stepOrder: stepNumber, steps: walk(step.steps) };
            }
            
            return { ...step, stepOrder: stepNumber };
        });
    }

    return walk(steps);
}