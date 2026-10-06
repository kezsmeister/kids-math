"use strict";

// Each entry is a mathematical skill, not an activity-wide score.
const CURRICULUM = {
  count: [
    [
      "count",
      "Read quantities",
      "Count a handful of spoons, then say how many there are altogether.",
    ],
    [
      "collect",
      "Collect an exact amount",
      "Ask for four spoons from a larger pile. Put any extra spoons back.",
    ],
    [
      "conserve",
      "Keep a quantity when objects move",
      "Count five toys, spread them out, and ask whether there are still five.",
    ],
    [
      "quick",
      "Recognize small groups",
      "Show one to five fingers. Notice the amount, then count together to check.",
    ],
    [
      "give",
      "Match a quantity",
      "Put out two small groups of toys. Find the group with four.",
    ],
  ],
  count20: [
    [
      "count",
      "Count larger groups",
      "Make a group of ten buttons. Add a few more and count on from ten.",
    ],
  ],
  tenframe: [
    [
      "read",
      "Read a ten frame",
      "Show five fingers and two more. Ask how many without counting every finger.",
    ],
    [
      "build",
      "Build a quantity",
      "Ask for exactly five spoons from a larger pile.",
    ],
    [
      "more",
      "Count empty spaces",
      "Put seven objects in ten spaces. Count the empty spaces together.",
    ],
  ],
  tenframe20: [
    [
      "read",
      "Count two frames",
      "Make a bundle of ten sticks and put three loose sticks beside it.",
    ],
  ],
  bonds: [
    [
      "whole",
      "Put parts together",
      "Put two red blocks and three blue blocks together. Count the whole.",
    ],
    [
      "part",
      "Find a missing part",
      "Show five spoons, hide two, and discuss what is missing.",
    ],
  ],
  compare: [
    [
      "quantity",
      "Compare quantities",
      "Pair two groups of toys one to one. Look for any that have no partner.",
    ],
    [
      "length",
      "Compare lengths",
      "Line up two pencils at one end and compare the other ends.",
    ],
    [
      "height",
      "Compare heights",
      "Stand two toy towers on the same surface and compare their tops.",
    ],
    [
      "size",
      "Compare sizes",
      "Find two similar objects of different sizes and describe the difference.",
    ],
  ],
  order: [
    [
      "next",
      "Find the next number",
      "Count forward starting at three instead of starting at one.",
    ],
    [
      "missing",
      "Find a missing number",
      "Arrange number cards and hide one. Work out the missing number.",
    ],
    [
      "before",
      "Find the number before",
      "Use a short number track. Take one step back and name the number.",
    ],
    [
      "bigger",
      "Compare numerals",
      "Match two number cards to groups of objects and compare the groups.",
    ],
  ],
  add: [
    [
      "story",
      "Join groups",
      "Put three toys together with two more. Describe what changed.",
    ],
  ],
  sub: [
    [
      "story",
      "Act out taking away",
      "Start with five toys, move two away, and describe the three left.",
    ],
  ],
  shapes: [
    [
      "find",
      "Recognize shape properties",
      "Find triangles of different sizes and turn them around. Count their straight sides.",
    ],
    [
      "sides",
      "Count straight sides",
      "Trace the boundary of a cardboard shape, counting each side once.",
    ],
    [
      "extend",
      "Continue a repeating pattern",
      "Make a spoon-fork-spoon-fork pattern. Choose which object comes next.",
    ],
  ],
};
// Retain historical evidence without exposing retired questions in play.
const RETIRED_TOPICS = [
  "count.compose",
  "tenframe20.ones",
  "tenframe20.build",
  "order.sort",
  "order20.next",
  "order20.missing",
  "order20.before",
  "order20.sort",
  "order20.bigger",
  "add.eq",
  "add.miss",
  "add20.teen",
  "sub.eq",
  "shapes.unit",
  "shapes.repair",
  "shapes.create",
];
// Read only when words supply the rule, direction, or construction instructions.
// Quantities and visible gaps already express their question visually.
const NARRATED_TOPICS = new Set([
  "count.collect",
  "count.conserve",
  "count.quick",
  "tenframe.build",
  "tenframe.more",
  "bonds.whole",
  "bonds.part",
  "compare.quantity",
  "compare.length",
  "compare.height",
  "compare.size",
  "order.bigger",
  "shapes.find",
  "shapes.sides",
]);
const TOPICS = Object.fromEntries(
  Object.entries(CURRICULUM).flatMap(([activity, rows]) =>
    rows.map(([variant, label, home]) => [
      `${activity}.${variant}`,
      {
        activity,
        variant,
        label,
        home,
        narrate: NARRATED_TOPICS.has(`${activity}.${variant}`),
      },
    ]),
  ),
);
const learningDay = () => new Date().toLocaleDateString("en-CA");
const newLearning = () => ({
  level: 1,
  independent: 0,
  supported: 0,
  shown: 0,
  history: [],
  lastSeen: "",
  verifiedLevel: 0,
});
