// The Algorithm:
// 1. Start
// 2. Go forward for a random amount of pixels (the variable is called moveBeforeSpiral)
// 3. Start spiraling.
// 3. If collision, switch to the Random algorithm, set moveBeforeSpiral to a new random number.
// 4. Once the robot is able to travel moveBeforeSpiral many pixels uninterrupted in the Random algorithm, start from step 3.

class Spiral {
    constructor() {
        this.steps = 150;
        this.turn = 2 * Math.PI / this.steps;
        this.onSpiral = false;
        this.moveBeforeSpiral = Math.floor(Math.random() * 200 + 60);
        this.randomComponent = new Random()
    }
    
    move() {
        if (robot.collide()) {
            this.onSpiral = false;
            this.moveBeforeSpiral = Math.floor(Math.random() * 200 + 60);
        }

        if (this.onSpiral) {
            robot.advance();

            robot.angle += this.turn;
            this.turn = this.turn / (1.01 - (0.01 - Math.abs(this.turn) / 22));
        }
        else {
            var prev_angle = robot.angle

            this.randomComponent.move()

            if (robot.angle == prev_angle) {  // if the random move didn't change the angle, it must have moved forward
                this.moveBeforeSpiral--;
            }

            if (this.moveBeforeSpiral == 0) {
                this.onSpiral = true;
                this.turn = 2 * Math.PI / this.steps;
            }
        }
    }
}