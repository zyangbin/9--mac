import Vue from 'vue'
export function formatMessageCount(){
    Vue.filter('formatMessageCount',function(val){
        if(val>99){
            return '...'
        }else{
            return val
        }
    })
}