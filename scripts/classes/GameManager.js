import { ObjectPool } from "./ObjectPool.js";
import { Runner } from "./Runner.js";

export class GameManager {
    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        GameManager.instance = this;

        // Inicializo aquí los atributos del GameManager

        //spawneo al jugador
        this.runner = new Runner();

        //pool de objetos disponibles en el juego
        this.objectPool = new ObjectPool();

        //this.audioManager = new AudioManager();
        //this.parallax = new Parallax(); activar cuando se inicia el juego o dejar animando cuando se esta en el menu?

        //propiedades del juego
        this.score = -100;
        this.time = 30; //medido en segundos
        this.lives = 4;
        this.creationInterval = 2500; //medido en milisegundos

        //intervals
        this.gameLoopInterval = null;
        this.idIntervalspawn = null;
        this.idIncreaseInterval = null;
        this.temporizadorInterval = null;

        //flags
        this.damageCooldown = false;

        //objetos en pantalla
        this.inGameObjs = [];

        //por defecto inicia la musica
        //this.audioManager.music.play();

        //muestra al character
        //this.runner.classList.remove('hidden');

        //pongo a escuchar los controles del juego
        this.inputListener(); 
    }

    //GETERS
    getTime() {
        return this.time;
    }

    getLives() {
        return this.lives;
    }

    getScore() {
        return this.score;
    }

    getWonFlag() {
        return this.wonFlag;
    }

    getLostFlag() {
        return this.lostFlag;
    }

    //METODOS PRINCIPALES DEL GAME MANAGER
    render() {
        //crea intervalo de creacion de enemigos
        this.idIntervalspawn = setInterval(this.spawnObjects, this.creationInterval); 

        console.log('valor interval ' + this.creationInterval)
        
        //muestra el tiempo restante en el juego 

        // mostar en el html el puntaje
        //MOSTRAR en html el el div con puntaje y tiempo vida etc
    }

    update() {
        //no me reconocia las funciones y daba error, encontre de solucion ponerle .bind(this)
        this.gameLoopInterval = setInterval(this.inGameLoop.bind(this), 30); 

        //activo intervalo para el temporizador, resta en 1 a cada segundo
        this.temporizadorInterval = setInterval(this.timerAndScore.bind(this), 1000);
        
        //Puntaje?

        //intervalo de spawn de objetos
        this.idIntervalIncrease = setInterval(this.increaseInterval, 15000); //cada 20 segundos, aumento el spawn de objects
    }

    inGameLoop() {
        this.checkCollision(); //chequeo colisiones
    }

    static destroyInstance() {  //metodo para destruir la instancia
        GameManager.instance = null;
    }

    //TECLAS DEL JUEGO LISTENER
    inputListener() {
        //listener tecla salto
        document.addEventListener('keyup', (event) => {
            console.log(event)
            switch (event.key) {
                case "ArrowUp":
                    //this.audioManager.jumpSound.play();
                    this.runner.saltar();
                    break;
                case "Space":
                    //this.audioManager.attackSound.play();
                    this.runner.attack();
                    break;   
            }
        });
    }

    //TEMPORIZADOR
    decreaseTime() {
       this.time --;   
    }

    increaseTime() {
        this.time += 10;
    }

    timerAndScore() {
        //restar 1 segundo al tiempo restante
        console.log(this.getTime());
        this.decreaseTime();

        //ademas, sumo 100 puntos cada 1 segundo
        this.increaseScore(100);
        console.log('score ' + this.score)
         
        //verificar si el tiempo restante ha llegado a cero
        if ((this.getTime()) <= 0) {
            
          // El tiempo ha terminado, realizar alguna acción (por ejemplo, fin del juego)
          console.log("Tiempo terminado");

          clearInterval(this.temporizadorInterval); // Detener el temporizador
        }
    }


    //OBJECTS SPAWN
    increaseInterval = () => { //incrementa el intervalo de creacion de objetos restandolo en 200 milisegundos siempre y cuando haya instancia del juego
        if ((GameManager.instance) && (this.creationInterval > 2000)) { 

            clearInterval(this.idIntervalspawn); //elimino intervalo con el valor anterior
            console.log('respawn id ' + this.idIntervalspawn)
            this.creationInterval -= 10;

            this.idIntervalspawn = setInterval(this.spawnObjects, this.creationInterval); //creo nuevo intervalo con nuevo valor y lo guardo en idIntervalspawn
            console.log('valor interval ' + this.creationInterval)
        } else {
            clearInterval(this.idIntervalIncrease); //detengo el intervalo si creation interval es menor a 2000, se usa como maximo
        }
    }

    spawnObjects = () => { //generacion de objetos en la partida, funcion flecha para que el contexto se mantenga dentro de spawnObjects()
        //recojo algun objeto del pool object
        console.log('ingameobjs ' + this.inGameObjs.length);
        if (this.inGameObjs.length != this.objectPool.getMaxSize()){ //mientras haya objetos del pool por spawnear
            let objetFromPool = this.objectPool.adquirirObjeto(); 
            objetFromPool.spawn(); //lo muestro en el juego
            this.inGameObjs.push(objetFromPool);    //se añade al array de objectos in game el object actual
        };
    }

    //COLLISIONS
    characterCollision(runnerStatus, gameObjectStatus) {
        //calculo los OFFSETS. Se le suma o resta segun corresponda cuanto se quiere ignorar para que las colisiones sean mas precisas
        const CHARACTER_LEFT = runnerStatus.left + 75;
        const CHARACTER_RIGHT = runnerStatus.right - 75;
        const CHARACTER_TOP = runnerStatus.top + 60;
        const CHARACTER_BOTTOM = runnerStatus.bottom - 60;


        if (!(CHARACTER_RIGHT < gameObjectStatus.left ||
            CHARACTER_LEFT > gameObjectStatus.right ||
            CHARACTER_BOTTOM < gameObjectStatus.top ||
            CHARACTER_TOP > gameObjectStatus.bottom)) {
            return true

        } else {
            return false;
        }
    }

    checkCollision() {
        //SI HAY objetos GENERADOS CHEQUEO COLISIONES, USAR UN FLAG
        if (this.inGameObjs.length > 0) {
            for (let i = 0; i < this.inGameObjs.length; i++) {
                const INGAME_OBJECT = this.inGameObjs[i];

                if (!INGAME_OBJECT.getIsActive()) {       //si el object no esta activo, quiere decir que se termino su animacion y no se ve mas en la pantalla, por lo que se le devuelve al pool
                    this.inGameObjs.splice(i, 1);
                    this.objectPool.mandarObjeto(INGAME_OBJECT);

                } else {
                    const RUNNER_STATUS = this.runner.status();
                    const INGAME_OBJECT_STATUS = INGAME_OBJECT.status(); //variable tipo gameObject, status posee getBoundingClientRect()

                    if ((this.characterCollision(RUNNER_STATUS, INGAME_OBJECT_STATUS) == true)) {    //si el objeto colisiono con el character
                        INGAME_OBJECT.effect(this.runner);    //ejecuta la accion sobre el character dependiendo del objeto

                        switch (INGAME_OBJECT.getType()) {
                            case "skeleton":
                                if (this.damageCooldown != true) {

                                    this.damageCooldown = true;
                                    console.log('cooldown iniciado ' + this.damageCooldown)
                                    //this.audioManager.hitSound.play();

                                    this.decreaseLives();
                                    this.decreaseScoreBy(this.generateRandomNumber(50, 75)); 

                                    setTimeout((e) => {
                                        this.damageCooldown = false;
                                        console.log('cooldown finalizado ' + this.damageCooldown)
                                    }, 2000);
                                    // }
                                }
                                break;
                            case "meat-soldier":
                                if (this.damageCooldown != true) {

                                    this.damageCooldown = true;
                                    console.log('cooldown iniciado ' + this.damageCooldown)
                                    //this.audioManager.hitSound.play();

                                    this.decreaseLives();
                                    this.decreaseScoreBy(this.generateRandomNumber(25, 50)); 


                                    console.log('danio recibido')

                                    setTimeout((e) => {
                                        this.damageCooldown = false;
                                        console.log('cooldown finalizado ' + this.damageCooldown)
                                    }, 2000);
                                    // }
                                }
                                break;

                            case "invencivility":
                                //this.audioManager.powerUpSound.play();
                                this.giveRunnerInvencivility();
                                break;
                            case "puntaje":
                                //this.audioManager.bonusSound.play();
                                this.increaseScore();
                                break;
                            case "vida":
                                //this.audioManager.healthSound.play();
                                this.increaseLives();
                                break;
                            case "clock":
                                //this.audioManager.bonusSound.play();
                                this.increaseTime();
                                break;
                        }
                    }
                }
            }
        } else console.log('aun no hay objetos')

    };

    //Otros métodos y propiedades del GameManager//

    generateRandomNumber(min, max){
        return Math.floor(Math.floor(Math.random() * (max - min + 1)) + min); //genera un numero random entre mim y max inclusive
    }

    giveRunnerInvencivility() {
        this.runner.activateInvencivility();
    }

    decreaseLives() {
        if (this.lives > 0) {
            this.lives --;
        }
    }

    increaseLives() {
        if (this.lives > 0) {
            this.lives += 1;
        }
    }

    decreaseScoreBy(number) {
        if (this.score >= number) {     //para no ir a score negativo
            this.score -= number;
        } else {
            this.score = 0;
        }
    }

    increaseScore(number) {
        /*if (this.score < this.maxScore) {
            this.score += 1;
        }*/
        this.score += number;
    }

    

    
}

