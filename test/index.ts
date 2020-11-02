import { Calculator } from "..";
import { Input } from "../src/types";

const input: Input = {
    numPlayers: 1,
    returnHandStats: true,
    returnTieHandStats: true,
    iterations: 1000000
};


console.time();
const c = new Calculator(input);
const s = c.simulate();
console.timeEnd();

printError(s);

function printError(stats: any) {
    const probs = {
        'straightFlush': .031083,
        'quads': .168067,
        'fullHouse': 2.596102,
        'flush': 3.025494,
        'straight': 4.619382,
        'trips': 4.829870,
        'twoPair': 23.495536,
        'pair': 43.822546,
        'highCard': 17.411920
    };

    const output: any[] = [];

    for (const e in stats['NPC 1'].handStats) {
        const diff = stats['NPC 1'].handStats[e].percent - probs[e];
        output.push({
            'hand': e,
            '% hypo': probs[e],
            '% estimated': stats['NPC 1'].handStats[e].percent,
            '% error': +(diff/probs[e] * 100).toFixed(4)
        });
    }

    console.table(output);
}