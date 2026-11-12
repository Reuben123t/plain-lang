import * as os from "os";
import * as crypto from "crypto";
import { PlainValue, plainToString } from "../runtime/values";
import { PlainError } from "../errors/plain-error";
import { mathBuiltins } from "./math";

const SUITS = ["Hearts", "Diamonds", "Clubs", "Spades"];
const RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];

const STUDENT_DICTIONARY: Record<string, string> = {
  algorithm: "A step-by-step set of instructions or rules designed to solve a specific problem or perform a task.",
  hypothesis: "A proposed, testable explanation for an observed phenomenon made as a starting point for further investigation.",
  photosynthesis: "The biological process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water.",
  gravity: "The universal force of attraction acting between all matter, proportional to their masses and inversely to the distance squared.",
  variable: "A symbolic name associated with a value and whose associated value may be changed or modified.",
  function: "A reusable block of code designed to perform a particular computation or operation when called.",
  derivative: "In calculus, the rate at which a function's value changes with respect to a change in its input.",
  integral: "In calculus, a mathematical object that can be interpreted as an area or a generalization of area.",
  osmosis: "The spontaneous net movement of solvent molecules through a selectively permeable membrane into a region of higher solute concentration.",
  mitosis: "A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus.",
  ecosystem: "A biological community of interacting organisms and their physical environment.",
  entropy: "A measure of the thermal energy per unit temperature that is unavailable for doing useful work; a measure of molecular disorder.",
  momentum: "The quantity of motion of a moving body, measured as a product of its mass and velocity.",
  velocity: "The speed of something in a given direction.",
  acceleration: "The rate of change of velocity per unit of time.",
  metaphor: "A figure of speech in which a word or phrase is applied to an object or action to which it is not literally applicable.",
  simile: "A figure of speech involving the comparison of one thing with another thing of a different kind using 'like' or 'as'.",
  alliteration: "The occurrence of the same letter or sound at the beginning of adjacent or closely connected words.",
  democracy: "A system of government by the whole population or all eligible members of a state, typically through elected representatives.",
  republic: "A state in which supreme power is held by the people and their elected representatives, with an elected or nominated president.",
  inflation: "A general increase in prices and fall in the purchasing value of money over time.",
  opportunity_cost: "The loss of potential gain from other alternatives when one alternative is chosen.",
  catalyst: "A substance that increases the rate of a chemical reaction without itself undergoing any permanent chemical change.",
  molecule: "A group of atoms bonded together, representing the smallest fundamental unit of a chemical compound.",
  atom: "The basic unit of a chemical element, consisting of a dense central nucleus surrounded by a cloud of negatively charged electrons.",
  isotope: "Two or more forms of the same element that contain equal numbers of protons but different numbers of neutrons in their nuclei.",
  wavelength: "The distance between successive crests of a wave, especially points in a sound wave or electromagnetic wave.",
  frequency: "The number of occurrences of a repeating event per unit of time, measured in Hertz (Hz).",
  refraction: "The bending of a wave when it passes from one medium into another in which its speed is different.",
  resonance: "The reinforcement or prolongation of sound by reflection or by the synchronous vibration of a neighboring object."
};

const FLASHCARDS = [
  { question: "What is the speed of light in a vacuum?", answer: "Approximately 3.00 x 10^8 meters per second (299,792,458 m/s)." },
  { question: "What are the three subatomic particles in an atom?", answer: "Protons, neutrons, and electrons." },
  { question: "What is Newton's First Law of Motion?", answer: "An object will remain at rest or in uniform motion unless acted upon by a net external force." },
  { question: "What is the formula for the Pythagorean Theorem?", answer: "a^2 + b^2 = c^2 (where c is the hypotenuse of a right triangle)." },
  { question: "What gas do plants absorb during photosynthesis?", answer: "Carbon dioxide (CO2)." },
  { question: "What is the pH value of pure water at 25 degrees Celsius?", answer: "7 (neutral)." },
  { question: "Who formulated the general theory of relativity?", answer: "Albert Einstein (1915)." },
  { question: "What is the most abundant gas in Earth's atmosphere?", answer: "Nitrogen (approx. 78%)." }
];

