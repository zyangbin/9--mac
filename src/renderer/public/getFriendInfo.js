import axios from 'axios'
import Vue from 'vue'
import store from '../store/store'
import { DOMController } from '../class/DOMController'
export function getFriendInfo(params){
    axios.get(Vue.prototype.ajaxUrl + '/v1/search_friends',{
        params:{
            token:sessionStorage.usertoken,
            to_user:params.uuid
        }
    }).then(res=>{
        if(res.data.status){
            $('.user-info').css({right:0})
            store.commit('showFriendMsg',res.data.data)
            store.commit('changeUserInfoStatus','show')
            let _params = {
                el:$('.user-info'),
                clientX:params.ev.clientX,
                clientY:params.ev.clientY
            }
            DOMController.userInfoPosition(_params)
        }
    })
}