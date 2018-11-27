import $ from 'jquery'
export function loadingmore(el,callback){
    let offsetHeight = el.scrollHeight
    let clientHeight = $(el).height()
    let scrollTop = $(el).scrollTop()
    el.addEventListener('scroll',()=>{
        if(el.scrollTop==0){
            callback('top')
        }
        if($(el).scrollTop()==(el.scrollHeight-$(el).height())){
            callback('bottom')
        }
    })
}