export const systemBuiltins = {
  os_platform: (): string => {
    return os.platform();
  },

  os_arch: (): string => {
    return os.arch();
  },

  cpu_count: (): number => {
    return os.cpus().length;
  },

  memory_usage: (): number => {
    return Math.round(process.memoryUsage().heapUsed / (1024 * 1024));
  },

  get_env: (keyVal: PlainValue): string => {
    const key = plainToString(keyVal);
    return process.env[key] || "";
  },

  random_id: (lengthVal?: PlainValue): string => {
    const len = lengthVal !== undefined ? mathBuiltins.to_number(lengthVal) : 8;
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let res = "";
    for (let i = 0; i < len; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
  },

  generate_password: (lengthVal?: PlainValue): string => {
    const len = lengthVal !== undefined ? mathBuiltins.to_number(lengthVal) : 12;
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let res = "";
    for (let i = 0; i < len; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
  },

  roll_dice: (sidesVal?: PlainValue, countVal?: PlainValue): PlainValue => {
    const sides = sidesVal !== undefined ? mathBuiltins.to_number(sidesVal) : 6;
    const count = countVal !== undefined ? mathBuiltins.to_number(countVal) : 1;
    if (sides < 1 || count < 1) {
      throw new PlainError("Dice sides and count must be at least 1.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    if (count === 1) {
      return Math.floor(Math.random() * sides) + 1;
    }
    const results: number[] = [];
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * sides) + 1);
    }
    return results;
  },

  flip_coin: (): string => {
    return Math.random() < 0.5 ? "heads" : "tails";
  },

  pick_card: (): string => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
    return `${rank} of ${suit}`;
  },

  deck_of_cards: (): string[] => {
    const deck: string[] = [];
    for (const s of SUITS) {
      for (const r of RANKS) {
        deck.push(`${r} of ${s}`);
      }
    }
    return deck;
  },

  beep: (): void => {
    if (process.stdout && process.stdout.write) {
      process.stdout.write("\x07");
    }
  },

  to_json: (value: PlainValue): string => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return JSON.stringify(String(value));
    }
  },

  from_json: (jsonVal: PlainValue): PlainValue => {
    const str = plainToString(jsonVal);
    try {
      const parsed = JSON.parse(str);
      const convert = (item: any): PlainValue => {
        if (item === null || item === undefined) return null;
        if (typeof item === "number" || typeof item === "string" || typeof item === "boolean") return item;
        if (Array.isArray(item)) return item.map(convert);
        if (typeof item === "object") {
          // Flatten object to key-value array representation or keep keys
          return Object.entries(item).map(([k, v]) => `${k}: ${plainToString(convert(v))}`);
        }
        return String(item);
      };
      return convert(parsed);
    } catch (err: any) {
      throw new PlainError(`Invalid JSON text: ${err.message}`, { line: 1, column: 1 }, { kind: "TypeError" });
    }
  },

  hash_text: (textVal: PlainValue, algoVal?: PlainValue): string => {
    const text = plainToString(textVal);
    const algo = algoVal !== undefined ? plainToString(algoVal).toLowerCase() : "sha256";
    try {
      return crypto.createHash(algo).update(text).digest("hex");
    } catch {
      return crypto.createHash("sha256").update(text).digest("hex");
    }
  },

  uuid: (): string => {
    return crypto.randomUUID();
  },

  define_word: (wordVal: PlainValue): string => {
    const word = plainToString(wordVal).toLowerCase().trim().replace(/\s+/g, "_");
    if (STUDENT_DICTIONARY[word]) {
      return STUDENT_DICTIONARY[word];
    }
    return `Definition for '${word}' not found in local student dictionary.`;
  },

  flashcard: (): string => {
    const card = FLASHCARDS[Math.floor(Math.random() * FLASHCARDS.length)];
    return `Q: ${card.question}\nA: ${card.answer}`;
  },

  banner: (styleVal?: PlainValue): string => {
    const style = styleVal !== undefined ? plainToString(styleVal).toLowerCase() : "star";
    if (style === "trophy") {
      return "  ___________ \n '._==_==_=_.'\n .-\\:      /-.\n| (|:.     |) |\n '-|:.     |-' \n   \\::.    /  \n    '::. .'   \n      ) (     \n    _.' '._   \n   `\"\"\"\"\"\"\"`  ";
    }
    if (style === "heart") {
      return "  **     **  \n ****   **** \n****** *******\n *********** \n   *******   \n     ***     \n      *      ";
    }
    return "     *     \n   * * *   \n * * * * * \n   * * *   \n     *     ";
  }
};
