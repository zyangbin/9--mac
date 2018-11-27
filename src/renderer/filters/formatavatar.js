import Vue from 'vue'
export function formatavatar(){
    Vue.filter('formatavatar',function(url,name){
        // console.log(name)
        if(url==null){
            return `<span>${name}</span>`
        }else{
            return `<img :src="url"/>`
        }
    })
}