import axios from 'axios'
import Vue from 'vue'
// 获取好友列表
export function getFriendList(callback){
    axios.get(Vue.prototype.ajaxUrl+'/v1/friends',{
        params:{
            token:sessionStorage.usertoken
        }
    }).then(res=>{
        callback(res.data.data)
    })
}