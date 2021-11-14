import {
    Input,
    InternalInput,
    HandRanks,
    CardGroup,
    Deck,
    BestHand,
    Stats,
    makeStatsTieHandStatsIfItIsNotAlready,
    makeStatsHandStatsIfItIsNotAlready,
} from './types';
import { cleanInput, validateInput, shuffle } from './util';
import { evaluate } from './evaluate';

class Player {
    dealt = new CardGroup();
    bestHand?: BestHand;

    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    evaluate(board: CardGroup) {
        const totalCardGroup = new CardGroup(
            this.dealt.cards.concat(board.cards)
        );
        this.bestHand = evaluate(totalCardGroup);

        return this.bestHand;
    }

    compare(p: Player) {
        if (!p.bestHand || !this.bestHand) return 0;
        if (p.bestHand.handRank === this.bestHand.handRank) {
            for (let i = 0; i < this.bestHand.hand.cards.length; i++) {
                if (
                    p.bestHand.hand.cards[i].rank !==
                    this.bestHand.hand.cards[i].rank
                ) {
                    return p.bestHand.hand.cards[i].rank >
                        this.bestHand.hand.cards[i].rank
                        ? 1
                        : -1;
                }
            }
            return 0;
        }

        return p.bestHand.handRank > this.bestHand.handRank ? 1 : -1;
    }
}

class Game {
    private input: InternalInput;
    private board: CardGroup;
    private deck: Deck;

    players: Player[] = [];

    constructor(input: InternalInput) {
        this.input = input;

        this.deck = new Deck(this.input.numDecks);
        this.deck.shuffle();

        this.board = new CardGroup(this.input.board);
        this.board.cards.forEach((c) => this.deck.removeCard(c));
        this.dealKnownCards();
        this.buildRestOfBoard();
        this.dealRestOfCards();
    }

    static getNpcName(i: number) {
        return `NPC ${i}`;
    }

    play(): Player[] {
        for (const p of this.players) {
            p.evaluate(this.board);
        }

        // shuffle player order. allows bias when compare() return 0 as ties
        shuffle(this.players);
        // compare hands
        this.players.sort((a, b) => a.compare(b));

        const winners: Player[] = [this.players[0]];
        for (let i = 1; i < this.players.length; i++) {
            const res = this.players[i - 1].compare(this.players[i]);
            if (res === 0) {
                winners.push(this.players[i]);
            } else {
                break;
            }
        }

        return winners;
    }

    private buildRestOfBoard() {
        const currentBoardSize = this.board.cards.length;
        for (let i = 0; i < this.input.boardSize - currentBoardSize; i++) {
            this.board.addCards(this.deck.pop());
        }
    }

    private dealKnownCards() {
        for (const s of this.input.hands) {
            const dealtCards = new CardGroup(s);
            dealtCards.cards.forEach((c) => this.deck.removeCard(c));

            const p = new Player(dealtCards.toString());
            p.dealt.addCardGroup(dealtCards);
            this.players.push(p);
        }
    }
    private dealRestOfCards() {
        // complete any incomplete players
        for (const p of this.players) {
            for (
                let i = 0;
                i < this.input.handSize - p.dealt.cards.length;
                i++
            ) {
                p.dealt.addCards(this.deck.pop());
            }
        }

        for (
            let i = 0;
            i < this.input.numPlayers - this.input.hands.length;
            i++
        ) {
            const dealtCards = new CardGroup();
            for (let j = 0; j < this.input.handSize; j++) {
                dealtCards.addCards(this.deck.pop());
            }

            const p = new Player(Game.getNpcName(i + 1));
            p.dealt.addCardGroup(dealtCards);
            this.players.push(p);
        }
    }
}

export class Calculator {
    private stats: Record<string, Stats> = {};
    private input: InternalInput;

    constructor(input: Input) {
        validateInput(input);
        this.input = cleanInput(input);

        for (const e of this.input.hands) {
            this.setupStatsObj(e);
        }

        for (
            let i = 0;
            i < this.input.numPlayers - this.input.hands.length;
            i++
        ) {
            this.setupStatsObj(Game.getNpcName(i + 1));
        }
    }

