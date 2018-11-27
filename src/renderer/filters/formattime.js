import Vue from 'vue'
export function formattime(){
    Vue.filter('formattime',function(val){
        let today = new Date().getDate()
        let date = new Date(val)
        let Y = date.getFullYear() + '-'
        let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-'
        let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
        let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
        let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
        let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
        if(Math.abs(today-date.getDate())==0){
            return h + m
        }else{
            return date.getFullYear().toString().substr(2,2) + '/' + ((date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '/') + ((date.getDate() < 10 ? '0' + date.getDate() : date.getDate()))
            // return (M+D+h+m)
        }
    })
}
