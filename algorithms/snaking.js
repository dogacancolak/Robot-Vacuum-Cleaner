

class Snaking {
    constructor() {
        this.turningRight = false;
        this.turningLeft  = false;
        this.degreesToTurn = 0;     // if currently turning, number of degrees left to turn in the given direction
        this.distanceToGo = 0; // if currently turning, number of pixels to travel before making another turn.
        this.direction = 1;     // if 1, turn left, if -1, turn right.
    }

    move() {
        if (robot.collide() && this.degreesToTurn == 0) {
            if (this.direction == 1) {
                this.turningLeft = true;
            }
            else {
                this.turningRight = true;
            }
            this.degreesToTurn = 180;
            this.distanceToGo = robot.radius * 2;
        }

        if (this.degreesToTurn == 90 && this.distanceToGo != 0) {
            robot.advance()
            this.distanceToGo--;
        } else if (this.degreesToTurn != 0) {
            if (this.turningLeft) {
                robot.steerLeft();
            } else if (this.turningRight) {
                robot.steerRight();
            }
            this.degreesToTurn--;

            if (this.degreesToTurn == 0) {
                this.turningLeft = false;
                this.turningRight = false;
                this.direction *= -1;
            }
        } else {
            robot.advance();
        }
    }
}