class ClientBunny {


    //client constructor
    constructor(clientId, bunnyW, bunnyH, color,RESPAWN_INVINCIBILITY_MILLISECONDS) {


        this.clientId = clientId;
        this.bunnyW = bunnyW;
        this.bunnyH = bunnyH;
        this.color = color;
        //'l' - left , 'r'- right
        this.imageFacingSide = 'l';
        this.isInAir = true;
        this.img = new Image();
        this.isImageLoaded = false;
        this.img.onload = () => {
            this.isImageLoaded = true;
        }
        if (color === "#FF5733") {
            this.img.src = 'assets/bunnyPixelRed.png';
        } else if (color === "#FF33E6") {
            this.img.src = 'assets/bunnyPixelPink.png';
        } else if (color === "#E8F616") {
            this.img.src = 'assets/bunnyPixelYellow.png';
        } else if (color === "#07070a") {
            this.img.src = 'assets/bunnyPixelBlack.png';
        }

        this.RESPAWN_INVINCIBILITY_MILLISECONDS=RESPAWN_INVINCIBILITY_MILLISECONDS;
        this.isJustSpawned=false;

    }
    onBunnyInvincible()
    {
        this.isJustSpawned=true;
        setTimeout(()=>{  this.isJustSpawned=false; console.log("this.isJustSpawned=false;s")}, this.RESPAWN_INVINCIBILITY_MILLISECONDS)
    }
    onNewDataFromServer(positionsHistory, isInAir) {
        let previousX = this.getX();

        this.positionsHistory = positionsHistory;
        if (previousX < this.getX())//going right
        {
            this.imageFacingSide = 'r'
        } else if (previousX > this.getX())//going left
        {
            this.imageFacingSide = 'l'
        }
        if (this.isInAir === false && isInAir === true) {
            this.onJumpListener()
        }
        this.isInAir = isInAir
    }

    onJumpListener() {
        var audio = new Audio('assets/jump.mp3');
        audio.play();
    }


    getX() {
        if (this.positionsHistory) {
            return this.positionsHistory[0].x;
        } else {
            return -100;
        }

    }

    getY() {
        if (this.positionsHistory) {
            return this.positionsHistory[0].y;
        } else {
            return -100;
        }
    }


    draw(ctx) {

        if (this.isImageLoaded === true) {
            ctx.save();
            let scaleX = 1,
                scaleOffset = 0;

            if (this.imageFacingSide === 'r') {

                scaleX = -1;
                scaleOffset = -this.bunnyW;
            }
            ctx.scale(scaleX, 1);
            if(this.isJustSpawned)
            {
                ctx.globalAlpha = 0.5;
            }
            else
            {
                ctx.globalAlpha = 1;
                console.log("ctx.globalAlpha = 1;")
            }
            ctx.drawImage(this.img, this.getX() * scaleX + scaleOffset, this.getY() - this.bunnyH * 0.5,
                this.bunnyW * 1.5, this.bunnyH * 1.5);
            ctx.restore();
        }


    }

}

