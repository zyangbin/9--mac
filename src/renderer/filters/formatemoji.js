import Vue from 'vue'
export function formatemoji(){
    Vue.filter('formatemoji',function(message){
        let msg =  RongIMLib.RongIMEmoji.emojiToHTML(message)
        return msg
        // console.log(msg+'-------')
    })
}