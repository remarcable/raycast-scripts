#!/usr/bin/env node

const { execSync } = require("child_process");

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title Create Weekly Goals
// @raycast.mode compact

// Optional parameters:
// @raycast.icon 🪵

// Documentation:
// @raycast.author remarcable
// @raycast.authorURL https://raycast.com/remarcable

const clipboardContent = execSync("pbpaste").toString();

const goalGradeTemplate = "`X/10`";
const indentationString = "    ";

const lines = clipboardContent
  .split("\n")
  .filter((line) => line.trim() !== "") // potentially also add lines that don't start with a dash/indentation => they're just categories
  .map((line) => {
    return {
      text: `${goalGradeTemplate} ${line.split("- ")[1].trim()}`,
      indentation: line.startsWith(indentationString),
    };
  })
  .reduce((acc, line) => {
    if (line.indentation) {
      // If the line is indented, it is a subgoal
      const lastGoal = acc[acc.length - 1];

      if (lastGoal) {
        return [
          ...acc.slice(0, -1),
          {
            ...lastGoal,
            subgoals: [...lastGoal.subgoals, line.text.trim()],
          },
        ];
      }
    }

    // If the line is not indented, it is a main goal
    return [...acc, { goal: line.text.trim(), subgoals: [] }];
  }, [])
  .map(({ goal, subgoals }) => {
    const goalText = `## ${goal}`;

    if (subgoals.length > 0) {
      const subgoalsText = subgoals
        .map((subgoal) => `${indentationString}- ${subgoal}`)
        .join("\n");
      return `${goalText}
- Subgoals:
${subgoalsText}
- x
`;
    }

    return `${goalText}
- x
`;
  });

execSync("echo '" + lines.join("\n") + "' | pbcopy");

console.log("Weekly Goals Done");
