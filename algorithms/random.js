// The Algorithm:
// 1. Start
// 2. Check for collision.
// 3. Go forward.
// 4. If collision on left bumper, turn right for some time, then go back to step 2.
// 5. If collision on right bumper, turn left for some time, then go back to step 2.
// 6. If could not move 20 pixels uninterrupted by obstacles, means robot is stuck in corner, 
//    steer right until escape.

class Random {
    constructor() {
        this.turningRight = false;
        this.turningLeft  = false;
        this.degreesToTurn = 0;     // if currently turning, number of degrees left to turn in the given direction
        this.distanceNonstop = 0;    // If robot cannot advance 10 pixels uninterrupted, means it's trapped in a corner
        this.cornered = false;
    }

    setRandomTurn() {
        this.degreesToTurn = 90 + Math.floor(Math.random() * 70);
    }

    // call on collision, with boolean parameter 'left' indicating whether the collision was on the left of the bumper
    onCollision(left) {
        if (this.distanceNonstop < 20) {    // if the robot could not travel 20 pixels without an obstacle
            this.cornered = true;           // means the robot is probably cornered and needs an escape maneuver
        }
        else {  // if the robot has travelled freely, generate random direction
            this.turningLeft = !left;  // if collision on left, turn right, and vice versa
            this.turningRight = left;  // in any case, the boolean of the right side is opposite to that of the left
            this.setRandomTurn();
        }
        this.distanceNonstop = 0;       // reset the corner threshold counter
    }

    move() {
        if (!this.turningRight && !this.turningLeft) {  // only check collision if not in the middle of turning
            if (robot.leftCollide()) {
                this.onCollision(true); // the collision is on the left
            }
            else if (robot.rightCollide()) {
                this.onCollision(false);
            }
        }

        if (this.turningRight) {
            robot.steerRight();
            this.degreesToTurn--;
        }
        else if (this.turningLeft) {
            robot.steerLeft();
            this.degreesToTurn--;
        }
        else if (this.cornered) {
            robot.steerRight();      // if cornered, steer right (repeat until escape)
            this.cornered = false;   // assume not cornered until next collision within 20 pixel radius
        }
        else {
            robot.advance();
            this.distanceNonstop++;
        }

        // if the random turn has been completed, reset the turning flags
        if (this.degreesToTurn == 0) {
            this.turningRight = false;
            this.turningLeft  = false;
        }
    }
}