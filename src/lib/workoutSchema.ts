const stepRef = { $ref: "#/$defs/step" };

export const workoutJsonSchema = {
  type: "object",
  properties: {
    workoutName: { type: "string", description: "Short descriptive name for the workout." },
    sport: { type: "string", enum: ["RUNNING"] },
    steps: { type: "array", items: stepRef },
  },
  required: ["workoutName", "sport", "steps"],
  $defs: {
    step: {
      anyOf: [
        {
          type: "object",
          title: "NormalStep",
          properties: {
            type: { type: "string", enum: ["WorkoutStep"] },
            stepOrder: { type: "integer", minimum: 1, description: "Position of this step, starting at 1." },
            intensity: { type: "string", enum: ["WARMUP", "ACTIVE", "COOLDOWN", "RECOVERY", "INTERVAL", "REST"] },
            durationType: { type: "string", enum: ["DISTANCE", "TIME"] },
            durationValue: {
              type: "number",
              minimum: 1,
              description: "Meters if durationType is DISTANCE. Seconds if durationType is TIME.",
            },
            target: {
              anyOf: [
                {
                  type: "object",
                  title: "PaceTarget",
                  properties: {
                    targetType: { type: "string", enum: ["PACE"] },
                    paceMinValue: { type: "number", description: "Meters per second." },
                    paceMaxValue: { type: "number", description: "Meters per second." },
                  },
                  required: ["targetType", "paceMinValue", "paceMaxValue"],
                },
                {
                  type: "object",
                  title: "HeartRateTarget",
                  properties: {
                    targetType: { type: "string", enum: ["HEART_RATE"] },
                    hrMinValue: { type: "number", description: "Beats per minute." },
                    hrMaxValue: { type: "number", description: "Beats per minute." },
                  },
                  required: ["targetType", "hrMinValue", "hrMaxValue"],
                },
              ],
            },
          },
          required: ["type", "stepOrder", "intensity", "durationType", "durationValue"],
        },
        {
          type: "object",
          title: "RepeatStep",
          properties: {
            type: { type: "string", enum: ["WorkoutRepeatStep"] },
            stepOrder: { type: "integer", minimum: 1, description: "Position of this step, starting at 1." },
            repeatValue: { type: "integer", minimum: 1, description: "How many times to repeat the nested steps." },
            steps: { type: "array", items: stepRef },
          },
          required: ["type", "stepOrder", "repeatValue", "steps"],
        },
      ],
    },
  },
};