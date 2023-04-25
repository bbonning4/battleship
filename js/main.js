// define constants
// define variables used to track game state

// initialize 2 boards, including their "ships"
    // init() will create boards using a Board class
    // ships will be initialized in the constructor

// loop through ships array to have player and ai place ships onto board
    // initially, both player and ai will place ships randomly
    // prevent overlapping ships or going off board
    // allow player/ai to leave placement in case initial spot won't fit the ship
    // update board array with ship layout

// alternate hitting the other board by clicking a tile on opponent's board --handleShot()
    // ai will handleShot by initially selecting random squares until a hit
    // develop ai logic that will attempt to sink a ship after a hit
    // change tile whether a "hit"(backgroundColor='red') or "miss"(white) occurs

// update "ships" frame if a hit or sink occurs

// once all ships for a player has sunk, the winner will be determined at the end of the turn
    // if both players have all ships sunk at the end of turn, draw

// can restart a new game by clicking a button

// // Additional features planned
// Allow player to place ships on their own if they choose, or it can be random

/*----- constants -----*/
const TILES = {
    'null': 'white !important',
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

const SHIP_TYPES = {
    '0': 'patrol',
    '1': 'submarine',
    '2': 'destroyer',
    '3': 'battleship',
    '4': 'carrier'
}

/*----- state variables -----*/
let playerBoard;
let aiBoard;
let winner = false;
let aiHit = false;
let aiSunk = false;
let playerHit = false;
let playerSunk = false;
let aiHits = 0;
let aiHitX;
let aiHitY;
let savedX;
let savedY;

class Board {
    constructor() {
        this.ships = [
            [null, null],
            [null, null, null],
            [null, null, null],
            [null, null, null, null],
            [null, null, null, null, null]
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
    render()
    placeShips(playerBoard, $playerSquares)
    placeShips(aiBoard, $aiSquares)
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
        let coords = getXY(sqr, $playerSquares);
        sqr.style.cssText = `background-color: ${TILES[playerBoard.board[coords.x][coords.y]]}`;
    })
    $aiSquares.forEach(sqr => {
        let coords = getXY(sqr, $aiSquares)
        // we don't want to see the enemy ships
        if(aiBoard.board[coords.x][coords.y] !== 1) {
            sqr.style.cssText = `background-color: ${TILES[aiBoard.board[coords.x][coords.y]]}`
        }     
    })
}


function renderMessage() {
    if(winner) {
        if(winner === 'draw') {
            $msgEl.html("It's a draw!")
        }
        else {
            $msgEl.html(`The ${winner} wins!`)
        }
    }
    else {
        $msgEl.html("");
    }
}

function renderControls() {
    if(winner) {
        // game ends
        $('#ai-board').off('click', 'div', handleTurn)
        $aiSquares.forEach(sqr => {
            let coords = getXY(sqr, $aiSquares)
            // we don't want to see the enemy ships
            if(aiBoard.board[coords.x][coords.y] === 0) {
                sqr.style.cssText = `background-color: lightskyblue !important`;
            }     
        })
        return;
    }

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

    $playerSquares.forEach(sqr => {
        $(sqr).removeClass();
    })
    $aiSquares.forEach(sqr => {
        $(sqr).removeClass();     
    })

    $('#ai-board').on('click', 'div', handleTurn)

    winner = false;
    aiHit = false;
    aiHits = 0;
    aiSunk = false;
    playerHit = false;
    playerSunk = false;

}

// Current error: if there is a ship in the way and wall, viable isn't being calc'd correctly?
// results in it thinking the ship can fit
function placeShips(board, squares) {
    let x;
    let y;
    let ogX;
    let ogY;
    let dxdy;
    let newCoords;
    let segments;
    let goBack = false;
    
    board.ships.forEach((ship, shipIdx) => {
        segments = 0;
        goBack = false;
        ship.forEach(function place(segment, idx) {
            if(segments > 1) {
                if(goBack) {
                    newCoords = {
                        'x': ogX - RANDOM_DIRECTION[dxdy][0],
                        'y': ogY - RANDOM_DIRECTION[dxdy][1] 
                    }
                    if(newCoords.x >= 0 && newCoords.x < 10 &&
                       newCoords.y >= 0 && newCoords.y < 10) {
                        if(board.board[newCoords.x][newCoords.y] === 0) {
                            board.board[newCoords.x][newCoords.y] = 1;
                            board.ships[shipIdx][idx] = 1;
                            $(squares[newCoords.x + (newCoords.y*10)]).attr('class', `${shipIdx}`);            
                            ogX = newCoords.x;
                            ogY = newCoords.y;
                            goBack = true;
                            segments += 1;
                            return;
                        }
                    }
                    else {
                        // shouldn't reach this point
                        return console.log('Error: Ship segment not placed');
                    }
                }

                newCoords = {
                    'x': x + RANDOM_DIRECTION[dxdy][0],
                    'y': y + RANDOM_DIRECTION[dxdy][1]
                }

                if (newCoords.x >= 0 && newCoords.x < 10 &&
                    newCoords.y >= 0 && newCoords.y < 10) {
                        if(board.board[newCoords.x][newCoords.y] === 0) {
                            board.board[newCoords.x][newCoords.y] = 1;
                            board.ships[shipIdx][idx] = 1;
                            $(squares[newCoords.x + (newCoords.y*10)]).attr('class', `${shipIdx}`);
                            x = newCoords.x;
                            y = newCoords.y;
                            segments += 1;
                            return;
                        }
                        // on board but a ship blocking path
                        else {
                            // already confirmed viable so no guards needed here
                            newCoords = {
                                'x': ogX - RANDOM_DIRECTION[dxdy][0],
                                'y': ogY - RANDOM_DIRECTION[dxdy][1] 
                            }
                            if(newCoords.x >= 0 && newCoords.x < 10 &&
                               newCoords.y >= 0 && newCoords.y < 10) {
                                if(board.board[newCoords.x][newCoords.y] === 0) {
                                    board.board[newCoords.x][newCoords.y] = 1;
                                    board.ships[shipIdx][idx] = 1;
                                    $(squares[newCoords.x + (newCoords.y*10)]).attr('class', `${shipIdx}`);
                                    ogX = newCoords.x;
                                    ogY = newCoords.y;
                                    goBack = true;
                                    segments += 1;
                                    return;
                                }
                            }
                            else {
                                // shouldn't reach this point
                                return console.log('Error: Ship segment not placed');
                            }
                        }
                }
                // off board
                else {
                    newCoords = {
                        'x': ogX - RANDOM_DIRECTION[dxdy][0],
                        'y': ogY - RANDOM_DIRECTION[dxdy][1] 
                    }
                    board.board[newCoords.x][newCoords.y] = 1;
                    board.ships[shipIdx][idx] = 1;
                    $(squares[newCoords.x + (newCoords.y*10)]).attr('class', `${shipIdx}`);
                    ogX = newCoords.x;
                    ogY = newCoords.y;
                    segments += 1;
                    goBack = true;
                    return;
                }
            }

            if(segments > 0) {
                if(goBack) {
                    newCoords = {
                        'x': ogX - RANDOM_DIRECTION[dxdy][0],
                        'y': ogY - RANDOM_DIRECTION[dxdy][1] 
                    }
                    if(newCoords.x >= 0 && newCoords.x < 10 &&
                       newCoords.y >= 0 && newCoords.y < 10) {
                        if(board.board[newCoords.x][newCoords.y] === 0) {
                            board.board[newCoords.x][newCoords.y] = 1;
                            board.ships[shipIdx][idx] = 1;
                            $(squares[newCoords.x + (newCoords.y*10)]).attr('class', `${shipIdx}`);
                            ogX = newCoords.x;
                            ogY = newCoords.y;
                            goBack = true;
                            segments += 1;
                            return;
                        }
                    }
                    else {
                        // shouldn't reach this point
                        return console.log('Error: Ship segment not placed');
                    }
                }

                // randomise one of the 4 directions the next segment can go
                dxdy = Math.floor(Math.random() * 4)
                // check if direction is viable
                if(checkViablePlace(x, y, ship.length, board, dxdy) === false) {
                    return place(segment, idx)
                }
                newCoords = {
                    'x': x + RANDOM_DIRECTION[dxdy][0],
                    'y': y + RANDOM_DIRECTION[dxdy][1]
                }
                if (newCoords.x >= 0 && newCoords.x < 10 &&
                    newCoords.y >= 0 && newCoords.y < 10) {
                        if(board.board[newCoords.x][newCoords.y] === 0) {
                            board.board[newCoords.x][newCoords.y] = 1;
                            board.ships[shipIdx][idx] = 1;
                            $(squares[newCoords.x + (newCoords.y*10)]).attr('class', `${shipIdx}`);
                            x = newCoords.x;
                            y = newCoords.y;
                            segments += 1;
                            return;
                        }
                        else {
                            goBack = true;
                            return place(segment, idx)
                        }
                    }
                else {
                    return place(segment, idx)
                }
            }

            if(board.ships[shipIdx][idx] === null) {
                x = Math.floor(Math.random() * 10)
                y = Math.floor(Math.random() * 10)
                if(board.board[x][y] === 0) {
                    // try to pass board.board instead?
                    if(checkViablePlace(x, y, ship.length, board, null) === false) {
                        return place(segment, idx)
                    }
                    board.board[x][y] = 1;
                    board.ships[shipIdx][idx] = 1;
                    $(squares[x + (y*10)]).attr('class', `${shipIdx}`);
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
    render()
}


function checkViablePlace(x, y, length, board, dxdy) {
    let left = 0;
    let right = 0;
    let up = 0;
    let down = 0;
    if(aiHit === true) {
        for(let i = 1; i < length; i++) {
            if(x - i >= 0 && x - i < 10 && left === i - 1) {
                left = board.board[x - i][y] === 0 ||
                       board.board[x - i][y] === 1 ? left+1 : left;
            }
            if(x + i >= 0 && x + i < 10 && right === i - 1) {
                right = board.board[x + i][y] === 0 ||
                        board.board[x + i][y] === 1 ? right+1 : right;
            }
            if(y - i >= 0 && y - i < 10 && up === i - 1) {
                up = board.board[x][y - i] === 0 ||
                     board.board[x][y - i] === 1 ? up+1 : up;
            }
            if(y + i >= 0 && y + i < 10 && down === i - 1) {
                down = board.board[x][y + i] === 0 ||
                       board.board[x][y + i] === 1 ? down+1 : down;
            }
        }
    }
    else {
        for(let i = 1; i < length; i++) {
            if(x - i >= 0 && x - i < 10 && left === i - 1) {
                left = board.board[x - i][y] === 0 ? left+1 : left;
            }
            if(x + i >= 0 && x + i < 10 && right === i - 1) {
                right = board.board[x + i][y] === 0 ? right+1 : right;
            }
            if(y - i >= 0 && y - i < 10 && up === i - 1) {
                up = board.board[x][y - i] === 0 ? up+1 : up;
            }
            if(y + i >= 0 && y + i < 10 && down === i - 1) {
                down = board.board[x][y + i] === 0 ? down+1 : down;
            }
        }
    }
    if(dxdy !== null) {
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
    else {
        return false;
    }
}


function handleTurn(evt) {
    let coords = getXY(evt, $aiSquares)
    if(aiBoard.board[coords.x][coords.y] > 0) {
        // hit
        aiBoard.board[coords.x][coords.y] = -1;
        // checkSunk(coords.x, coords.y, $aiSquares, aiBoard.ships, 'player');
    }
    else if(aiBoard.board[coords.x][coords.y] === 0) {
        // miss
        aiBoard.board[coords.x][coords.y] = null;
    }
    else {
        return;
    }

    aiTurn()
    getWinner()
    render()
}

function aiTurn() {
    if(aiSunk === true) {
        aiHit = false;
        aiSunk = false;
    }
    if(aiHit === true) {
        if(checkViablePlace(aiHitX, aiHitY, 2, playerBoard, null) === false) {
            aiHitX = savedX;
            aiHitY = savedY;
        }
        // randomize direction
        let dxdy = Math.floor(Math.random() * 4)
        newCoords = {
            'x': aiHitX + RANDOM_DIRECTION[dxdy][0],
            'y': aiHitY + RANDOM_DIRECTION[dxdy][1]
        }
        // guard to stay in bounds
        if(newCoords.x < 0 || newCoords.x > 9 ||
           newCoords.y < 0 || newCoords.y > 9) {
            return aiTurn();
           }
        // if coord has already been hit or missed   
        if(playerBoard.board[newCoords.x][newCoords.y] !== 0 &&
           playerBoard.board[newCoords.x][newCoords.y] !== 1) {
            return aiTurn();
           }
        // hit!
        if(playerBoard.board[newCoords.x][newCoords.y] === 1) {
            playerBoard.board[newCoords.x][newCoords.y] = -1;
            aiHitX = newCoords.x;
            aiHitY = newCoords.y;
            checkSunk(newCoords.x, newCoords.y, $playerSquares, playerBoard.ships, 'ai');
        }
        else {
            playerBoard.board[newCoords.x][newCoords.y] = null;
        }
    }
    else {
        let x = Math.floor(Math.random() * 10)
        let y = Math.floor(Math.random() * 10)
        if(playerBoard.board[x][y] === 0) {
            playerBoard.board[x][y] = null;
        }
        else if(playerBoard.board[x][y] > 0) {
            playerBoard.board[x][y] = -1;
            aiHitX = x;
            aiHitY = y;
            savedX = x;
            savedY = y;
            checkSunk(x, y, $playerSquares, playerBoard.ships, 'ai');
            return aiHit = true;
        }
        else {
            return aiTurn();
        }
    }
}


function checkSunk(x, y, squares, ships, turn) {
    let shipIdx = $(squares[x + (y*10)]).attr('class');
    ships[shipIdx].every((segment, idx) => {
        if(ships[shipIdx][idx] === 1) {
            ships[shipIdx][idx] = -1;
            // check for better way to keep track of this
            aiHits += 1;
            return false;
        }
        else if(ships[shipIdx][idx] === -1) {
            aiHits += 1;
            return true;
        }
    });
    if(aiHits === ships[shipIdx].length) {
        // ship is sunk!
        if(turn === 'player') {
            // player sunk ship
            return playerSunk = true;
        }
        else {
            // ai sunk ship
            console.log(`ship ${shipIdx} has been sunk!`)
            aiHits = 0;
            aiSunk = true;
        }
    }
    else {
        if(turn === 'player') {
            return playerSunk = false;
        }
        else {
            aiHits = 0;
            return aiSunk = false;
        }
    }
}


function getWinner() {
    let playerHasShip = false;
    let aiHasShip = false;
    for(let x = 0; x < 10; x++) {
        for(let y = 0; y < 10; y++) {
            if(playerBoard.board[x][y] === 1) {
                playerHasShip = true;
            }
            if(aiBoard.board[x][y] === 1) {
                aiHasShip = true;
            }
        }
    }
    if(playerHasShip === false && aiHasShip === false) {
        return winner = 'draw';
    }
    if(playerHasShip === false) {
        return winner = 'AI';
    }
    if(aiHasShip === false) {
        return winner = 'player';
    }
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