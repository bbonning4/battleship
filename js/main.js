/*----- constants -----*/
const TILES = {
    'null': 'white !important',
    '-1': 'red !important',
    '-2': 'red !important',
    '-3': 'red !important',
    '-4': 'red !important',
    '-5': 'red !important',
    '0': 'lightskyblue',
    '1': '#42423f !important',
    '2': '#42423f !important',
    '3': '#42423f !important',
    '4': '#42423f !important',
    '5': '#42423f !important'
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

const SHIP_LENGTHS = {
    '1': 2,
    '2': 3,
    '3': 3,
    '4': 4,
    '5': 5
}

/*----- state variables -----*/
let playerBoard;
let aiBoard;
let aiHitX;
let aiHitY;
let savedX;
let savedY;

let hardMode = false;
let gameStart = false;

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
        this.shipNumFound = {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0
        }
    }
}


/*----- cached elements  -----*/
const $msgEl = $('#msg');
const $resetBtn = $('#new');
const $hardModeBtn = $('#hard-mode')
const $playerSquares = $('#player-board > div').toArray();
const $aiSquares = $('#ai-board > div').toArray();

/*----- event listeners -----*/
// $('#player-board').on('click', 'div', placeShips)
$('#ai-board').on('click', 'div', handleTurn)
$resetBtn.on('click', init)
$hardModeBtn.on('click', enableHardMode)


/*----- functions -----*/
// initialize board on refresh
init()

function enableHardMode() {
    if(hardMode) {
        hardMode = false;
        $hardModeBtn.css({'background-color':'', 'color':'black', 'border':''})
        $hardModeBtn.text('Enable Hard Mode')
    }
    else {
        hardMode = true;
        $hardModeBtn.css({'background-color':'red', 'color':'white', 'border':'5px solid gold'})
        $hardModeBtn.text('HARD MODE ENABLED')
    }
    init()
}

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
    gameStart = false;
    createBoards()
    placeShips(playerBoard, $playerSquares)
    placeShips(aiBoard, $aiSquares)
}

function render() {
    renderBoards()
    renderMessage()
    renderControls()
}

