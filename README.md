# poker-odds-machine
> Uses Monte Carlo simulation to estimate win probability of any poker hand.  

## Install

```sh
npm install poker-odds-machine
```

## Usage

```ts
const Calculator = require('poker-odds-machine').Calculator;
const input = {
    /**
     * Hands of players, following the syntax below.
     * A player can have a partial hand (one card specified) in order
     * to have their next card randomly selected.
     * If hands option not supplied, then numPlayers must be provided. 
     */
    hands: ['Ac,Kc', '2h,7d', 'Js'],
    /**
     * If not supplied, defaults to length of hands array.
     * For every player above the length of hands array,
     * a NPC will be created and dealt random cards.
     */
    numPlayers: 4,
    /**
     * Defaults to empty board, which is populated with number of
     * cards specified in boardSize option.
     */
    board: 'Td,2d,Qc',
    /**
     * Defaults to 5.
     */
    boardSize: 5,
    /**
     * Defaults to 2.
     */
    handSize: 2,
    /**
     * Defaults to 1.
     */
    numDecks: 1,
    /**
     * If true, returns additional data containing stats on each player's winning hands.
     * Defaults to false.
     */
    returnHandStats: true,
    /**
     * If true, returns additional data containing stats on each player's tied hands.
     * Defaults to false.
     */
    returnTieHandStats: true,
    /**
     * Number of iterations in the Monte Carlo simluation to perform.
     * The more iterations, the more accurate the returned probabilities,
     * but the longer the calculation takes.
     * Defaults to 1000.
     */
    iterations: 1000000
};

const c = new Calculator(input);
const s = c.simulate();
console.log(s);
```

<details><summary>Super verbose sample output</summary>

