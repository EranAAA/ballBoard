const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE';

const GAMER_IMG = '<img src="img/gamer.png">';
const BALL_IMG = '<img src="img/ball.png">';
const GLUE_IMG = '<img src="img/candy.png">';

// Model:
var gBoard;
var gGamerPos;
var gCountBalls;
var gCountDownBalls = 2
var gelHeader = document.querySelector('h1').innerHTML
var gIsFreezeCell = false

function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gCountBalls = 0
	gBoard = buildBoard();
	renderBoard(gBoard);
	addBallRandomly()
	addGlueRandomly()
	document.querySelector('button').style.display = 'none'
}

function buildBoard() {
	// Create the Matrix 10 * 12 
	var board = createMat(10, 12);
	// Put FLOOR everywhere and WALL at edges

	for (var i = 0; i < board.length; i++) {
		var row = board[i];
		for (var j = 0; j < row.length; j++) {
			var cell = { type: FLOOR, gameElement: null }
			if ((i === 0 && j !== board.length / 2) || (i === board.length - 1 && j !== board.length / 2) ||
				(j === 0 && i !== board.length / 2) || (j === row.length - 1 && i !== board.length / 2)) {
				cell.type = WALL;
			}
			board[i][j] = cell
		}
	}
	// Place the gamer and two balls
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	board[3][5].gameElement = BALL;
	board[6][7].gameElement = BALL;

	return board;
}

// Render the board to an HTML table
function renderBoard(board) {
	var strHTML = '';

	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {

	var isEnterToTunnel = i === -1 || i === gBoard.length || j === -1 || j === gBoard[0].length ? true : false

	if (i === -1) i = gBoard.length - 1
	if (i === gBoard.length) i = 0

	if (j === -1) j = gBoard[0].length - 1
	if (j === gBoard[0].length) j = 0

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if (((iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0) ||
		isEnterToTunnel === true) && !gIsFreezeCell) {

		if (targetCell.gameElement === BALL) {
			gCountBalls++
			gCountDownBalls--
			displayBallCount()
			//soundCollectingBall()
		} else if (targetCell.gameElement === GLUE) {
			gIsFreezeCell = true
			setTimeout(() => {
				gIsFreezeCell = false
			}, 3000);
		}

		// Move the gamer
		// Update the Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Update the Dom:
		renderCell(gGamerPos, '');

		// Update the Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// Update the Dom:
		renderCell(gGamerPos, GAMER_IMG);

	} else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element {i:2 , j:5}
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location) // '.cell-2-5'
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
	var i = gGamerPos.i;
	var j = gGamerPos.j;

	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;
	}
}

// Returns the class name for a specific cell {i:0,j:0} = > 'cell-0-0'
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

//Eran
function getEmptyCellsBoard() {
	var emptyCellsBoard = []
	for (let i = 0; i < gBoard.length; i++) {
		for (let j = 0; j < gBoard[i].length; j++) {
			if (gBoard[i][j].type === 'FLOOR' && gBoard[i][j].gameElement === null) {
				emptyCellsBoard.push({ i: i, j: j })
			}
		}
	}
	return emptyCellsBoard
}

function addBallRandomly() {
	var addRandomBallLoop = setInterval(() => {
		var emptyCellsBoard = getEmptyCellsBoard()
		// Update the Model:
		var randomNumber = getRandomInt(0, emptyCellsBoard.length)
		var pickRandomlyCord = emptyCellsBoard[randomNumber]
		gBoard[pickRandomlyCord.i][pickRandomlyCord.j].gameElement = BALL;
		emptyCellsBoard.splice(randomNumber, 1)

		if (gCountDownBalls === 0) {
			console.log('Winner');
			document.querySelector('button').style.display = 'block'
			clearAllInterval()
			addWinLine()

		} else {
			// Update the Dom:
			renderCell({ i: pickRandomlyCord.i, j: pickRandomlyCord.j }, BALL_IMG);
		}
		if (emptyCellsBoard.length === 0) {
			clearInterval(addRandomBallLoop); //console.log('GameOver');
		}

		gCountDownBalls++

	}, 2500);
}

function addGlueRandomly() {
	var removeGlue = []

	var addRandomGlueLoop = setInterval(() => {
		var emptyCellsBoard = getEmptyCellsBoard()
		// Update the Model:
		var randomNumber = getRandomInt(0, emptyCellsBoard.length)
		var pickRandomlyCord = emptyCellsBoard[randomNumber]
		gBoard[pickRandomlyCord.i][pickRandomlyCord.j].gameElement = GLUE;
		emptyCellsBoard.splice(randomNumber, 1)
		// Update the Dom:
		renderCell({ i: pickRandomlyCord.i, j: pickRandomlyCord.j }, GLUE_IMG);

		removeGlue.push({ i: pickRandomlyCord.i, j: pickRandomlyCord.j })

		if (emptyCellsBoard.length === 82) {
			clearInterval(addRandomGlueLoop)
		}

		setTimeout(() => {
			removingGlue(removeGlue)
		}, 3000);
	}, 5000);
}

function removingGlue(remove) {
	// Update the Model:
	var currCorrd = gBoard[remove[0].i][remove[0].j].gameElement
	var checkWhatInCell = ''
	if (currCorrd === GAMER) {
		gBoard[remove[0].i][remove[0].j].gameElement = GAMER; checkWhatInCell = GAMER_IMG
	} else {
		gBoard[remove[0].i][remove[0].j].gameElement = '';
	}

	// Update the Dom:
	renderCell({ i: remove[0].i, j: remove[0].j }, checkWhatInCell);

	remove.splice(0, 1)
}

function displayBallCount() {
	var elHeader = document.querySelector('h1')
	elHeader.innerHTML = gelHeader + `<p>Collecting: ${gCountBalls}</p>`

}

function soundCollectingBall() {
	var audio = new Audio('sound/pop.wav');
	audio.play();
}

function clearAllInterval() {
	// Get a reference to the last interval + 1
	const interval_id = window.setInterval(function () { }, Number.MAX_SAFE_INTEGER);

	// Clear any timeout/interval up to that id
	for (let i = 1; i < interval_id; i++) {
		window.clearInterval(i);
	}
}

function addWinLine() {
	renderCell({ i: 5, j: 3 }, 'W')
	renderCell({ i: 5, j: 4 }, 'I')
	renderCell({ i: 5, j: 5 }, 'N')
	renderCell({ i: 5, j: 6 }, 'N')
	renderCell({ i: 5, j: 7 }, 'E')
	renderCell({ i: 5, j: 8 }, 'R')
}
