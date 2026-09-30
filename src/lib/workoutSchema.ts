const targetSchema = {
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
};

const normalStepSchema = {
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
    target: targetSchema,
  },
  required: ["type", "stepOrder", "intensity", "durationType", "durationValue"],
};

const repeatStepSchema = {
  type: "object",
  title: "RepeatStep",
  properties: {
    type: { type: "string", enum: ["WorkoutRepeatStep"] },
    stepOrder: { type: "integer", minimum: 1, description: "Position of this step, starting at 1." },
    repeatValue: { type: "integer", minimum: 1, description: "How many times to repeat the nested steps." },
    steps: {
      type: "array",
      items: normalStepSchema,
      description: "The steps performed on each repetition, in order: the work step, then the recovery step.",
    },
  },
  required: ["type", "stepOrder", "repeatValue", "steps"],
};

export const workoutJsonSchema = {
  type: "object",
  properties: {
    workoutName: { type: "string", description: "Short descriptive name for the workout." },
    sport: { type: "string", enum: ["RUNNING"] },
    steps: {
      type: "array",
      items: { anyOf: [normalStepSchema, repeatStepSchema] },
    },
  },
  required: ["workoutName", "sport", "steps"],
};