```
{
  'Ac,Kc': {
    winCount: 280171,
    tieCount: 6678,
    handStats: {
      highCard: { count: 0, percent: 0 },
      pair: { count: 95106, percent: 9.5106 },
      twoPair: { count: 30744, percent: 3.0744 },
      trips: { count: 5180, percent: 0.518 },
      straight: { count: 104479, percent: 10.4479 },
      flush: { count: 43626, percent: 4.3626 },
      fullHouse: { count: 0, percent: 0 },
      quads: { count: 0, percent: 0 },
      straightFlush: { count: 1036, percent: 0.1036 }
    },
    tieHandStats: {
      highCard: { count: 0, percent: 0 },
      pair: { count: 775, percent: 0.0775 },
      twoPair: { count: 1603, percent: 0.1603 },
      trips: { count: 19, percent: 0.0019 },
      straight: { count: 4281, percent: 0.4281 },
      flush: { count: 0, percent: 0 },
      fullHouse: { count: 0, percent: 0 },
      quads: { count: 0, percent: 0 },
      straightFlush: { count: 0, percent: 0 }
    },
    winPercent: 28.0171,
    tiePercent: 0.6678
  },
  '2h,7d': {
    winCount: 284788,
    tieCount: 17209,
    handStats: {
      highCard: { count: 0, percent: 0 },
      pair: { count: 39160, percent: 3.916 },
      twoPair: { count: 140578, percent: 14.0578 },
      trips: { count: 48312, percent: 4.8312 },
      straight: { count: 0, percent: 0 },
      flush: { count: 32751, percent: 3.2751 },
      fullHouse: { count: 22944, percent: 2.2944 },
      quads: { count: 1043, percent: 0.1043 },
      straightFlush: { count: 0, percent: 0 }
    },
    tieHandStats: {
      highCard: { count: 0, percent: 0 },
      pair: { count: 2544, percent: 0.2544 },
      twoPair: { count: 11370, percent: 1.137 },
      trips: { count: 1840, percent: 0.184 },
      straight: { count: 0, percent: 0 },
      flush: { count: 0, percent: 0 },
      fullHouse: { count: 1455, percent: 0.1455 },
      quads: { count: 0, percent: 0 },
      straightFlush: { count: 0, percent: 0 }
    },
    winPercent: 28.4788,
    tiePercent: 1.7209
  },
  Js: {
    winCount: 191810,
    tieCount: 11826,
    handStats: {
      highCard: { count: 0, percent: 0 },
      pair: { count: 54926, percent: 5.4926 },
      twoPair: { count: 33710, percent: 3.371 },
      trips: { count: 11381, percent: 1.1381 },
      straight: { count: 81774, percent: 8.1774 },
      flush: { count: 4881, percent: 0.4881 },
      fullHouse: { count: 4907, percent: 0.4907 },
      quads: { count: 231, percent: 0.0231 },
      straightFlush: { count: 0, percent: 0 }
    },
    tieHandStats: {
      highCard: { count: 0, percent: 0 },
      pair: { count: 464, percent: 0.0464 },
      twoPair: { count: 4559, percent: 0.4559 },
      trips: { count: 366, percent: 0.0366 },
      straight: { count: 5835, percent: 0.5835 },
      flush: { count: 0, percent: 0 },
      fullHouse: { count: 602, percent: 0.0602 },
      quads: { count: 0, percent: 0 },
      straightFlush: { count: 0, percent: 0 }
    },
    winPercent: 19.181,
    tiePercent: 1.1826
  },
  'NPC 1': {
    winCount: 213260,
    tieCount: 24612,
    handStats: {
      highCard: { count: 0, percent: 0 },
      pair: { count: 66905, percent: 6.6905 },
      twoPair: { count: 76426, percent: 7.6426 },
      trips: { count: 21628, percent: 2.1628 },
      straight: { count: 10761, percent: 1.0761 },
      flush: { count: 24377, percent: 2.4377 },
      fullHouse: { count: 12442, percent: 1.2442 },
      quads: { count: 671, percent: 0.0671 },
      straightFlush: { count: 50, percent: 0.005 }
    },
    tieHandStats: {
      highCard: { count: 0, percent: 0 },
      pair: { count: 3783, percent: 0.3783 },
      twoPair: { count: 10083, percent: 1.0083 },
      trips: { count: 1645, percent: 0.1645 },
      straight: { count: 7976, percent: 0.7976 },
      flush: { count: 0, percent: 0 },
      fullHouse: { count: 1125, percent: 0.1125 },
      quads: { count: 0, percent: 0 },
      straightFlush: { count: 0, percent: 0 }
    },
    winPercent: 21.326,
    tiePercent: 2.4612
  }
}
```
</details>

Disclaimer:  
I do not bound the value of most of the options, such as `handSize` and `boardSize`, on purpose. So have fun messin some shiz up with totally crazy options values, but know I haven't tested this library with outlier options values.

## Setup

```sh
npm install
npm run build
npm test
┌─────────┬─────────────────┬───────────┬─────────────┬─────────┐
│ (index) │      hand       │  % hypo   │ % estimated │ % error │
├─────────┼─────────────────┼───────────┼─────────────┼─────────┤
│    0    │   'highCard'    │ 17.41192  │   17.4821   │ 0.4031  │
│    1    │     'pair'      │ 43.822546 │   43.8405   │  0.041  │
│    2    │    'twoPair'    │ 23.495536 │   23.4381   │ -0.2445 │
│    3    │     'trips'     │  4.82987  │    4.815    │ -0.3079 │
│    4    │   'straight'    │ 4.619382  │   4.6163    │ -0.0667 │
│    5    │     'flush'     │ 3.025494  │   3.0321    │ 0.2183  │
│    6    │   'fullHouse'   │ 2.596102  │   2.5828    │ -0.5124 │
│    7    │     'quads'     │ 0.168067  │   0.1623    │ -3.4314 │
│    8    │ 'straightFlush' │ 0.031083  │   0.0308    │ -0.9105 │
└─────────┴─────────────────┴───────────┴─────────────┴─────────┘
```
The test calculates estimated probability for all hands and compares them against their true hypothetical value (% hypo).
