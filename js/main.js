// define constants
// define variables used to track game state

// initialize 2 boards, including their "ships"
    // init() will create boards using a Board class
    // ships will be initialized in the constructor

// loop through ships array to have player and ai place ships onto board
    // player will click a square to "begin" placing, and will click an "end" depending on length of ship
    // prevent overlapping ships or going off board
    // allow player/ai to leave placement in case initial spot won't fit the ship
    // update board array with ship layout

// alternate hitting the other board by clicking a tile on opponent's board --handleShot()
    // ai will handleShot by initially selecting random squares until a hit
    // develop ai logic that will attempt to sink a ship after a hit
    // change tile whether a "hit"(backgroundColor='red') or "miss"(x) occurs

// update "ships" frame if a hit or sink occurs

// once all ships for a player has sunk, the winner will be determined at the end of the turn
    // if both players have all ships sunk at the end of turn, draw

// can restart a new game by clicking a button


/*----- constants -----*/

/*----- state variables -----*/
let playerBoard;
let aiBoard;
let winner = null;

class Board {
    constructor() {
        this.ships = [
            [null],
            [null, null]
        ];
        this.board = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
    }
}


/*----- cached elements  -----*/
const $msgEl = $('#msg');
const $resetBtn = $('button');
const $playerSquares = $('#player-board > div').toArray();
const $aiSquares = $('#ai-board > div').toArray();

/*----- event listeners -----*/
// $('#player-board').on('click', 'div', placeShips)
$('#ai-board').on('click', 'div', handleShot)


/*----- functions -----*/
// initialize board on refresh
init()

function init() {
    createBoards()
    placeShips()
    render()
}

function render() {
    renderBoards()
    renderMessage()
    renderControls()
}

function renderBoards() {
    // clear all tiles and ships
    // or update
}

function renderMessage() {

}

function renderControls() {
    
}

function createBoards() {
    playerBoard = new Board();
    aiBoard = new Board();
}

function placeShips() {

}

function handleShot(evt) {
    // can put these up top?
    let x;
    let y;
    const sqr = evt.target;
    const sqrIdx = $aiSquares.indexOf(sqr);
    if(sqrIdx === -1) return;
    
    x = sqrIdx % 10;
    y = Math.floor(sqrIdx/10);
    // 0,0 in top left corner 9,9 in bottom right
    console.log(x, y)

    // ai shoots next
    aiTurn()
    getWinner()
}

function aiTurn() {
    
}

function getWinner() {
    console.log(winner)
}