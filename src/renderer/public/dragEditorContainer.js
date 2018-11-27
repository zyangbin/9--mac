import $ from 'jquery'

export class dragEditorContainer{
    constructor(params){
        this.dragLine = params.dragLine
        this.ev = params.ev
        this.targetEl = this.targetEl
    }
    // 上下拉伸
    drag(){
        console.log(this.dragLine)
    }
}