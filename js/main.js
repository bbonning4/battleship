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
    'null': 'lightskyblue !important',
    '-1': 'red !important',
    '0': 'lightskyblue',
    '1': 'darkgrey !important'
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
            [null, null],
            [null, null],
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
$('#ai-board').on('click', 'div', handleTurn)
$resetBtn.on('click', init)


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
        sqr.style.cssText = `background-color: ${TILES[playerBoard.board[coords.x][coords.y]]}`
        if(playerBoard.board[coords.x][coords.y] === null) {
            sqr.innerText = 'X'
        }
    })
    $aiSquares.forEach(sqr => {
        let coords = getXY(sqr, $aiSquares)
        // we don't want to see the enemy ships
        if(aiBoard.board[coords.x][coords.y] !== 1) {
            sqr.style.cssText = `background-color: ${TILES[aiBoard.board[coords.x][coords.y]]}`
            sqr.innerText = ''
        }     
        if(aiBoard.board[coords.x][coords.y] === null) {
            sqr.innerText = 'X'
        }
    })
}


function renderMessage() {

}

function renderControls() {
    $('#ai-board').css({
        'grid-template-columns': 'repeat(10, 4vmin)',
        'grid-template-rows': 'repeat(10, 4vmin)'
    })
    $('#player-board').css({
        'grid-template-columns': 'repeat(10, 3vmin)',
        'grid-template-rows': 'repeat(10, 3vmin)'
    })
}

function createBoards() {
    playerBoard = new Board();
    aiBoard = new Board();
}


function placeShips() {
    let x;
    let y;
    let ogX;
    let ogY;
    let dxdy;
    let newCoords;
    // player ships placed
    playerBoard.ships.forEach((ship, shipIdx) => {
        let segments = 0;
        ship.forEach(function place(segment, idx) {
            if(segments > 1) {
                // continue going in same direction
                // if wall/other ship is blocking, go other direction
                // if both directions blocked, revert values of previous squares and go in perpendicular direction
                // if still blocked, ship can't be placed -> revert all values and place() again
                
            } 
            if(segments > 0) {
                // randomise one of the 4 directions the next segment can go
                dxdy = Math.floor(Math.random() * 4)
                // check if direction is viable
                if(!checkViablePlace(x, y, ship.length, playerBoard, dxdy)) {
                    return place(segment, idx)
                }
                newCoords = {
                    'x': x + RANDOM_DIRECTION[dxdy][0],
                    'y': y + RANDOM_DIRECTION[dxdy][1]
                }
                if (newCoords.x >= 0 && newCoords.x < 10 &&
                    newCoords.y >= 0 && newCoords.y < 10) {
                        if(playerBoard.board[newCoords.x][newCoords.y] === 0) {
                            playerBoard.board[newCoords.x][newCoords.y] = 1;
                            playerBoard.ships[shipIdx][idx] = 1;
                            x = newCoords.x;
                            y = newCoords.y;
                            segments += 1;
                            return;
                        }
                        else {
                            return place(segment, idx)
                        }
                    }
                else {
                    return place(segment, idx)
                }
            }
            if(playerBoard.ships[shipIdx][idx] === null) {
                x = Math.floor(Math.random() * 10)
                y = Math.floor(Math.random() * 10)
                if(playerBoard.board[x][y] === 0) {
                    // try to pass playerBoard.board instead
                    if(!checkViablePlace(x, y, ship.length, playerBoard, null)) {
                        place(segment, idx)
                    }
                    playerBoard.board[x][y] = 1;
                    playerBoard.ships[shipIdx][idx] = 1;
                    ogX = x;
                    ogY = y;
                    segments += 1;
                    return;
                }
                else {
                    return place(segment, idx)
                }
            }
        })
    })
    // // ai ships placed
    // aiBoard.ships.forEach((ship, shipIdx) => {
    //     ship.forEach(function place(segment, idx) {
    //         if(segment === null) {
    //             let x = Math.floor(Math.random() * 10)
    //             let y = Math.floor(Math.random() * 10)
    //             if(aiBoard.board[x][y] === 0) {
    //                 aiBoard.board[x][y] = 1;
    //                 aiBoard.ships[shipIdx][idx] = 1;
    //             }
    //             else {
    //                 place(segment, idx)
    //             }
    //         }
    //     })
    // })
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

function checkViablePlace(x, y, length, board, dxdy) {
    let left = 0;
    let right = 0;
    let up = 0;
    let down = 0;
    for(let i = 1; i < length; i++) {
        if(board.board[x - i] && left === i - 1) {
            left = board.board[x - i][y] === 0 ? left+1 : left;
        }
        if(board.board[x + i] && right === i - 1) {
            right = board.board[x + i][y] === 0 ? right+1 : right;
        }
        if(board.board[x][y - i] && up === i - 1) {
            up = board.board[x][y - i] === 0 ? up+1 : up;
        }
        if(board.board[x][y + i] && down === i - 1) {
            down = board.board[x][y + i] === 0 ? down+1 : down;
        }
    }
    if(dxdy) {
        if(dxdy === 0 || dxdy === 1) {
            if(left + right >= length - 1) {
                return true;
            }
            else {
                return false;
            }
        }
        if(dxdy === 2 || dxdy === 3) {
            if(up + down >= length - 1) {
                return true
            }
            else {
                return false;
            }
        }
    }

    if(left + right >= length - 1 || up + down >= length - 1) {
        return true;
    }

    return false;
}


function handleTurn(evt) {
    let coords = getXY(evt, $aiSquares)
    if(aiBoard.board[coords.x][coords.y] > 0) {
        // hit
        aiBoard.board[coords.x][coords.y] = -1;
    }
    else if(aiBoard.board[coords.x][coords.y] === 0) {
        // miss
        aiBoard.board[coords.x][coords.y] = null;
    }

    // ai shoots next
    aiTurn()
    getWinner()
    render()
}

function aiTurn() {
    
}

function getWinner() {
    // console.log(winner)
}

function getXY(evt, $squares) {
    let x;
    let y;
    if(evt.target) {
        evt = evt.target;
    }
    const sqrIdx = $squares.indexOf(evt);
    x = sqrIdx % 10;
    y = Math.floor(sqrIdx/10);
    return {'x':x, 'y':y};
}