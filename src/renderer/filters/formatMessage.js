import Vue from 'vue'
export function formatMessage(){
    Vue.filter('formatMessage',function(val){
        if(val.length>10){
            return RongIMLib.RongIMEmoji.emojiToHTML(val.substr(0,10) + '...')
        }else{
            return RongIMLib.RongIMEmoji.emojiToHTML(val)
        }
    })
}