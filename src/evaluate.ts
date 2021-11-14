import { BestHand, CardGroup, HandRanks, Ranks } from './types';
import { uniqWith } from './util';

export function evaluate(cardGroup: CardGroup): BestHand {
    cardGroup.sortDesc();

    // group by rank
    const rankCount = cardGroup.countBy('rank');

    const quadRanks: number[] = [];
    const tripRanks: number[] = [];
    const pairRanks: number[] = [];
    let straightCardsCount = 0;
    let straightMaxCardRank: number = 0;
    let straightLastCardRank: number = 0;
    const allRanks = Object.keys(rankCount).reverse();

    for (const rank of allRanks) {
        if (rankCount[rank] === 2) {
            pairRanks.push(Number(rank));
        } else if (rankCount[rank] === 3) {
            tripRanks.push(Number(rank));
        } else if (rankCount[rank] === 4) {
            quadRanks.push(Number(rank));
        }

        if (straightCardsCount < 5) {
            if (
                straightLastCardRank &&
                straightLastCardRank - 1 === Number(rank)
            ) {
                straightCardsCount++;
                straightLastCardRank = Number(rank);
            } else {
                straightMaxCardRank = straightLastCardRank = Number(rank);
                straightCardsCount = 1;
            }
        }
    }

    // group by suit
    const suitCount = cardGroup.countBy('suit');

    let flushSuit: number = 0;
    for (const suit in suitCount) {
        if (suitCount[suit] >= 5) {
            flushSuit = Number(suit);
            break;
        }
    }

    // straight flush
    if (flushSuit) {
        if (straightCardsCount === 5) {
            const straightFlushCards = cardGroup.cards.filter(
                (card) =>
                    card.suit === flushSuit && card.rank <= straightMaxCardRank
            );

            if (straightFlushCards.length >= 5) {
                let index = 0;
                let count = 1;
                let isStraightFlush = false;
                for (let i = 1; i < straightFlushCards.length; i++) {
                    if (
                        straightFlushCards[i].rank !==
                        straightFlushCards[i - 1].rank - 1
                    ) {
                        index = i;
                        count = 1;
                    } else {
                        count++;
                    }

                    if (count === 5) {
                        isStraightFlush = true;
                        break;
                    }
                }

                if (isStraightFlush)
                    return {
                        handRank: HandRanks.straightFlush,
                        hand: new CardGroup(
                            straightFlushCards.slice(index, index + 5)
                        ),
                    };
            }
        } else if (
            straightCardsCount === 4 &&
            straightMaxCardRank === Ranks.five
        ) {
            const aceCards = cardGroup.cards.filter(
                (card) => card.suit === flushSuit && card.rank === Ranks.ace
            );
            if (aceCards.length > 0) {
                const straightFlushCards = cardGroup.cards.filter(
                    (card) =>
                        card.suit === flushSuit &&
                        card.rank <= straightMaxCardRank
                );
                if (straightFlushCards.length === 4)
                    return {
                        handRank: HandRanks.straightFlush,
                        hand: new CardGroup(
                            straightFlushCards.concat(aceCards[0]).slice(0, 5)
                        ),
                    };
            }
        }
    }

    // quads
    if (quadRanks.length >= 1) {
        const quadCards = cardGroup.cards.filter(
            (card) => card.rank === quadRanks[0]
        );
        const otherCards = cardGroup.cards.filter(
            (card) => card.rank !== quadRanks[0]
        );
        return {
            handRank: HandRanks.quads,
            hand: new CardGroup(quadCards.concat(otherCards).slice(0, 5)),
        };
    }

    // full house
    if (tripRanks.length === 1 && pairRanks.length >= 1) {
        const tripCards = cardGroup.cards.filter(
            (card) => card.rank === tripRanks[0]
        );
        const pairCards = cardGroup.cards.filter(
            (card) => card.rank === pairRanks[0]
        );
        return {
            handRank: HandRanks.fullHouse,
            hand: new CardGroup(tripCards.concat(pairCards)),
        };
    } else if (tripRanks.length > 1) {
        const tripCards = cardGroup.cards.filter(
            (card) => card.rank === tripRanks[0]
        );
        const pairCards = cardGroup.cards.filter(
            (card) => card.rank === tripRanks[1]
        );
        return {
            handRank: HandRanks.fullHouse,
            hand: new CardGroup(tripCards.concat(pairCards.slice(0, 2))),
        };
    }

    // flush
    if (flushSuit) {
        const flushCards = cardGroup.cards.filter(
            (card) => card.suit === flushSuit
        );
        return {
            handRank: HandRanks.flush,
            hand: new CardGroup(flushCards.slice(0, 5)),
        };
    }

    // straight
    if (straightCardsCount === 5) {
        const straightCards = uniqWith(
            cardGroup.cards.filter((card) => card.rank <= straightMaxCardRank),
            (c1, c2) => c1.rank === c2.rank
        );
        return {
            handRank: HandRanks.straight,
            hand: new CardGroup(straightCards.slice(0, 5)),
        };
    } else if (straightCardsCount === 4 && straightMaxCardRank === Ranks.five) {
        const aceCards = cardGroup.cards.filter(
            (card) => card.rank === Ranks.ace
        );
        if (aceCards.length > 0) {
            const straightCards = uniqWith(
                cardGroup.cards.filter(
                    (card) => card.rank <= straightMaxCardRank
                ),
                (c1, c2) => c1.rank === c2.rank
            );
            return {
                handRank: HandRanks.straight,
                hand: new CardGroup(
                    straightCards.concat(aceCards[0]).slice(0, 5)
                ),
            };
        }
    }

    // trips
    if (tripRanks.length === 1) {
        const tripCards = cardGroup.cards.filter(
            (card) => card.rank === tripRanks[0]
        );
        const cards = cardGroup.cards.filter(
            (card) => card.rank !== tripRanks[0]
        );
        return {
            handRank: HandRanks.trips,
            hand: new CardGroup(tripCards.concat(cards).slice(0, 5)),
        };
    }

    // two pair
    if (pairRanks.length >= 2) {
        const pairedHigherCards = cardGroup.cards.filter(
            (card) => card.rank === pairRanks[0]
        );
        const pairedLowerCards = cardGroup.cards.filter(
            (card) => card.rank === pairRanks[1]
        );
        const unpairedCards = cardGroup.cards.filter(
            (card) => card.rank !== pairRanks[0] && card.rank !== pairRanks[1]
        );
        return {
            handRank: HandRanks.twoPair,
            hand: new CardGroup(
                pairedHigherCards
                    .concat(pairedLowerCards)
                    .concat(unpairedCards)
                    .slice(0, 5)
            ),
        };
    }

    // one pair
    if (pairRanks.length === 1) {
        const pairedCards = cardGroup.cards.filter(
            (card) => card.rank === pairRanks[0]
        );
        const unpairedCards = cardGroup.cards.filter(
            (card) => card.rank !== pairRanks[0]
        );
        return {
            handRank: HandRanks.pair,
            hand: new CardGroup(pairedCards.concat(unpairedCards).slice(0, 5)),
        };
    }

    // high card
    return {
        handRank: HandRanks.highCard,
        hand: new CardGroup(cardGroup.cards.slice(0, 5)),
    };
}
