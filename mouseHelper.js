export class Mouse {
    constructor(element = document) {
        this.x = 0;
        this.y = 0;
        this.down = false;

        element.addEventListener('mousedown', (e) => {
            this.down = true;
        });

        element.addEventListener('mouseup', (e) => {
            this.down = false;
        });
        
        element.addEventListener('mousemove', (e) => {
            let rect = element.getBoundingClientRect();
            let scaleX = element.width / rect.width;
            let scaleY = element.height / rect.height;
            this.x = (e.clientX - rect.left) * scaleX;
            this.y = (e.clientY - rect.top) * scaleY;
        });
    }
}

export class Keyboard {
    constructor(element = document) {
        this.keys = new Set();

        element.addEventListener('keydown', (e) => {
            this.keys.add(e.key);
        });

        element.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
    }
}