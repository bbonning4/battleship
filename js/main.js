// Current bug: if AI starts on one ship and sinks another in the process, it doesn't know to go back to the other ship it hit

// // Additional features planned
// Allow player to place ships on their own if they choose, or it can be random

/*----- constants -----*/
const TILES = {
    'null': 'white !important',
    '-1': 'red !important',
    '-2': 'red !important',
    '-3': 'red !important',
    '-4': 'red !important',
    '-5': 'red !important',
    '0': 'lightskyblue',
    '1': 'darkgrey !important',
    '2': 'darkgrey !important',
    '3': 'darkgrey !important',
    '4': 'darkgrey !important',
    '5': 'darkgrey !important'
}

const RANDOM_DIRECTION = {
    '0': [-1, 0],
    '1': [1, 0],
    '2': [0, -1],
    '3': [0, 1]
}

const SHIP_TYPES = {
    '1': 'patrol',
    '2': 'submarine',
    '3': 'destroyer',
    '4': 'battleship',
    '5': 'carrier'
}

/*----- state variables -----*/
let playerBoard;
let aiBoard;
let aiHitX;
let aiHitY;
let savedX;
let savedY;

let winner = false;
let aiHit = false;
let aiTotalHits = 0;
let playerTotalHits = 0;
let aiSunk = false;
let playerHit = false;
let playerSunk = false;
let dxdySave = false;
let keepGoing = false;

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
    winner = false;
    aiHit = false;
    aiTotalHits = 0;
    playerTotalHits = 0;
    aiSunk = false;
    playerHit = false;
    playerSunk = false;
    dxdySave = false;
    keepGoing = false;
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
        if(aiBoard.board[coords.x][coords.y] <= 0 ||
           aiBoard.board[coords.x][coords.y] === null) {
            sqr.style.cssText = `background-color: ${TILES[aiBoard.board[coords.x][coords.y]]}`
        }     
    })
}


