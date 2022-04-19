class WallTracing {
    constructor() {
        this.distanceToGo = robot.radius * 1.5;
        this.degreesToTurn = 0;
    }

    move() {
        if (robot.collide()) {
            robot.steerRight();
            this.distanceToGo = robot.radius * 3;
            this.degreesToTurn = 0;
        }
        else {
            if (this.distanceToGo != 0 && this.degreesToTurn == 0) {
                robot.advance();
                this.distanceToGo--;
                if (this.distanceToGo == 0) {
                    this.degreesToTurn = 180;
                    this.distanceToGo = robot.radius * 2 - 10;
                }
            } 
            else if (this.degreesToTurn < 160) {
                if (this.degreesToTurn == 90) {
                    if (this.distanceToGo != 0) {
                        robot.advance()
                        this.distanceToGo--;
                    }
                    else {
                        robot.steerLeft();
                        this.degreesToTurn--;
                        this.distanceToGo = -1;
                    }
                }
                else if (this.degreesToTurn == 0) {
                    robot.advance();
                }
                else {
                    robot.steerLeft();
                    this.degreesToTurn--;
                }
            }
            else {
                robot.steerLeft();
                this.degreesToTurn--;
                robot.advance();
            }
        }
    }
}