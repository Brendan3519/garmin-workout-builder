import { Workout } from "../types/workout";
import { isValidWorkout } from "./validateWorkout";

export type ParseResult =
  | { ok: true; workout: Workout }
  | { ok: false; error: string };

export function parseWorkout(raw: string): ParseResult {
    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch {
        return { ok: false, error: "Response was not valid JSON." };
    }

    if (!isValidWorkout(data)){ return { ok: false, error: "Response was not a valid Workout"}}

    return { ok: true, workout: data };
}