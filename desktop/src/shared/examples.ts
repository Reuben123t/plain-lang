import type { Example } from "./contracts";

export const EXAMPLES: Example[] = [
  {
    id: "hello", title: "Hello, world", category: "Start here",
    description: "Your first few lines. Say hello, create a variable, and make something yours.",
    code: '# A small start. A world of possibilities.\n\nsay "Hello, world!"\n\nset language to "Plain"\nsay "Made with " plus language\n\n# Try changing the message, then press F5.\n'
  },
  {
    id: "calculator", title: "Everyday arithmetic", category: "The basics",
    description: "The same readable English math as examples/02_calculator.plain.",
    code: '# Simple Calculator in PLAIN\n# Demonstrates variables and readable English math operators.\n\nset left_value to 12\nset right_value to 8\nset answer to left_value plus right_value\nsay answer\n'
  },
  {
    id: "functions", title: "Write a function", category: "The basics",
    description: "Give an idea a name. Based on examples/04_custom_function.plain.",
    code: '# Custom Functions in PLAIN\n# Define and call a function in natural English.\n\nto double number\n    give back number times 2\nend\n\nsay double 12\n'
  },
  {
    id: "conversation", title: "A little conversation", category: "Interactive",
    description: "Ask a question and answer it in the studio’s interactive output panel.",
    code: '# Input appears in the Output panel when you run this.\n\nask "What should I call you?" and save as visitor\nsay "Hello, " plus visitor plus "!"\nsay "Let’s build something."\n'
  },
  {
    id: "loops", title: "Loops with a purpose", category: "Going further",
    description: "Continue, break, and assertions. From examples/16_control_flow.plain.",
    code: '# Deterministic loop control\n\ntotal = 0\nfor each number in [1, 2, 3, 4, 5]\n    if number == 2 then\n        continue\n    end\n    if number == 5 then\n        break\n    end\n    total += number\nend\n\nassert_equal(total, 8)\nsay "Total: " plus total\n'
  },
  {
    id: "collections", title: "Lists & dictionaries", category: "Going further",
    description: "English indexing starts at 1; bracket indexing starts at 0.",
    code: '# Lists and dictionaries\n\nscores = [10, 20, 30]\nscores[0] += 2\nscores[-1] = 25\nstudent = {"name": "Ada", "score": 0}\nstudent.score = item 1 of scores\n\nassert_equal(student.score, 12)\nsay "First: " plus item 1 of scores\nsay "Last: " plus scores[-1]\nsay student.name + ": " + student.score\n'
  }
];
