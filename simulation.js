var lawn = new Image();
var wall = new Image();
var wall_scale = 10;     // wall is 10 times smaller than actual image
var floor = new Image();
var robot_img = new Image();
var background_canvas;
var walls_canvas;
var furniture_canvas;
var trace_canvas;
var canvas;
var ctx;
var ctx_trace;
var ctx_back;
var ctx_walls;
var ctx_furn;
var robot;
var dock;
var house;
var furniture_options;
var obstacles; // 2d array booleans representing pixels; true if obstacle exists in given pixel (x, y)
var textures;

var offset;

// used to calc canvas position relative to window
function reOffset() {
    var BB=canvas.getBoundingClientRect();
    offset = new Point(BB.left, BB.top);
}

function setupSimulation() {
    // Create the canvas and context

    lawn.src = "graphics/lawn.jpg";
    wall.src = "graphics/wall.jpg";
    floor.src = "graphics/floor.jpg"
    robot_img.src = "graphics/robot.png"

    background_canvas = document.getElementById("background");
    trace_canvas = document.getElementById("trace");
    walls_canvas     = document.getElementById("walls");
    furniture_canvas = document.getElementById("furniture");
    canvas     = document.getElementById("canvas");

    ctx_back = background_canvas.getContext("2d");
    ctx_trace = trace_canvas.getContext("2d");
    ctx_walls = walls_canvas.getContext("2d");
    ctx_furn = furniture_canvas.getContext("2d");
    ctx      = canvas.getContext("2d");

    ctx_back.drawImage(lawn, 0, 0, lawn.width, lawn.height, 0, 0, canvas.width, canvas.height);

    window.onscroll=function(e){ reOffset(); }
    window.onresize=function(e){ reOffset(); }
    reOffset();
 
    obstacles = new Array(canvas.width);
    for (var i = 0; i < canvas.width; i++) {
        obstacles[i] = new Array(canvas.height);
    }

    furniture_options = new FurnitureOptionBar();
    house = new House();
    house.setup();
    dock = new Dock(200, 200, 0);
    robot = new Robot(220, 475);
}

var mySimulation = {

    start : function() {
        canvas.onmousedown = null;
        canvas.onmousemove = null;
        canvas.onmouseout  = null;
        canvas.onmouseup   = null;
        dock.install();
        document.getElementById('start').style.display = 'none';


        var algorithm = new Snaking();
        var fun = algorithm.move.bind(algorithm);

        setInterval(fun, 5);
    },
    clear : function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
}
