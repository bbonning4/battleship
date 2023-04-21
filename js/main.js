// initialize 2 boards, including their "ships"
// init() will create boards using a Board class
// ships will be initialized in the constructor

// loop through ships to have player and ai place ships onto board
// player will click a square to "begin" placing, and will click an "end" depending on length of ship
// repeat until all ships are successfully placed(ships arrays won't contain null)

// alternate hitting the other board by clicking a tile on opponent's board
// change tile whether a "hit"(backgroundColor='red') or "miss"(x) occurs
// for the ai, if a hit is made it will attempt to hit around that tile until a "sink" occurs

// update "ships" frame if a hit or sink occurs
// once all ships are sunk, that player loses

// can restart a new game by clicking a button

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
        ]
    }
}

// variables
let playerBoard;
let aiBoard;

// initialize board on refresh
init()

// functions
function init() {
    renderBoard()
    createBoards()
    placeShips()
}

function renderBoard() {
    // clear all tiles and ships
    // or update
}

function createBoards() {
    playerBoard = new Board();
    aiBoard = new Board();
}

function placeShips() {

}