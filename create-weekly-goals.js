#!/usr/bin/env node

const { execSync } = require("child_process");

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title Create Weekly Goals
// @raycast.mode compact

// Optional parameters:
// @raycast.icon 🪵
// @raycast.description Convert a bulleted list of goals from the clipboard into a Markdown format suitable for my [Weekly](https://www.marcnitzsche.de/how-to-be-productive-when-you-dont-have-external-structure/#weekly-reflection).

// Documentation:
// @raycast.author remarcable
// @raycast.authorURL https://raycast.com/remarcable

const clipboardContent = execSync("pbpaste").toString();

const goalGradeTemplate = "`X/10`";
const indentationString = "    ";

const lines = clipboardContent
  .split("\n")
  .filter((line) => line.trim() !== "") // TODO: potentially also filter lines that don't start with a dash/indentation => they're just categories
  .map((line) => {
    const isIndented = line.startsWith(indentationString);
    const isNumbered = line.match(/\d+\.\s/);

    const lineWithoutDash = isNumbered ? line : line.split("- ")[1].trim();

    return {
      text: `${goalGradeTemplate} ${lineWithoutDash}`,
      isSubgoal: isIndented,
    };
  })
  .reduce((acc, line) => {
    if (!line.isSubgoal) {
      return [...acc, { goal: line.text, subgoals: [] }];
    }

    const lastGoal = acc[acc.length - 1];

    if (!lastGoal) {
      throw new Error("No last goal found, this should not happen.");
    }

    return [
      ...acc.slice(0, -1),
      {
        ...lastGoal,
        subgoals: [...lastGoal.subgoals, line.text],
      },
    ];
  }, [])
  .map(({ goal, subgoals }) => {
    const goalText = `## ${goal}`;
    const firstBulletPoint = "- [Add info]";

    if (!subgoals.length) {
      return `${goalText}
${firstBulletPoint}
`;
    }

    const subgoalsText = subgoals
      .map((subgoal) => `${indentationString}- ${subgoal}`)
      .join("\n");
    return `${goalText}
- Subgoals:
${subgoalsText}
${firstBulletPoint}
`;
  });

execSync("echo '" + lines.join("\n") + "' | pbcopy");

console.log("Weekly Goals Done");
