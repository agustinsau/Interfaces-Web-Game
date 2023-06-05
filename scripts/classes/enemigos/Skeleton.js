import { GameObject } from "../GameObject.js";

export class Skeleton extends GameObject {

    constructor() {
        super('skeleton', 'enemigo');
    }

    status() {
        return this.gameElementDiv.getBoundingClientRect(); 
    }
    
    effect(runner) {
        if (!runner.getInvisiviltyStatus()) {     //si no tiene invensivilidad, el runner recibe danio
            runner.damaged();     //el skeleton explota y lo borra del dom
            //this.gameElementDiv.classList.add('explosion');
                
            this.isActive = false;
           
            this.gameElementDiv.remove();
            
        } 
    }

    spawn(){
        super.spawn()
    }
}