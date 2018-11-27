import Vue from 'vue'
import axios from 'axios'
const _this = Vue.prototype
let token = sessionStorage.usertoken
export class Group {
    constructor(){

    }
    // 创建群组
    static creatGroup(params, callback){
        const { name, friends } = params
        axios.post(_this.ajaxUrl + '/v1/group',{
            token:sessionStorage.usertoken,
            name,friends
        }).then(res=>{
            if(res.data.status==='1'){
                callback(res.data.data)
            }else{
                console.log('创建失败')
            }
        })
    }
    // 获取用户所属群组
    static getGroup(callback){
        axios.get(_this.ajaxUrl + '/v1/group/1',{
            params:{
                token:sessionStorage.usertoken
            }
        }).then(res=>{
            callback(res.data.data)
        })
    }
    // 删除群组
    static deleteGroup(params, callback){
        const { id } = params
        axios.delete(_this.ajaxUrl + '/v1/group/' + id + '?token=' + sessionStorage.usertoken).then(res=>{
            callback(res.data)
        })
    }
    // 查看群组资料
    static getGroupInfo(params, callback){
        const { id } = params
        axios.get(_this.ajaxUrl + '/v1/group/query/' + id + '?token=' + sessionStorage.usertoken).then(res=>{
            axios.get(_this.ajaxUrl + '/v1/group/notice',{
                params:{
                    token:sessionStorage.usertoken,
                    group_id:id
                }
            }).then(res2=>{
                callback({
                    baseInfo:res.data.data,
                    notice:res2.data.data
                })
            })
        })
    }
    // 设置群公告
    static setGroupNotice(params, callback){
        const { id, content } = params
        axios.post(_this.ajaxUrl + '/v1/group/notice',{
            token:sessionStorage.usertoken,
            content,
            group_id:id
        }).then(res=>{
            callback(res.data)
        })
    }
    // 设置群名称
    static setGroupName(params, callback){
        const { name, id } = params
        axios.put(_this.ajaxUrl + '/v1/group/' + id,{
            token:sessionStorage.usertoken,
            name
        }).then(res=>{
            callback(res.data)
        })
    }
    // 退出/移除群组
    static quitGroup(params, callback){
        const { id, friends } = params
        axios.put(_this.ajaxUrl + '/v1/group/quit',{
            token:sessionStorage.usertoken,
            id ,
            friends,
        }).then(res=>{
            callback(res.data)
        })
    }
    // 加入群组
    static joinGroup(params, callback){
        const { id, friends } = params
        axios.post(_this.ajaxUrl + '/v1/group/join',{
            id,token:sessionStorage.usertoken,friends
        }).then(res=>{
            callback(res.data)
        })
    }
}