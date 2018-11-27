import $ from 'jquery'

export class MenuSetGray {
    constructor(params){
        this.menu = ['copy','paste','withdraw','delete','share','save']
        this.message = params.message ? params.message : ''
        this.str = params.str ? params.str : ''
        this.elements = []
        this.getMenuDom()
    }
    // 菜单元素
    getMenuDom(){
        for(let item of this.menu){
            this.elements.push($('.handle-msg-menu .' + item))
        }
    }
    // 操作菜单元素
    setMenuDom(obj){
        for(let item of this.menu){
            if(obj[item]){
                $('.handle-msg-menu .' + item).css({
                    color:'#333'
                }) 
            }else{
                $('.handle-msg-menu .' + item).css({
                    color:'#ddd'
                }) 
            }
        }
    }
    // 菜单置灰过滤
    setGray(){
        if(this.str==='textarea'){
            let res = {
                copy:true,
                paste:true,
                withdraw:false,
                delete:false,
                share:false,
                save:false
            }
            this.setMenuDom(res)
            return res
        }
        if(this.message){
            let res = {
                paste:false,
                share:false,
                delete:true,
                withdraw:false
            }
            if(this.message.objectName==='RC:TxtMsg'){
                res.copy = true
                res.save = false
            }
            if(this.message.objectName==='RC:ImgMsg' || this.message.objectName==='RC:FileMsg'){
                res.copy = false
                res.save = true
            }
            if(this.message.messageDirection==1 && new Date().getTime() <= (this.message.sentTime + 120000)){
                res.withdraw = true
            }
            this.setMenuDom(res)
            return res
        }
    }
}