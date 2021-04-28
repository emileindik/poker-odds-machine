import { shuffle } from "./util";

export enum Suits {
    club = 1,
    diamond,
    heart,
    spade,
}

export enum Ranks {
    two = 2,
    three,
    four,
    five,
    six,
    seven,
    eight,
    nine,
    ten,
    jack,
    queen,
    king,
    ace,
}

export enum HandRanks {
    highCard = 1,
    pair,
    twoPair,
    trips,
    straight,
    flush,
    fullHouse,
    quads,
    straightFlush,
}

export type Input = {
    numPlayers?: number;
    numDecks?: number;
    hands?: string[];
    handSize?: number;
    board?: string;
    boardSize?: number;
    iterations?: number;
    returnHandStats?: boolean;
    returnTieHandStats?: boolean;
}

export type BestHand = {
    hand: CardGroup;
    handRank: HandRanks;
}


export type Stats = {
    winCount: number;
    winPercent: number;
    tieCount: number;
    tiePercent: number;
    tieHandStats: HandStats;
    handStats: HandStats;
}

type HandStats = Record<string, {
    count: number;
    percent: number;
}>;

class Suit {

    static fromString(s: string): Suits {
        switch (s) {
            case 'c':
                return Suits.club;
            case 'd':
                return Suits.diamond;
            case 'h':
                return Suits.heart;
            case 's':
                return Suits.spade;
            default:
                throw new Error(`Invalid card suit string: ${s}`);
        }
    }

    static toString(suit: Suits): string {
        if (!(suit in Suits))
            throw new Error(`Invalid suit value: ${suit}`);

        return Suits[suit][0];
    }

    static toLongName(suit: Suits, plural?: boolean): string {
        if (!(suit in Suits))
            throw new Error(`Invalid suit value: ${suit}`);

        let longName = Suits[suit];
        if (plural)
            longName += 's';

        return longName;
    }
}

class Rank {

    static fromString(s: string): Ranks {
        switch (s) {
            case 'T':
                return Ranks.ten;
            case 'J':
                return Ranks.jack;
            case 'Q':
                return Ranks.queen;
            case 'K':
                return Ranks.king;
            case 'A':
                return Ranks.ace;
            default:
                const n = Number(s);

                if (isNaN(n) || n < Ranks.two || n > Ranks.nine)
                    throw new Error(`Invalid card rank string: ${s}`);
                
                return n;
        }
    }

    static toString(r: Ranks): string {
        switch (r) {
            case Ranks.ten:
                return 'T';
            case Ranks.jack:
                return 'J';
            case Ranks.queen:
                return 'Q';
            case Ranks.king:
                return 'K';
            case Ranks.ace:
                return 'A';
            default:
                if (isNaN(r) || r < Ranks.two || r > Ranks.ace)
                    throw new Error(`Invalid card rank value: ${r}`);

                return r.toString();
        }
    }

    static toLongName(rank: Ranks): string {
        if (!(rank in Ranks))
            throw new Error(`Invalid rank value: ${rank}`);

        return Ranks[rank];
    }
}

export class Card {
    private _rank: Ranks;
    private _suit: Suits;

    get rank(): Ranks {
        return this._rank;
    }
    get suit(): Suits {
        return this._suit;
    }

    constructor(s: string) {
        Card.validateCardString(s);

        this._rank = Rank.fromString(s[0]);
        this._suit = Suit.fromString(s[1]);
    }

    static validateCardString(s: string) {
        if (s.length !== 2)
            throw new Error(`Card string must have a length of 2. Invalid: ${s}`);
        if (!['T', 'J', 'Q', 'K', 'A'].includes(s[0]) && (+s[0] < 2 || +s[0] > 9))
            throw new Error(`Card string must begin with 2-9, T, J, Q, K, or A. Invalid: ${s}`);
        if (!['c', 'd', 'h', 's'].includes(s[1]))
            throw new Error(`Card string must end with c, d, h, or s. Invalid: ${s}`);
    }

    equals(card: Card): boolean {
        // todo: implement range card == standard card
        return this._rank === card.rank && this._suit === card.suit;
    }

    toString(): string {
        return Rank.toString(this._rank) + Suit.toString(this._suit);
    }

    toLongName(): string {
        return `${Rank.toLongName(this._rank)} of ${Suit.toLongName(this._suit, true)}`;
    }
}

export class CardGroup {
    protected _cards: Card[] = [];
    
    get cards(): Card[] {
        return this._cards;
    }
    
    constructor(cards?: string)
    constructor(cards?: Card[])
    constructor(cards?: Card)
    constructor(cards?: string | Card | Card[]) {
        if (!cards)
            return;

        // todo: why are these conditions necessary to call function?
        if (Array.isArray(cards))
            this.addCards(cards);
        else if (typeof cards === "string")
            this.addCards(cards);
        else
            this.addCards(cards);
    }

    static validateCardGroupString(s: string) {
        for (const e of s.split(',')) {
            Card.validateCardString(e);
        }
    }

    toString(): string {
        return this._cards.map(c => c.toString()).join(',');
    }

    addCardGroup(cardGroup: CardGroup): void {
        this._cards.push(...cardGroup.cards);
    }

    addCards(card: string): void;
    addCards(card: Card): void;
    addCards(card: Card[]): void;
    addCards(cards: string | Card | Card[]): void {
        if (typeof cards === 'string')
            this.addCardsString(cards);
        else if (Array.isArray(cards))
            this._cards.push(...cards);
        else
            this._cards.push(cards);
    }


    sortDesc(): void {
        this._cards.sort((a, b) => b.suit - a.suit);
        this._cards.sort((a, b) => b.rank - a.rank);
    }

    countBy(type: 'rank' | 'suit'): Record<string, number> {
        const map: Record<string, number> = {};

        for (const card of this._cards) {
            const prop = type === 'rank' ? card.rank : card.suit;
            if (!(prop in map))
                map[prop] = 1;
            else
                map[prop]++;
        }

        return map;
    }

    private addCardsString(s: string) {
        for (const e of s.split(',')) {
            const card = new Card(e);
            this.addCards(card);
        }
    }

}

export class Deck extends CardGroup {

    constructor(numDecks: number) {
        const deckString = '2c,2d,2h,2s,3c,3d,3h,3s,4c,4d,4h,4s,5c,5d,5h,5s,6c,6d,6h,6s,7c,7d,7h,7s,8c,8d,8h,8s,9c,9d,9h,9s,Tc,Td,Th,Ts,Jc,Jd,Jh,Js,Qc,Qd,Qh,Qs,Kc,Kd,Kh,Ks,Ac,Ad,Ah,As';
        const decksString = Array(numDecks).fill(deckString);
        super(decksString.join(','));
    }

    pop(): Card {
        if (this._cards.length === 0)
            throw new Error('Deck is empty. There are either too many players, or the boardSize is too large');
        return this._cards.pop();
    }

    removeCard(cardToRemove: Card): Card {
        let found = false;
        for (let i = 0; i < this._cards.length; i++) {
            if (this._cards[i].equals(cardToRemove)) {
                this._cards.splice(i, 1);
                found = true;
            }
        }

        if (!found)
            throw new Error(`CardGroup does not contain card string: ${cardToRemove.toString()}`);

        return cardToRemove;
    }

    shuffle(): void {
        shuffle(this._cards);
    }
}
