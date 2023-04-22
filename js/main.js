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
const TILES = {
    '0': 'lightskyblue',
    '1': 'darkgrey'
}

const RANDOM_DIRECTION = {
    '0': [-1, 0],
    '1': [1, 0],
    '2': [0, -1],
    '3': [0, 1]
}

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
    $playerSquares.forEach(sqr => {
        let coords = getXY(sqr, $playerSquares)
        sqr.style.backgroundColor = TILES[playerBoard.board[coords.x][coords.y]]
    })
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
    let x;
    let y;
    // player ships placed
    playerBoard.ships.forEach((ship, shipIdx) => {
        let segments = 0;
        ship.forEach(function place(segment, idx) { 
            if(segments > 0) {
                // randomise one of the 4 directions the next segment can go
                let dxdy = Math.floor(Math.random() * 4)
                let newCoords = {
                    'x': x + RANDOM_DIRECTION[dxdy][0],
                    'y': y + RANDOM_DIRECTION[dxdy][1]
                }
                if (newCoords.x >=0 && newCoords.x < 10 &&
                    newCoords.y >=0 && newCoords.y < 10) {
                        if(playerBoard.board[newCoords.x][newCoords.y] === 0) {
                            playerBoard.board[newCoords.x][newCoords.y] = 1;
                            playerBoard.ships[shipIdx][idx] = 1;
                        }
                    }
                else {
                    place(segment, idx)
                }
                x = newCoords.x;
                y = newCoords.y;
                segments += 1;
            }
            if(playerBoard.ships[shipIdx][idx] === null) {
                x = Math.floor(Math.random() * 10)
                y = Math.floor(Math.random() * 10)
                if(playerBoard.board[x][y] === 0) {
                    playerBoard.board[x][y] = 1;
                    playerBoard.ships[shipIdx][idx] = 1;
                }
                else {
                    place(segment, idx)
                }
                segments += 1;
            }
        })
    })
    // ai ships placed
    aiBoard.ships.forEach((ship, shipIdx) => {
        ship.forEach(function place(segment, idx) {
            if(segment === null) {
                let x = Math.floor(Math.random() * 10)
                let y = Math.floor(Math.random() * 10)
                if(aiBoard.board[x][y] === 0) {
                    aiBoard.board[x][y] = 1;
                    aiBoard.ships[shipIdx][idx] = 1;
                }
                else {
                    place(segment, idx)
                }
            }
        })
    })
}
// // attempt at making player choose their positions
// while(segment === null) {
//     const clickHandle = (evt) => {
//         let coords = getXY(evt, $playerSquares)
//         if(playerBoard.board[coords.x][coords.y] === 0) {
//             playerBoard.board[coords.x][coords.y] = 1;
//             segment = 1;
//             $('#player-board').off('click', 'div', clickHandle);
//         }
//     }
// }
// $('#player-board').on('click', 'div', clickHandle);



function handleShot(evt) {
    let coords = getXY(evt, $aiSquares)
    // 0,0 in top left corner 9,9 in bottom right

    // ai shoots next
    aiTurn()
    getWinner()
}

function aiTurn() {
    
}

function getWinner() {
    // console.log(winner)
}

function getXY(evt, $squares) {
    let x;
    let y;
    // const sqr = evt.target;
    const sqrIdx = $squares.indexOf(evt);
    x = sqrIdx % 10;
    y = Math.floor(sqrIdx/10);
    return {'x':x, 'y':y};
}