function renderMessage() {
    if(winner) {
        if(aiSunk > 0 && playerSunk > 0) {
            if(winner === 'draw') {
                $msgEl.html(`You sunk their ${SHIP_TYPES[playerSunk]}, and your ${SHIP_TYPES[aiSunk]} has been sunk!<br>It's a draw!`)
            }
            else {
                $msgEl.html(`You sunk their ${SHIP_TYPES[playerSunk]}, and your ${SHIP_TYPES[aiSunk]} has been sunk!<br>The ${winner} wins!`)
            }
        }
        else if(aiSunk > 0 || playerSunk > 0) {
            aiSunk > 0 ? $msgEl.html(`Your ${SHIP_TYPES[aiSunk]} has been sunk!<br>The ${winner} wins!`):$msgEl.html(`You sunk their ${SHIP_TYPES[playerSunk]}!<br>The ${winner} wins!`);
        }
    }
    else {
        if(aiSunk > 0 && playerSunk > 0) {
            $msgEl.html(`You sunk their ${SHIP_TYPES[playerSunk]}, and your ${SHIP_TYPES[aiSunk]} has been sunk!`)
        }
        else if(aiSunk > 0) {
            $msgEl.html(`Your ${SHIP_TYPES[aiSunk]} has been sunk!`)
        }
        else if(playerSunk > 0) {
            $msgEl.html(`You sunk their ${SHIP_TYPES[playerSunk]}!`)
        }
        else {
            $msgEl.html("");
        }
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

    $('#ai-board').on('click', 'div', handleTurn)
}

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
                            board.board[newCoords.x][newCoords.y] = shipIdx+1;
                            board.ships[shipIdx][idx] = 1;       
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
                            board.board[newCoords.x][newCoords.y] = shipIdx+1;
                            board.ships[shipIdx][idx] = 1;
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
                                    board.board[newCoords.x][newCoords.y] = shipIdx+1;
                                    board.ships[shipIdx][idx] = 1;
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
                    board.board[newCoords.x][newCoords.y] = shipIdx+1;
                    board.ships[shipIdx][idx] = 1;
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
                            board.board[newCoords.x][newCoords.y] = shipIdx+1;
                            board.ships[shipIdx][idx] = 1;
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
                            board.board[newCoords.x][newCoords.y] = shipIdx+1;
                            board.ships[shipIdx][idx] = 1;
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
                    board.board[x][y] = shipIdx+1;
                    board.ships[shipIdx][idx] = 1;
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
                left = board.board[x - i][y] >= 0 ? left+1 : left;
            }
            if(x + i >= 0 && x + i < 10 && right === i - 1) {
                right = board.board[x + i][y] >= 0 ? right+1 : right;
            }
            if(y - i >= 0 && y - i < 10 && up === i - 1) {
                up = board.board[x][y - i] >= 0 ? up+1 : up;
            }
            if(y + i >= 0 && y + i < 10 && down === i - 1) {
                down = board.board[x][y + i] >= 0 ? down+1 : down;
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
    if(playerSunk > 0) {
        playerSunk = false;
    }
    let coords = getXY(evt, $aiSquares)
    if(aiBoard.board[coords.x][coords.y] > 0) {
        // hit
        aiBoard.board[coords.x][coords.y] *= -1;
        checkSunk(coords.x, coords.y, aiBoard.board, aiBoard.ships, 'player');
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
    if(aiSunk > 0) {
        aiHit = false;
        aiSunk = false;
        dxdySave = false;
    }
    // if hit occurs in one direction, keep going
    if(dxdySave !== false) {
        // problem: ship will keep hitting in line and will error at end of ship
        newCoords = {
            'x': aiHitX + RANDOM_DIRECTION[dxdySave][0],
            'y': aiHitY + RANDOM_DIRECTION[dxdySave][1]
        }
        // if coord is off board
        if(newCoords.x < 0 || newCoords.x > 9 ||
            newCoords.y < 0 || newCoords.y > 9) {
                keepGoing = false;
            }
        // if coord has already been hit or missed   
        else if(playerBoard.board[newCoords.x][newCoords.y] < 0 ||
            playerBoard.board[newCoords.x][newCoords.y] === null) {
                keepGoing = false;
            }
        else {
            // hit!
            if(playerBoard.board[newCoords.x][newCoords.y] > 0) {
                playerBoard.board[newCoords.x][newCoords.y] *= -1;
                aiHitX = newCoords.x;
                aiHitY = newCoords.y;
                keepGoing = true;
                checkSunk(newCoords.x, newCoords.y, playerBoard.board, playerBoard.ships, 'ai');
                return;
            }
            else {
                // miss
                playerBoard.board[newCoords.x][newCoords.y] = null;
                keepGoing = false;
                return
            }
        }
        if(keepGoing) {
           // redundant, continue as normally 
           return;
        }
        // go back
        else {
            aiHitX = savedX;
            aiHitY = savedY;
            newCoords = {
                'x': aiHitX - RANDOM_DIRECTION[dxdySave][0],
                'y': aiHitY - RANDOM_DIRECTION[dxdySave][1]
            }
            playerBoard.board[newCoords.x][newCoords.y] *= -1;
            checkSunk(newCoords.x, newCoords.y, playerBoard.board, playerBoard.ships, 'ai');
            savedX = newCoords.x;
            savedY = newCoords.y;
            return;
        }
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
        if(playerBoard.board[newCoords.x][newCoords.y] < 0 ||
           playerBoard.board[newCoords.x][newCoords.y] === null) {
            return aiTurn();
           }
        // hit!
        if(playerBoard.board[newCoords.x][newCoords.y] > 0) {
            playerBoard.board[newCoords.x][newCoords.y] *= -1;
            aiHitX = newCoords.x;
            aiHitY = newCoords.y;
            dxdySave = dxdy;
            checkSunk(newCoords.x, newCoords.y, playerBoard.board, playerBoard.ships, 'ai');
            return;
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
            playerBoard.board[x][y] *= -1;
            aiHitX = x;
            aiHitY = y;
            savedX = x;
            savedY = y;
            checkSunk(x, y, playerBoard.board, playerBoard.ships, 'ai');
            return aiHit = true;
        }
        else {
            return aiTurn();
        }
    }
}

// bug: using totalHits for both is a mistake
function checkSunk(x, y, board, ships, turn) {
    let shipIdx = -1*board[x][y] - 1;
    ships[shipIdx].every((segment, idx) => {
        if(ships[shipIdx][idx] === 1) {
            ships[shipIdx][idx] = -1;
            // check for better way to keep track of this
            turn === 'player' ? playerTotalHits += 1 : aiTotalHits += 1;
            return false;
        }
        else if(ships[shipIdx][idx] === -1) {
            turn === 'player' ? playerTotalHits += 1 : aiTotalHits += 1;
            return true;
        }
    });
    if(turn === 'player') {
        if(playerTotalHits === ships[shipIdx].length) {
            // player sunk ship
            playerTotalHits = 0;
            return playerSunk = shipIdx+1;
        }
        else {
            playerTotalHits = 0;
            return playerSunk = false;
        }
    }
    else {
        if(aiTotalHits === ships[shipIdx].length) {
            // ai sunk ship
            aiTotalHits = 0;
            return aiSunk = shipIdx+1;
        }
        else {
            aiTotalHits = 0;
            return aiSunk = false;
        }
    }
}


function getWinner() {
    let playerHasShip = false;
    let aiHasShip = false;
    for(let x = 0; x < 10; x++) {
        for(let y = 0; y < 10; y++) {
            if(playerBoard.board[x][y] > 0) {
                playerHasShip = true;
            }
            if(aiBoard.board[x][y] > 0) {
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