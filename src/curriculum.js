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
      "compose",
      "Make a number two ways",
      "Split six buttons between two bowls. Find another pair of parts with the same whole.",
    ],
    [
      "conserve",
      "Keep a quantity when objects move",
      "Count five toys, spread them out, and ask whether there are still five.",
    ],
    [
      "quick",
      "Recognize small groups",
      "Briefly show one to five fingers. Talk about what you saw; look again whenever needed.",
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
      "Count a ten and extra ones",
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
      "Complete ten",
      "Put seven objects in ten spaces. Ask how many spaces are empty.",
    ],
  ],
  tenframe20: [
    [
      "read",
      "Read tens and ones",
      "Make a bundle of ten sticks and put three loose sticks beside it.",
    ],
    [
      "ones",
      "Find the extra ones",
      "Show ten buttons and four more. Ask how many are outside the ten.",
    ],
    [
      "build",
      "Build tens and ones",
      "Make fourteen with one full group of ten and four extra objects.",
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
      "sort",
      "Order numbers",
      "Put three number cards in order and match a group of objects to each.",
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
    [
      "eq",
      "Connect addition and equations",
      "Build 3 + 2 with counters and show that 5 = 3 + 2 says the same thing.",
    ],
    [
      "miss",
      "Find how many more",
      "Put out four cups for six toys. Ask how many more cups are needed.",
    ],
  ],
  add20: [
    [
      "teen",
      "Add to a full ten",
      "Show ten objects as one group, then add three. Start counting at ten.",
    ],
  ],
  sub: [
    [
      "story",
      "Act out taking away",
      "Start with five toys, move two away, and describe the three left.",
    ],
    [
      "eq",
      "Connect subtraction and equations",
      "Show 5 − 2 with objects, then match the remaining group to 3.",
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
      "unit",
      "Find the repeating group",
      "Make a spoon-fork-spoon-fork pattern. Point to the smallest group that repeats.",
    ],
    [
      "repair",
      "Repair a pattern",
      "Make a repeating toy pattern, change one item, and ask how to repair it.",
    ],
    [
      "create",
      "Create a repeating pattern",
      "Choose two different actions and repeat the same group of actions three times.",
    ],
    [
      "extend",
      "Continue a repeating pattern",
      "Make a spoon-fork pattern and continue it for three complete repeats.",
    ],
  ],
};
CURRICULUM.order20 = CURRICULUM.order;
const TOPICS = Object.fromEntries(
  Object.entries(CURRICULUM).flatMap(([activity, rows]) =>
    rows.map(([variant, label, home]) => [
      `${activity}.${variant}`,
      { activity, variant, label, home },
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