    simulate() {
        for (let i = 0; i < this.input.iterations; i++) {
            const g = new Game(this.input);
            const winners = g.play();
            this.addToCount(winners);
        }

        this.calculateStats();

        return this.stats;
    }

    private getStatsOfPlayer(player: Player['name']): Stats {
        if (player in this.stats) {
            return this.stats[player];
        }
        return {
            tieCount: 0,
            winCount: 0,
        };
    }

    private addToCount(winners: Player[]) {
        const isTie = winners.length > 1;
        for (const winner of winners) {
            const statsOfWinner = this.getStatsOfPlayer(winner.name);
            if (isTie) {
                statsOfWinner.tieCount++;
                if (
                    this.input.returnTieHandStats &&
                    winner.bestHand?.handRank !== undefined
                ) {
                    const statsOfWinnerWithTieHandStats =
                        makeStatsTieHandStatsIfItIsNotAlready(statsOfWinner);
                    statsOfWinnerWithTieHandStats.tieHandStats[
                        HandRanks[winner.bestHand.handRank]
                    ].count++;
                }
            } else {
                statsOfWinner.winCount++;
                if (
                    this.input.returnHandStats &&
                    winner.bestHand?.handRank !== undefined
                ) {
                    const statsOfWinnerWithHandStats =
                        makeStatsHandStatsIfItIsNotAlready(statsOfWinner);
                    statsOfWinnerWithHandStats.handStats[
                        HandRanks[winner.bestHand.handRank]
                    ].count++;
                }
            }
        }
    }

    private calculateStats() {
        for (const name in this.stats) {
            const statsOfPlayer = this.stats[name];
            // winner percent
            statsOfPlayer.winPercent = this.calculatePercent(
                statsOfPlayer.winCount
            );
            statsOfPlayer.tiePercent = this.calculatePercent(
                statsOfPlayer.tieCount
            );

            // hand percent
            if (this.input.returnHandStats) {
                const statsOfWinnerWithHandStats =
                    makeStatsHandStatsIfItIsNotAlready(statsOfPlayer);
                for (const rank in statsOfWinnerWithHandStats.handStats) {
                    statsOfWinnerWithHandStats.handStats[rank].percent =
                        this.calculatePercent(
                            statsOfWinnerWithHandStats.handStats[rank].count
                        );
                }
            }
            if (this.input.returnTieHandStats) {
                const statsOfWinnerWithTieHandStats =
                    makeStatsTieHandStatsIfItIsNotAlready(statsOfPlayer);
                for (const rank in statsOfWinnerWithTieHandStats.tieHandStats) {
                    statsOfWinnerWithTieHandStats.tieHandStats[rank].percent =
                        this.calculatePercent(
                            statsOfWinnerWithTieHandStats.tieHandStats[rank]
                                .count
                        );
                }
            }
        }
    }

    private setupStatsObj(name: Player['name']) {
        this.stats[name] = { winCount: 0, tieCount: 0 };
        if (this.input.returnHandStats)
            makeStatsHandStatsIfItIsNotAlready(this.stats[name]);
        if (this.input.returnTieHandStats)
            makeStatsTieHandStatsIfItIsNotAlready(this.stats[name]);

        for (const r in HandRanks) {
            if (typeof HandRanks[r] !== 'number') continue;

            if (this.input.returnHandStats) {
                const statsWithHandStats = makeStatsHandStatsIfItIsNotAlready(
                    this.stats[name]
                );
                statsWithHandStats.handStats[r] = <any>{ count: 0 };
            }
            if (this.input.returnTieHandStats) {
                const statsWithTieHandStats =
                    makeStatsTieHandStatsIfItIsNotAlready(this.stats[name]);
                statsWithTieHandStats.tieHandStats[r] = <any>{ count: 0 };
            }
        }
    }

    private calculatePercent(count: number) {
        return +((count / this.input.iterations) * 100).toFixed(4);
    }
}
