export class Runner {

    constructor() {
        this.state = "corriendo"; //si esta corriendo, saltando, cayendo o recibiendo danio

        this.invencivilityStatus = false; //variable para no recibir danio continuo y power up invencible

        //captura del personaje
        this.runner = document.getElementById("personaje");
    }

    //runner puede tener un hidden cuando se esta en el menu, a la hora de instanciar el juego quitarselo asi se puede ver, de fondo del menu se ve el paralax normalmente

    status() {
        return this.runner.getBoundingClientRect(); //retorna la posicion actual del elemento en coordenadas y otros datos
    }

    getState(){
        return this.state;
    }

    getInvisiviltyStatus(){
        return this.invencivilityStatus;
    }

    activateInvencivility(){
        this.invencivilityStatus = true;   
        
        setTimeout(() => {
            this.invencivilityStatus = false; 
            this.runner.classList.remove("invencivility");
        }, 8000); //le quito la invisivilidad luego de este tiempo
    }

    damaged(){
        if (!this.getInvisiviltyStatus()){ //si invisivility es falso
            if (this.state == "corriendo") { 

                this.state = "atacado";  
                this.runner.classList.replace("correr", "atacado"); //le aniado un efecto de parpadeo ya que no recibira danio por los proximos segundos
                console.log(this.state)
                const vuelveACorrer = (e) => {
                    this.state = "corriendo"
                    this.runner.classList.replace("atacado", "correr");     //regresa a correr
                    this.runner.removeEventListener("animationend", vuelveACorrer);    //se le remueve el evento porque ya termino la animacion
                    console.log(this.state)
                }
        
                this.runner.addEventListener("animationend", vuelveACorrer);   //cuando termina la animacion de danio vuelve a correr
            }

        }    
    }

    

    correr() {
        this.state == "corriendo";
        this.clean();
        this.runner.classList.add("correr"); 
    }

    saltar() {
        if(this.runner.classList.contains("correr")) { 
            
            this.state == "saltando";

            this.clean(); 

            this.runner.classList.add("saltar");

            this.runner.addEventListener("animationend", () => {
                this.caer();
            });
        }
    }
    caer() {
        this.state == "cayendo";
        this.clean();
        this.runner.classList.add("caer");

        this.runner.addEventListener("animationend", () => {
            this.correr();
        }); 
    }

    clean() {
        this.runner.classList.remove("correr"); 
        this.runner.classList.remove("saltar");
        this.runner.classList.remove("caer");  

        this.runner.removeEventListener("animationend", () => {}); 
    } 

    atacar(){
        this.state == "atacando";
        this.runner.classList.add("atacar");

        this.runner.addEventListener("animationend", () => {
            this.runner.classList.remove("atacar");

            this.runner.removeEventListener("animationend", () => {}); 
        }); 
    }
}