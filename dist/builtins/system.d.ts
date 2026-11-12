import { PlainValue } from "../runtime/values";
export declare const systemBuiltins: {
    os_platform: () => string;
    os_arch: () => string;
    cpu_count: () => number;
    memory_usage: () => number;
    get_env: (keyVal: PlainValue) => string;
    random_id: (lengthVal?: PlainValue) => string;
    generate_password: (lengthVal?: PlainValue) => string;
    roll_dice: (sidesVal?: PlainValue, countVal?: PlainValue) => PlainValue;
    flip_coin: () => string;
    pick_card: () => string;
    deck_of_cards: () => string[];
    beep: () => void;
    to_json: (value: PlainValue) => string;
    from_json: (jsonVal: PlainValue) => PlainValue;
    hash_text: (textVal: PlainValue, algoVal?: PlainValue) => string;
    uuid: () => string;
    define_word: (wordVal: PlainValue) => string;
    flashcard: () => string;
    banner: (styleVal?: PlainValue) => string;
};
//# sourceMappingURL=system.d.ts.map