function renderBoards() {
    // clear all tiles and ships or update board
    $playerSquares.forEach(sqr => {
        let coords = getXY(sqr, $playerSquares);
        let boardValue = playerBoard.board[coords.x][coords.y];

        if(boardValue !== 0 && boardValue !== null) {
            playerBoard.shipNumFound[Math.abs(boardValue)] += 1;
        }
        else {
            $(sqr).removeAttr('class');
            $(sqr).attr('style', `background-color: ${TILES[playerBoard.board[coords.x][coords.y]]}`);
        }  
        if(playerBoard.shipNumFound[Math.abs(boardValue)] === 1 ||
            playerBoard.shipNumFound[Math.abs(boardValue)] === SHIP_LENGTHS[Math.abs(boardValue)]) {
            if(boardValue > 0) {
                $(sqr).removeAttr('style');
                $(sqr).removeAttr('class');
                checkTriangleDirection(coords.x, coords.y, playerBoard, boardValue, sqr);
            }
            else {
                $(sqr).removeAttr('class');
                $(sqr).attr('style', `background-color: ${TILES[playerBoard.board[coords.x][coords.y]]}`);
            }  
        }
        else {
            $(sqr).removeAttr('class');
            $(sqr).attr('style', `background-color: ${TILES[playerBoard.board[coords.x][coords.y]]}`);
        } 
    })
    playerBoard.shipNumFound = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0
    }

    $aiSquares.forEach(sqr => {
        let coords = getXY(sqr, $aiSquares)
        // we don't want to see the enemy ships unless there is a winner
        if(winner) {
            sqr.style.cssText = `background-color: ${TILES[aiBoard.board[coords.x][coords.y]]}`
        }
        else {
            if(aiBoard.board[coords.x][coords.y] <= 0 ||
               aiBoard.board[coords.x][coords.y] === null) {
                sqr.style.cssText = `background-color: ${TILES[aiBoard.board[coords.x][coords.y]]}`
            }     
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

    if(gameStart) {
        $resetBtn.text('New Game');
    }
    else {
        $resetBtn.text('Shuffle Board');
    }

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
                    if(checkGuards(newCoords.x, newCoords.y, board.board)) {    
                        board.board[newCoords.x][newCoords.y] = shipIdx+1;
                        board.ships[shipIdx][idx] = 1;       
                        ogX = newCoords.x;
                        ogY = newCoords.y;
                        goBack = true;
                        segments += 1;
                        return;              
                    }
                }

                newCoords = {
                    'x': x + RANDOM_DIRECTION[dxdy][0],
                    'y': y + RANDOM_DIRECTION[dxdy][1]
                }

                if(checkWallGuards(newCoords.x, newCoords.y)) {
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
                            newCoords = {
                                'x': ogX - RANDOM_DIRECTION[dxdy][0],
                                'y': ogY - RANDOM_DIRECTION[dxdy][1] 
                            }
                            if(checkGuards(newCoords.x, newCoords.y, board.board)) {
                                board.board[newCoords.x][newCoords.y] = shipIdx+1;
                                board.ships[shipIdx][idx] = 1;
                                ogX = newCoords.x;
                                ogY = newCoords.y;
                                goBack = true;
                                segments += 1;
                                return;   
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
                    if(checkGuards(newCoords.x, newCoords.y, board.board)) {
                        board.board[newCoords.x][newCoords.y] = shipIdx+1;
                        board.ships[shipIdx][idx] = 1;
                        ogX = newCoords.x;
                        ogY = newCoords.y;
                        goBack = true;
                        segments += 1;
                        return; 
                    }
                }

                // randomise one of the 4 directions the next segment can go
                dxdy = Math.floor(Math.random() * 4);
                // check if direction is viable
                if(checkViablePlace(x, y, ship.length, board, dxdy) === false) {
                    return place(segment, idx);
                }
                newCoords = {
                    'x': x + RANDOM_DIRECTION[dxdy][0],
                    'y': y + RANDOM_DIRECTION[dxdy][1]
                }
                if(checkWallGuards(newCoords.x, newCoords.y)) {
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
                            return place(segment, idx);
                        }
                    }
                else {
                    return place(segment, idx);
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
    render();
}


function checkViablePlace(x, y, length, board, dxdy) {
    let left = 0;
    let right = 0;
    let up = 0;
    let down = 0;
    if(aiHit === true) {
        // used for checking aiHits
        for(let i = 1; i < length; i++) {
            if(x - i >= 0 && x - i < 10 && left === i - 1) {
                left = board.board[x - i][y] !== null && board.board[x - i][y] >= 0 ? left+1 : left;
            }
            if(x + i >= 0 && x + i < 10 && right === i - 1) {
                right = board.board[x + i][y] !== null && board.board[x + i][y] >= 0 ? right+1 : right;
            }
            if(y - i >= 0 && y - i < 10 && up === i - 1) {
                up = board.board[x][y - i] !== null && board.board[x][y - i] >= 0 ? up+1 : up;
            }
            if(y + i >= 0 && y + i < 10 && down === i - 1) {
                down = board.board[x][y + i] !== null && board.board[x][y + i] >= 0 ? down+1 : down;
            }
        }
    }
    else {
        // used for placing ships
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
    gameStart = true;
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
    if(aiSunk > 0 && aiSunk !== false) {
        aiHit = false;
        aiSunk = false;
        dxdySave = false;
        if(hardMode) {
            for(let ship = 0; ship < playerBoard.ships.length; ship++) {
                let negative = 0;
                let positive = 0;
                for(let segment = 0; segment < playerBoard.ships[ship].length; segment++) {
                    if(playerBoard.ships[ship][segment] === 1) {
                        positive += 1;
                    }
                    else {
                        negative += 1;
                    }
                    if(positive > 0 && negative > 0) {
                        // Have another ship hit, go back to attempt sink
                        for(let x in playerBoard.board) {
                            for(let y in playerBoard.board[x]) {
                                if(playerBoard.board[x][y] === -1*(ship+1)) {
                                    savedX = parseInt(x);
                                    aiHitX = parseInt(x);
                                    savedY = parseInt(y);
                                    aiHitY = parseInt(y);
                                    aiHit = true;
                                    return aiTurn();
                                }
                            }
                        }   
                    }
                }
            }
        }
    }
    if(hardMode) {
        // if hit occurs in one direction, keep going
        if(dxdySave !== false) {
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
                if(checkViablePlace(aiHitX, aiHitY, 2, playerBoard, dxdySave) === false) {
                    dxdySave = false;
                    return aiTurn();
                }
                newCoords = {
                    'x': aiHitX - RANDOM_DIRECTION[dxdySave][0],
                    'y': aiHitY - RANDOM_DIRECTION[dxdySave][1]
                }
                // guard against going through water(0's) since checkViablePlace will still pass true for water
                if(playerBoard.board[newCoords.x][newCoords.y] === 0) {
                    aiHitX = savedX;
                    aiHitY = savedY;
                    dxdySave = false;
                    return aiTurn();
                }
                playerBoard.board[newCoords.x][newCoords.y] *= -1;
                checkSunk(newCoords.x, newCoords.y, playerBoard.board, playerBoard.ships, 'ai');
                savedX = newCoords.x;
                savedY = newCoords.y;
                return;
            }
        }
    }
    // easy mode, doesn't know how to goBack yet
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


function checkSunk(x, y, board, ships, turn) {
    let shipIdx = -1*(board[x][y]+1);

    for(let idx in ships[shipIdx]) {
        if(ships[shipIdx][idx] === 1) {
            ships[shipIdx][idx] = -1;
            turn === 'player' ? playerTotalHits += 1 : aiTotalHits += 1;
            break;
        }
        else if(ships[shipIdx][idx] === -1) {
            turn === 'player' ? playerTotalHits += 1 : aiTotalHits += 1;
            continue;
        }
    }
    
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


function checkTriangleDirection(x, y, board, value, sqr) {
    if(x + 1 >= 0 && x + 1 < 10) {
        if(Math.abs(board.board[x + 1][y]) === Math.abs(value)) {
            // point left
            $(sqr).addClass('triangle-left');
        }
    }
    if(x - 1 >= 0 && x - 1 < 10) {
        if(Math.abs(board.board[x - 1][y]) === Math.abs(value)) {
            // point right
            $(sqr).addClass('triangle-right');
        }
    }
    if(y + 1 >= 0 && y + 1 < 10) {
        if(Math.abs(board.board[x][y + 1]) === Math.abs(value)) {
            // point up
            $(sqr).addClass('triangle-up');
        }
    }
    if(y - 1 >= 0 && y - 1 < 10) {
        if(Math.abs(board.board[x][y - 1]) === Math.abs(value)) {
            // point down
            $(sqr).addClass('triangle-down');
        }
    }
}


function checkWallGuards(x, y) {
    if(x >= 0 && x < 10 &&
       y >= 0 && y < 10) {
        return true;
       }
    else {
        return false;
    }
}


function checkGuards(x, y, board) {
    if(x >= 0 && x < 10 &&
       y >= 0 && y < 10) {
            if(board[x][y] === 0) {
                return true;
            }
            else {
                return false;
            }
        }
    else {
        return false;
    }
}