var socket = io.connect("http://localhost:4000/");





class Block {
    constructor(type) {

        this.type = type;
    }

}

class Map {
    constructor(map) {

        this.blockSize = map.blockSize;
        this.mapBlocksW = map.mapBlocksW
        this.mapBlocksH = map.mapBlocksH


        this.blocksList = new Array( this.mapBlocksW)

        for (let i = 0; i <  this.mapBlocksW; ++i) {

            this.blocksList[i] = new Array(this.mapBlocksH)
            for (let j = 0; j < this.mapBlocksH; ++j) {


                this.blocksList[i][j] = new Block(0)

            }
        }
        console.log("this.blocksLists initialized")
        console.log(map.blocksList)
        for (let i = 0; i < this.mapBlocksW; ++i) {

            for (let j = 0; j < this.mapBlocksH; ++j) {


                this.blocksList[i][j] = new Block(map.blocksList[i][j].type)

            }
        }
        console.log("this.blocksLists updated from server")
        console.log(this.blocksList)
    }

    preRender(ctx)
    {
        var m_canvas = document.createElement('canvas');
        m_canvas.width = this.mapBlocksW*this.blockSize;
        m_canvas.height = this.mapBlocksH*this.blockSize;
        var m_context = m_canvas.getContext("2d");

        this.draw(m_context)
        return m_canvas
    }
    draw(ctx) {
        console.log("map.draw()")

        for (let i = 0; i < this.mapBlocksW; ++i) {

            for (let j = 0; j < this.mapBlocksH; ++j) {
                let x = i * this.blockSize;
                let y = j * this.blockSize;
                console.log("filling if type ")
                if (this.blocksList[i][j].type === 'g') {
                    ctx.fillStyle = "#30dd3e";
                }
                else if (this.blocksList[i][j].type === 'i') {
                    ctx.fillStyle = "#b2dadd";
                }
                else if (this.blocksList[i][j].type === 'w') {
                    ctx.fillStyle = "#2f32dd";
                }
                else
                {
                    ctx.fillStyle = "#4ebadd";
                }
                ctx.fillRect(x, y, this.blockSize, this.blockSize);

            }
        }


    }
}

class Bunny {

    constructor(x, y, clientId, mapW, mapH,blockSize, vX, vY, aX, aY, dx,isInAir) {
        this.x = x;
        this.y = y;
        this.clientId = clientId;

        this.mapW = mapW
        this.mapH = mapH
        this.blockSize=blockSize
        this.vX = vX;
        this.vY = vY
        this.aX = aX;
        this.aY = aY;
        this.dx = dx;
        this.isInAir = isInAir
    }

    update() {
        this.updateKey('R')
    }

    updateKey(pressedKey) {
        if (pressedKey === 'L') {
            this.x = this.x - this.dx
        } else if (pressedKey === 'R') {
            this.x = this.x + this.dx
        }

    }




    draw(ctx) {
        ctx.fillStyle = "#ddaa5f";
        if (this.isInAir) {
console.log("in air")
        ctx.fillStyle = "#dd0fb3";
    }
        //console.log("map.draw() " +  obj.x.toString()+ "  "+obj.y.toString())
        ctx.fillRect(this.x, this.y, this.blockSize, this.blockSize
        );
    }

}



class Game {
    constructor(map) {

        this.map = new Map(map);

        this.bunnysList = [];


        this.canvas = document.getElementById("myCanvas");
        this.canvas.width=this.map.mapBlocksW*this.map.blockSize
        this.canvas.height=this.map.mapBlocksH*this.map.blockSize
        this.ctx = this.canvas.getContext("2d");

       this.mapPreRender= this.map.preRender(this.ctx)


        this.pressedKeys={}
       this. setupKeyListeners()
        setInterval(()=>{this.update()},50)


        window. requestAnimationFrame(()=> {this.draw()})

    }
    setupKeyListeners()
    {
        document.addEventListener('keydown',  (event)=> {
            let ret = 'N';
            if (event.key == 'ArrowLeft') {
                ret = 'L';
            } else if (event.key == 'ArrowRight') {
                ret = 'R';
            } else if (event.key == 'ArrowUp') {
                ret = 'U';
            } else if (event.key == 'ArrowDown') {
                ret = 'D';
            }

            this.pressedKeys[ret]=true;





            console.log(   Object.keys( this.pressedKeys))




        });

        document.addEventListener('keyup',  (event) =>{
            let ret = 'N';
            if (event.key == 'ArrowLeft') {
                ret = 'L';
            } else if (event.key == 'ArrowRight') {
                ret = 'R';
            } else if (event.key == 'ArrowUp') {
                ret = 'U';
            } else if (event.key == 'ArrowDown') {
                ret = 'D';
            }
            console.log( "deleting    "+ ret )
            console.log(this.pressedKeys)
            if(ret in this.pressedKeys)
            delete this.pressedKeys[ret]

        });
    }
emitPressedKeys()
{
if(Object.keys(this.pressedKeys).length>0)
{
    console.log( Object.keys(this.pressedKeys))
    socket.emit("keyPressed", this.pressedKeys);
}
}
   update() {
       this.emitPressedKeys()

    }


    draw() {

        console.log("Game.draw()")

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.drawImage(this.mapPreRender,0,0)

        for (let i = 0; i < this.bunnysList.length; ++i) {

            this.bunnysList[i].draw(this.ctx)
        }






        window. requestAnimationFrame(()=> {this.draw()})
        ;

    }

    updateBunnysList(bunnysListJson) {
        this.bunnysList = []
        for (let i = 0; i < bunnysListJson.length; ++i) {


            this.bunnysList.push(new Bunny(bunnysListJson[i].x, bunnysListJson[i].y, bunnysListJson[i].clientId,
                bunnysListJson[i].mapW, bunnysListJson[i].mapH,this.map.blockSize, bunnysListJson[i].vX, bunnysListJson[i].vY, bunnysListJson[i].aX,
                bunnysListJson[i].aY, bunnysListJson[i].dx,bunnysListJson[i].isInAir))
        }
    }
}


let game


socket.on("map", function (m) {
    console.log(m)

    game = new Game(m)

});
socket.on("bunnysList", function (bunnysListJson) {
    console.log(typeof  bunnysListJson)
    console.log(  bunnysListJson)
    game.updateBunnysList( bunnysListJson)

});


