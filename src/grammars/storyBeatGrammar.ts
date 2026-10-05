/**
 * @file storyBeatGrammar.ts
 * @description In-memory GBNF grammar and JSON Schema definitions for logit-constrained decoding.
 */

export const TANGENT_STORY_BEAT_GBNF = `# Tangent SFF RPG Story Beat Grammar
root ::= "{" ws "\\"narrative\\":" ws string "," ws "\\"gate\\":" ws gate_object ("," ws "\\"stageDeltas\\":" ws delta_array)? ws "}"
gate_object ::= "{" ws "\\"prompt\\":" ws string "," ws "\\"options\\":" ws "[" ws option_item ("," ws option_item){1,3} ws "]" ws "}"
option_item ::= "{" ws "\\"id\\":" ws string "," ws "\\"text\\":" ws string "," ws "\\"skillCheck\\":" ws string "}"
delta_array ::= "[" ws (delta_item ("," ws delta_item)*)? ws "]"
delta_item ::= "{" ws "\\"entityId\\":" ws string "," ws "\\"property\\":" ws string "," ws "\\"newValue\\":" ws value "}"
value ::= string | number | boolean
string ::= "\\"" ([^"\\\\\\x00-\\x1F] | "\\\\" (["\\\\/bfnrt] | "u" [0-9a-fA-F]{4}))* "\\""
number ::= ("-"? [0-9]+ ("." [0-9]+)?)
boolean ::= ("true" | "false")
ws ::= [ \\t\\n\\r]*
`;

/**
 * Strict JSON Schema for cloud models (Google Gemini responseSchema)
 */
export const TANGENT_STORY_BEAT_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    narrative: {
      type: "STRING",
      description: "Atmospheric narrative consequence depicting sensory outcome of the structural mandate without altering mechanics."
    },
    gate: {
      type: "OBJECT",
      properties: {
        prompt: { type: "STRING", description: "Directorial tactical prompt asking for operative next move." },
        options: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              text: { type: "STRING", description: "Tactical action choice." },
              skillCheck: { type: "STRING", description: "Associated skill and target CR (e.g. Ballistics CR 12)." }
            },
            required: ["id", "text", "skillCheck"]
          }
        }
      },
      required: ["prompt", "options"]
    },
    stageDeltas: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          entityId: { type: "STRING" },
          property: { type: "STRING" },
          newValue: { type: "STRING" }
        },
        required: ["entityId", "property", "newValue"]
      }
    }
  },
  required: ["narrative", "gate"]
};
