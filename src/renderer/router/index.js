
import Vue from 'vue'
import Router from 'vue-router'
import Index from '../components/pages/index'
import Login from '../components/pages/Login'
import axios from 'axios'
import store from '../store/store'
import qiniu from 'qiniu'
import * as Qiniu from 'qiniu-js'
import { ipcRenderer } from 'electron'


Vue.use(Router)
export default new Router({
  // mode:"history",
  routes: [
    {
      path:'/',
      redirect:{
        component:Index,
        path:'/index'
      }
    },{
      path: '/index',
      name: 'index',
      component: Index,
      meta:{
        keepAlive:false
      },
      beforeEnter:(to,from,next)=>{
            let usertoken = sessionStorage.getItem('usertoken')
            if(usertoken){
                axios.get(Vue.prototype.ajaxUrl+'/user/query',{
                    params:{
                        token:usertoken
                    }
                }).then(res=>{
                        store.commit('getUserData',res.data)
                        // store.commit('addNewFriend',null)
                        // 生成七牛token
                        const AK = 'Jhzn_5JsLIduz7OFPXxOInemgkn8J4S5NohKs443'
                        const SK = 'pu3JS3JWcPrg-lN07iBKIc6S9Etv4QxRttE2rxSP'
                        const mac = new qiniu.auth.digest.Mac(AK, SK)
                        const options = {
                            scope: 'jhmc',
                            detectMime: 1
                        }
                        const putPolicy = new qiniu.rs.PutPolicy(options)
                        const uploadToken = putPolicy.uploadToken(mac)
                        sessionStorage.setItem('qn_token',uploadToken)
                        Vue.prototype.Qiniu = Qiniu
                        // 创建本地数据库
                        // Vue.prototype.messageDB = openDatabase('message_db','1.0.0','save local message',10*1024*1024*1024)
                        // console.log('login')
                        // console.log(Vue.prototype.messageDB)
                        // Vue.prototype.messageDB.transaction(function (tx) {
                        //     tx.executeSql('CREATE TABLE IF NOT EXISTS MESSAGETABLE (messageUId unique, senderUserId, avatar, nickname, remark_name, is_delete, targetId)')
                        //     tx.executeSql('CREATE TABLE IF NOT EXISTS CONVERSATION (userUuid, targetId, conversationType, isTop, noTips)')
                        //     tx.executeSql('CREATE TABLE IF NOT EXISTS LASTREADMESSAGE (senderUserId unique, messageUId, lastMessageSendTime)')
                        //     tx.executeSql('CREATE TABLE IF NOT EXISTS DELETEMSG (messageUId unique, senderUserId, avatar, nickname, remark_name, is_delete, targetId, handleUser)')
                        //     tx.executeSql('CREATE TABLE IF NOT EXISTS APPSETTING (userUuid unique, voiceNotice, autoStart, newMsgNotice)')
                        // })
                       
                        next()
                    })
                }else{
                    next({
                        name:'login'
                    })
                }
      }
    },{
        path:'/login',
        name:'login',
        component:Login,
        beforeEnter:(to,from,next)=>{
            ipcRenderer.send('route-message', 'login')
            // 创建本地数据库
            Vue.prototype.messageDB = openDatabase('message_db','1.0.0','save local message',10*1024*1024*1024)
            Vue.prototype.messageDB.transaction(function (tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS MESSAGETABLE (messageUId unique, senderUserId, avatar, nickname, remark_name, is_delete, targetId)')
                tx.executeSql('CREATE TABLE IF NOT EXISTS CONVERSATION (userUuid, targetId, conversationType, isTop, noTips)')
                tx.executeSql('CREATE TABLE IF NOT EXISTS LASTREADMESSAGE (senderUserId unique, messageUId, lastMessageSendTime)')
                tx.executeSql('CREATE TABLE IF NOT EXISTS DELETEMSG (messageUId unique, senderUserId, avatar, nickname, remark_name, is_delete, targetId, handleUser)')
                tx.executeSql('CREATE TABLE IF NOT EXISTS APPSETTING (userUuid unique, nickname, avatar, voiceNotice, autoStart, newMsgNotice)')
            })
            next()
        }
    },
    {
        path:'/backGround',
        name:'backGround',
        component: require('@/components/childWindows/LocationMap').default
    }
  ]
})



