class Piece {
    constructor(color, symbol) {
        this.color = color;
        this.symbol = symbol;
    }
}

// Create audio objects for chess sounds
const moveSound = new Audio();
moveSound.src = 'sounds/move.mp3';  // Chess piece movement sound
const captureSound = new Audio();
captureSound.src = 'sounds/capture.mp3'; 
  // Capture piece sound



class RandomWarShift {
    constructor() {
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.currentPlayer = 'white';
        this.movesTillShift = Math.floor(Math.random() * 3) + 3; // Random 3-5 moves
        this.isAIEnabled = false;
        this.playerColor = 'white';
        
        this.initializeBoard();
    }

    initializeBoard() {
        // Initialize pawns
        for(let i = 0; i < 8; i++) {
            this.board[1][i] = new Piece('black', '♟');
            this.board[6][i] = new Piece('white', '♙');
        }

        // Initialize other pieces
        const backRowPieces = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'];
        const whiteBackRowPieces = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'];

        for(let i = 0; i < 8; i++) {
            this.board[0][i] = new Piece('black', backRowPieces[i]);
            this.board[7][i] = new Piece('white', whiteBackRowPieces[i]);
        }
    }

  

    isPieceOnBoard(pieceSymbol) {
        for (let row of this.board) {
            for (let cell of row) {
                if (cell && cell.symbol === pieceSymbol) {
                    return true;
                }
            }
        }
        return false;
    }
        // Add these new methods first
        isKingInCheck(color) {
            // Find the king's position
            let kingPosition = null;
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = this.board[row][col];
                    if (piece && piece.color === color && 
                        (piece.symbol === '♔' || piece.symbol === '♚')) {
                        kingPosition = [row, col];
                        break;
                    }
                }
                if (kingPosition) break;
            }
        
            if (!kingPosition) {
                console.error(`${color} king not found!`);
                let winner='';
                if(color=='white'){
                    winner='balck';
                }
                else{
                    winner='white';
                }
                showWinnerPopup(`${winner} won the game!`);
                
                
                return false; // Safeguard against board setup errors
                
              
            }
           
        
            const [kingRow, kingCol] = kingPosition;
        
            // Check if any opponent piece can attack the king
            const opponentColor = color === 'white' ? 'black' : 'white';
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = this.board[row][col];
                    if (piece && piece.color === opponentColor) {
                        const moves = this.getRawMoves(row, col);
                        if (moves.some(([r, c]) => r === kingRow && c === kingCol)) {
                            return true;
                        }
                    }
                }
            }
        
            return false;
        }
        
    
        isCheckmate(color) {
             if(!this.isPieceOnBoard('♚') && color=='black'){
                console.log('balck missing');
                     return true;
             }
             if(!this.isPieceOnBoard('♔') && color=='white'){
                console.log('white missing');

                return true;
        }
                
            // If the king is not in check, it cannot be checkmate
            if (!this.isKingInCheck(color)) {
                return false;
            }
        
            // Check if there is any valid move that can get the player out of check
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = this.board[row][col];
                    if (piece && piece.color === color) {
                        const validMoves = this.getValidMoves(row, col);
                        if (validMoves.length > 0) {
                            return false; // The player can make a move to escape check
                        }
                    }
                }
            }
        
            // No valid moves left and the king is in check
            return true;
        }
        
    
        // This gets moves without checking if they put own king in check
        getRawMoves(row, col) {
            const piece = this.board[row][col];
            if (!piece) return [];
    
            let moves = [];
            const symbol = piece.symbol;
    
            // Pawn moves
            if (symbol === '♙' || symbol === '♟') {
                const direction = piece.color === 'white' ? -1 : 1;
                // Forward move
                if (this.isValidPosition(row + direction, col) && !this.board[row + direction][col]) {
                    moves.push([row + direction, col]);
                    // Initial two-square move
                    if ((piece.color === 'white' && row === 6) || (piece.color === 'black' && row === 1)) {
                        if (!this.board[row + 2 * direction][col]) {
                            moves.push([row + 2 * direction, col]);
                        }
                    }
                }
                // Diagonal captures
                [[-1, 1], [1, 1]].forEach(([dx, dy]) => {
                    const newRow = row + direction;
                    const newCol = col + dx;
                    if (this.isValidPosition(newRow, newCol) && 
                        this.board[newRow][newCol] && 
                        this.board[newRow][newCol].color !== piece.color) {
                        moves.push([newRow, newCol]);
                    }
                });
            }
    
            // Rook moves
            if (symbol === '♖' || symbol === '♜') {
                moves.push(...this.getStraightMoves(row, col));
            }
    
            // Bishop moves
            if (symbol === '♗' || symbol === '♝') {
                moves.push(...this.getDiagonalMoves(row, col));
            }
    
            // Queen moves
            if (symbol === '♕' || symbol === '♛') {
                moves.push(...this.getStraightMoves(row, col));
                moves.push(...this.getDiagonalMoves(row, col));
            }
    
            // Knight moves
            if (symbol === '♘' || symbol === '♞') {
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                knightMoves.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (this.isValidPosition(newRow, newCol) && 
                        (!this.board[newRow][newCol] || 
                         this.board[newRow][newCol].color !== piece.color)) {
                        moves.push([newRow, newCol]);
                    }
                });
            }
    
            // King moves
            if (symbol === '♔' || symbol === '♚') {
                const kingMoves = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1],           [0, 1],
                    [1, -1],  [1, 0],  [1, 1]
                ];
                kingMoves.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (this.isValidPosition(newRow, newCol) && 
                        (!this.board[newRow][newCol] || 
                         this.board[newRow][newCol].color !== piece.color)) {
                        moves.push([newRow, newCol]);
                    }
                });
            }
    
            return moves;
        }
    
        // Updated getValidMoves that checks if moves are legal (don't put/leave own king in check)
        getValidMoves(row, col) {
            const piece = this.board[row][col];
            if (!piece || piece.color !== this.currentPlayer) return [];
    
            const rawMoves = this.getRawMoves(row, col);
            const validMoves = [];
    
            // Test each move to see if it leaves/puts own king in check
            for(const [newRow, newCol] of rawMoves) {
                // Make move temporarily
                const originalTarget = this.board[newRow][newCol];
                this.board[newRow][newCol] = piece;
                this.board[row][col] = null;
    
                // Check if king is in check after move
                if(!this.isKingInCheck(piece.color)) {
                    validMoves.push([newRow, newCol]);
                }
    
                // Undo move
                this.board[row][col] = piece;
                this.board[newRow][newCol] = originalTarget;
            }
    
            return validMoves;
        }
    
        // Update makeMove to handle checkmate
        makeMove(fromRow, fromCol, toRow, toCol) {
            const validMoves = this.getValidMoves(fromRow, fromCol);
            const isValidMove = validMoves.some(([r, c]) => r === toRow && c === toCol);
        
            if (!isValidMove) {
                console.error("Invalid move attempted!");
                return {'move':false,'aimove':false}; // Invalid move, do nothing
            }
        
            // Perform the move
            const movedPiece = this.board[fromRow][fromCol];
            const capturedPiece = this.board[toRow][toCol];
            this.board[toRow][toCol] = movedPiece;
            this.board[fromRow][fromCol] = null;
        
            console.log(`Moved ${movedPiece.symbol} from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol}).`);
            if (capturedPiece) {
                console.log(`Captured ${capturedPiece.symbol} at (${toRow}, ${toCol}).`);
            }
        
            // Switch turns
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
            // Check if this move puts the opponent in checkmate
            const opponentColor = this.currentPlayer;
            if (this.isKingInCheck(opponentColor)) {
                console.log(`${opponentColor} is in check!`);
                if (this.isCheckmate(opponentColor)) {
                    setTimeout(() => {
                        showWinnerPopup(`Checkmate! ${movedPiece.color.charAt(0).toUpperCase() + 
                              movedPiece.color.slice(1)} wins!`);
                    }, 100);
                    return {'move':true,'aimove':false}; // Game ends
                }
            }
        
            // Handle random piece shuffling
            this.movesTillShift--;
            if (this.movesTillShift === 0) {
                this.randomizePieces();
                this.movesTillShift = Math.floor(Math.random() * 3) + 3; // Reset the counter
                console.log("Random shift occurred!");
            }
            let move=false;
        
            // Handle AI if enabled and it's AI's turn
            if (this.isAIEnabled && this.currentPlayer !== this.playerColor) {
                move=true;
            }
        
            return {'move':true,'aimove':move};
        }
        
    
    

    getStraightMoves(row, col) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        const piece = this.board[row][col];

        directions.forEach(([dr, dc]) => {
            let newRow = row + dr;
            let newCol = col + dc;
            while (this.isValidPosition(newRow, newCol)) {
                if (!this.board[newRow][newCol]) {
                    moves.push([newRow, newCol]);
                } else {
                    if (this.board[newRow][newCol].color !== piece.color) {
                        moves.push([newRow, newCol]);
                    }
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        });
        return moves;
    }

    getDiagonalMoves(row, col) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        const piece = this.board[row][col];

        directions.forEach(([dr, dc]) => {
            let newRow = row + dr;
            let newCol = col + dc;
            while (this.isValidPosition(newRow, newCol)) {
                if (!this.board[newRow][newCol]) {
                    moves.push([newRow, newCol]);
                } else {
                    if (this.board[newRow][newCol].color !== piece.color) {
                        moves.push([newRow, newCol]);
                    }
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        });
        return moves;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

  

    randomizePieces() {
        const pieces = ['♟', '♜', '♞', '♝', '♛', '♙', '♖', '♘', '♗', '♕'];
        
        for(let row = 0; row < 8; row++) {
            for(let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && !this.isKing(piece.symbol)) {
                    const newSymbol = piece.color === 'white' ? 
                        pieces[Math.floor(Math.random() * 5) + 5] :
                        pieces[Math.floor(Math.random() * 5)];
                    piece.symbol = newSymbol;
                }
            }
        }
    }

    isKing(symbol) {
        return symbol === '♔' || symbol === '♚';
    }

    async makeAIMove() {
        // Simple AI implementation
        let allMoves = [];
        for(let row = 0; row < 8; row++) {
            for(let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if(piece && piece.color === this.currentPlayer) {
                    const validMoves = this.getValidMoves(row, col);
                    validMoves.forEach(([toRow, toCol]) => {
                        allMoves.push({
                            from: [row, col],
                            to: [toRow, toCol],
                            score: this.evaluateMove(row, col, toRow, toCol)
                        });
                    });
                }
            }
        }

        if(allMoves.length === 0) return;

        // Sort moves by score and pick the best one
        allMoves.sort((a, b) => b.score - a.score);
        const bestMove = allMoves[0];

        // Trigger AI selection callback
        if(this.onAISelectPiece) {
            await this.onAISelectPiece(bestMove.from[0], bestMove.from[1]);
        }

        // Make the move
       await this.makeMove(bestMove.from[0], bestMove.from[1], 
                          bestMove.to[0], bestMove.to[1]);
        
        // Trigger AI move callback
      
    }

    evaluateMove(fromRow, fromCol, toRow, toCol) {
        let score = 0;
        const targetPiece = this.board[toRow][toCol];

        // Prefer captures
        if(targetPiece) {
            score += this.getPieceValue(targetPiece.symbol);
        }

        // Prefer center control
        const centerDistance = Math.abs(3.5 - toRow) + Math.abs(3.5 - toCol);
        score -= centerDistance;

        return score;
    }

    getPieceValue(symbol) {
        const values = {
            '♟': 1, '♙': 1,   // Pawns
            '♞': 3, '♘': 3,   // Knights
            '♝': 3, '♗': 3,   // Bishops
            '♜': 5, '♖': 5,   // Rooks
            '♛': 9, '♕': 9,   // Queens
            '♚': 100, '♔': 100 // Kings
        };
        return values[symbol] || 0;
    }
}

class GameUI {
    constructor() {
        this.game = new RandomWarShift();
        this.selectedCell = null;
        this.validMoves = [];
        this.container=document.getElementById('game-info');
        this.boardElement = document.getElementById('board');
        this.playerTurnElement = document.getElementById('player-turn');
        this.shiftCounterElement = document.getElementById('shift-counter');
        
        this.initializeUI();
        this.setupAICallbacks();
    }

    initializeUI() {
        // Create the board UI
        for(let row = 0; row < 8; row++) {
            for(let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', (e) => this.handleCellClick(row, col));
                this.boardElement.appendChild(cell);
            }
        }

        // Add AI toggle button
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'controls'; // Assign a CSS class for styling
        
        const aiButton = document.createElement('button');
        aiButton.textContent = 'Play vs AI';
        aiButton.addEventListener('click', () => this.toggleAI());
        
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Game';
        resetButton.addEventListener('click', () => this.resetGame());
        
        controlsDiv.appendChild(aiButton);
        controlsDiv.appendChild(resetButton);
        
        // Append controlsDiv to the container next to the board
        this.boardElement.parentElement.appendChild(controlsDiv);
        
        this.updateBoard();
        
    }

    setupAICallbacks() {
        this.game.onAISelectPiece = async (row, col) => {
            // Highlight selected piece
            const cell = this.getCellElement(row, col);
            cell.classList.add('ai-selected');
    
            // Show valid moves
            const validMoves = this.game.getValidMoves(row, col);
            validMoves.forEach(([toRow, toCol]) => {
                const targetCell = this.getCellElement(toRow, toCol);
                targetCell.classList.add('valid-move'); // Add CSS for dots
            });
    
            await this.delay(500); // Add delay for visual effect
    
            // Remove highlights
            cell.classList.remove('ai-selected');
            validMoves.forEach(([toRow, toCol]) => {
                const targetCell = this.getCellElement(toRow, toCol);
                targetCell.classList.remove('valid-move');
            });
        };
    }
    

    async handleCellClick(row, col) {
        if (this.game.isAIEnabled && this.game.currentPlayer !== this.game.playerColor) {
            return; // Prevent moves during AI turn
        }

        const piece = this.game.board[row][col];

        if (this.selectedCell) {
            const [selectedRow, selectedCol] = this.selectedCell;
            
            if (this.validMoves.some(([r, c]) => r === row && c === col)) {
                // Make the move
                const success = await this.game.makeMove(selectedRow, selectedCol, row, col);
                if (success['move']) {
                    await this.animateMove(selectedRow, selectedCol, row, col);
                    console.log("animated");
                    this.updateBoard();
                    console.log("updated");

                    this.updateGameInfo();
                    console.log("updated game info");


                }
                if(success['aimove']){
                    await this.game.makeAIMove();
                    console.log("animated ai");
                    this.updateBoard();
                    console.log("updated aai");

                    this.updateGameInfo();
                    console.log("updated game info  ai");
                }
            }
            
            this.clearSelection();
        } else if (piece && piece.color === this.game.currentPlayer) {
            this.selectedCell = [row, col];
            this.validMoves = this.game.getValidMoves(row, col);
            this.highlightValidMoves();
        }
    }

    async animateMove(fromRow, fromCol, toRow, toCol) {
        const fromCell = this.getCellElement(fromRow, fromCol);
        const toCell = this.getCellElement(toRow, toCol);
        
        fromCell.classList.add('moving');
        await this.delay(300);
        toCell.classList.add('highlight');
        await this.delay(300);
        
        fromCell.classList.remove('moving');
        toCell.classList.remove('highlight');
    }

    getCellElement(row, col) {
        return this.boardElement.children[row * 8 + col];
    }

    updateBoard() {
        const cells = this.boardElement.children;
        for(let row = 0; row < 8; row++) {
            for(let col = 0; col < 8; col++) {
                const cell = cells[row * 8 + col];
                const piece = this.game.board[row][col];
                const previousContent = cell.textContent;
                
                // Update the cell content
                cell.textContent = piece ? piece.symbol : '';
                cell.style.color = piece ? piece.color : '';
                
                // Play sound if there's a change in the board
                if (previousContent !== cell.textContent) {
                    if (previousContent && cell.textContent) {
                        // If there was a piece and now there's a different piece, it's a capture
                        captureSound.play();
                    } else if (cell.textContent) {
                        // If there's now a piece where there wasn't one before, it's a move
                        moveSound.play();
                    }
                }
            }
        }
    }
    

    highlightValidMoves() {
        this.clearHighlights();
        const [selectedRow, selectedCol] = this.selectedCell;
        this.getCellElement(selectedRow, selectedCol).classList.add('selected');
        
        this.validMoves.forEach(([row, col]) => {
            const cell = this.getCellElement(row, col);
            cell.classList.add('valid-move');
        });
    }

    clearSelection() {
        this.selectedCell = null;
        this.validMoves = [];
        this.clearHighlights();
    }

    clearHighlights() {
        const cells = this.boardElement.children;
        for(let cell of cells) {
            cell.classList.remove('selected', 'valid-move');
        }
    }

    updateGameInfo() {
        this.playerTurnElement.textContent = `Current Turn: ${
            this.game.currentPlayer.charAt(0).toUpperCase() + 
            this.game.currentPlayer.slice(1)}`;
        this.shiftCounterElement.textContent = 
            `Moves until shift: ${this.game.movesTillShift}`;
    }

    async toggleAI() {
        this.game.isAIEnabled = !this.game.isAIEnabled;
        if (this.game.isAIEnabled) {
            if(this.game.currentPlayer =='white'){
            this.game.playerColor = 'black';
            this.game.currentPlayer = 'white';
        }
            else{
                this.game.playerColor = 'white';
                this.game.currentPlayer = 'black';

            }
            await this.game.makeAIMove();
         
            this.updateBoard();
         

            this.updateGameInfo();
        
        }
    }

    resetGame() {
        this.game = new RandomWarShift();
        this.clearSelection();
        this.updateBoard();
        this.updateGameInfo();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Add this CSS to your styles.css
const additionalStyles = `
    .controls {
        margin-top: 20px;
        display: flex;
        gap: 10px;
    }

    button {
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
    }

    button:hover {
        background-color: #2980b9;
    }

    .selected {
        background-color: rgba(255, 255, 0, 0.3) !important;
    }

    .valid-move {
        position: relative;
    }

    .valid-move::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        background-color: rgba(0, 255, 0, 0.3);
        border-radius: 50%;
    }

    .ai-selected {
        background-color: rgba(0, 0, 255, 0.3) !important;
    }

    .ai-moved {
        background-color: rgba(0, 255, 0, 0.3) !important;
    }

    .moving {
        animation: piece-moving 0.3s ease-in-out;
    }

    .highlight {
        animation: highlight-cell 0.3s ease-in-out;
    }

    @keyframes piece-moving {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }

    @keyframes highlight-cell {
        0% { background-color: inherit; }
        50% { background-color: rgba(255, 255, 0, 0.3); }
        100% { background-color: inherit; }
    }
`;

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    // Add the additional styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);


    // Start the game
    const game = new GameUI();
 

    
    
    
});


function showWinnerPopup(winner) {
    document.getElementById('winnerMessage').textContent = `${winner}`;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('winnerPopup').style.display = 'block';
}

function closePopup() {
    document.getElementById('overlay').style.display = 'none';

    document.getElementById('winnerPopup').style.display = 'none';
    window.location.reload();

    // Add any reset game logic here if needed
}

