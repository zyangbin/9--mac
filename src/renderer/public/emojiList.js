import $ from 'jquery'

export class Emoji{
    constructor(params){
        this.vueComponent = params._this
        this.initEmoji()
        this.initEmojiList()
    }
    // 初始化融云emoji表情
    initEmoji(){
        let config = {
            size: 24,
            url: "http://f2e.cn.ronghub.com/sdk/emoji-48.png", 
            lang: "zh", 
        }
        RongIMLib.RongIMEmoji.init(config)
        this.list = RongIMLib.RongIMEmoji.list
        this.positionArr = []
        for(let item of this.list){
            let positionX = $(item.node).css('backgroundPosition').split('px')[0]
            this.positionArr.push(positionX)
        }
    }

    // 初始化emoji表情列表
    initEmojiList(){
        this.vueComponent.$refs.emojilist.innerHTML = ''
        for(let i=0;i<this.list.length;i++){
            $(this.list[i].node).css({
                cursor:'pointer',
                transition:'all 0.3s',
                width:'30px',
                height:'30px',
                lineHeight:'30px',
                transform:'scale(0.8)',
                backgroundSize:'cover',
                backgroundPosition:(this.positionArr[i]/24)*30 + 'px 0px'
            })
            this.list[i].node.title = this.list[i].symbol
            this.vueComponent.$refs.emojilist.appendChild(this.list[i].node)
            this.list[i].node.onmouseover = function(){
                this.style.transform = 'scale(1)'
            }
            this.list[i].node.onmouseout = function(){
                this.style.transform = 'scale(0.8)'
            }
            this.list[i].node.onclick = (ev)=>{
                this.vueComponent.emojiListstatus = false
                $('textarea').focus()
                this.vueComponent.message += RongIMLib.RongIMEmoji.emojiToSymbol(this.list[i].emoji)
            }
        }
    }
}