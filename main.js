import {Mouse, Keyboard} from './mouseHelper.js';
import {main} from './moduleWrap.js'
/** @type {HTMLCanvasElement} */
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let scale = 1.5;
canvas.width = window.innerWidth * scale;
canvas.height = window.innerHeight * scale;
let mouse = new Mouse(canvas);
let keyboard = new Keyboard();
let lerp = (a, b, t) => a + (b - a) * t;
let randomRange = (min, max) => Math.random() * (max - min) + min;
let deg2rad = deg => deg * Math.PI / 180;
let rad2deg = rad => rad * 180 / Math.PI;

let body = [];

let length = 10;
let radius = 10;

let headSize = 10;
let bodySize = 10;

let speed = 5;
let lerpSpeed = 1;

let rotateSpeed = .1;

let interpCount = 10;

let cherries = [];
let cherryCount = 3

let cherryRadius = 20;
let cherryPower = 10;
let cherryMargins = 50;

for (let i = 0; i < cherryCount; i++) {
    cherries.push({
        x: randomRange(cherryMargins, canvas.width - cherryMargins),
        y: randomRange(cherryMargins, canvas.height - cherryMargins)
    })
}

for (let i = 0; i < length; i++) {
    body.push({x: canvas.width/2, y: canvas.height/2, angle: 0});
}

let head = body[0];
head.x += radius * 5;

let snapInterval = deg2rad(45/2);
let snapAngle = angle=> {
    let nearest = Math.round(angle / snapInterval) * snapInterval;
    return nearest;
}

let move = () => {
    if (keyboard.keys.has('a') || keyboard.keys.has('ArrowLeft')) {
        head.angle -= rotateSpeed;
        // head.targetAngle -= rotateSpeed;
    }
    if (keyboard.keys.has('d') || keyboard.keys.has('ArrowRight')) {
        head.angle += rotateSpeed;
        // head.targetAngle += rotateSpeed;
    }
    head.angle = lerp(head.angle, snapAngle(head.angle), .05);
    // head.angle = snapAngle(head.targetAngle, .5);
    head.x += Math.cos(head.angle) * speed;
    head.y += Math.sin(head.angle) * speed;

    for (let i = 1; i < body.length; i++) {
        let segment = body[i];
        let prev = body[i - 1];
        let dx = prev.x - segment.x;
        let dy = prev.y - segment.y;
        segment.angle = Math.atan2(dy, dx);
        let distance = Math.hypot(dx, dy) - radius;
        let target = {
            x: prev.x - Math.cos(segment.angle) * radius,
            y: prev.y - Math.sin(segment.angle) * radius,
        }
        segment.x = lerp(segment.x, target.x, lerpSpeed);
        segment.y = lerp(segment.y, target.y, lerpSpeed);
    }

    for (let cherry of cherries) {
        if (Math.hypot(head.x - cherry.x, head.y - cherry.y) < radius + cherryRadius) {
            cherry.x = randomRange(cherryMargins, canvas.width - cherryMargins);
            cherry.y = randomRange(cherryMargins, canvas.height - cherryMargins);
            for (let i = 0; i < cherryPower; i++) {
                body.push({...body.at(-1)});
            }
        }
    }
}

let collide = () => {
    let safetyBuffer = 10;
    let nearest = body.slice(1 + safetyBuffer).reduce((nearest, part) => {
        let distance = Math.hypot(head.x - part.x, head.y - part.y);
        if (distance < nearest.distance) {
            nearest.distance = distance;
            nearest.part = part;
        }
        return nearest;
    }, {distance: Infinity, part: null});

    if (nearest.distance < radius) {
        console.log('collide');
        // reload page
        window.location.reload();
    }

    if (head.x < 0 || head.x > canvas.width || head.y < 0 || head.y > canvas.height) {
        console.log('collide');
        // reload page
        window.location.reload();
    }
}


let draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0;
    ctx.lineWidth = 1;
    body.forEach((part, index) => {
        ctx.beginPath();
        ctx.arc(part.x, part.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.stroke();
        ctx.beginPath();
        ctx.lineTo(part.x, part.y);
        ctx.lineTo(part.x + Math.cos(part.angle) * radius, part.y + Math.sin(part.angle) * radius);
        ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = bodySize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    let points = body.map(part => [part.x, part.y]);
    let x = points.map(point => point[0]);
    let y = points.map(point => point[1]);
    let [xOut, yOut] = main(x, y, interpCount);
    ctx.beginPath();
    for (let i = 0; i < xOut.length; i++) {
        ctx.lineTo(xOut[i], yOut[i]);
    }
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(head.x, head.y, headSize, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    cherries.forEach(cherry => {
        ctx.beginPath();
        ctx.arc(cherry.x, cherry.y, cherryRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#FF8170FF';
        ctx.fill();
    })

    ctx.beginPath();
    ctx.lineTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();

    ctx.fillStyle = 'black';
    let height = canvas.height / 20;
    ctx.font = `${height}px Arial`;
    ctx.fillText(`Score: ${(body.length - length)}`, height / 5, height);
    ctx.fillText(`Controls: A/←, D/→`, height / 5, height * 2 + height / 5);
}

let frame = () => {
    move();
    collide();
    draw();
    requestAnimationFrame(frame);
}

frame();

window.addEventListener('resize', function(event) {
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
}, true);