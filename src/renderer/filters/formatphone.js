import Vue from 'vue'
export function formatphone(){
    Vue.filter('formatphone',function(val){
        let arr = val.split('')
        for(let i=0; i<arr.length; i++){
            if(i>2 && i<7){
                arr[i] = '*'
            }
        }
        return arr.join('')
    })
}

