class UndoRedoManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.currentState = null;
    }

    // Perform an action and update the state
    performAction(newState) {
        if (this.currentState !== null) {
            this.undoStack.push(this.currentState); // Save current state to undo stack
        }
        this.currentState = newState; // Update current state
        this.redoStack = []; // Clear redo stack
    }

    // Undo the last action
    undo() {
        if (this.undoStack.length > 0) {
            this.redoStack.push(this.currentState); // Save current state to redo stack
            this.currentState = this.undoStack.pop(); // Restore the last state
        }
    }

    // Redo the last undone action
    redo() {
        if (this.redoStack.length > 0) {
            this.undoStack.push(this.currentState); // Save current state to undo stack
            this.currentState = this.redoStack.pop(); // Restore the last redone state
        }
    }

    // Get the current state
    getCurrentState() {
        return this.currentState;
    }
}

export default UndoRedoManager;