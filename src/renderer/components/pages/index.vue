<template>
    <div id="index">
        <div class="close-all-msgbox">

        </div>
        <left-nav></left-nav>
        <friend-list></friend-list>
        <talk-area></talk-area>
        <!-- <history-msg></history-msg> -->
        <group-info v-if="currentGroup!=null"></group-info>
        <user-info :userInfo="userInfo" :scale="scale"></user-info>
        <div id="container">
            
        </div>
        <div class="index-close">
            <p class="title">
                <span :title='friendLocation'>
                    {{ friendLocation }}
                </span>
                <i class="iconfont icon-guanbi"  @click="closeMap"></i>
            </p>
            
        </div>
        <p class="network-status"
            v-if="networkStatus.status!='success'">
            {{networkStatus.status=='faile' ? '! 网络不可用，请检查你的网络设置' : '网络连接成功'}}</p>
        <div class="authentication">
            <p class="title">
                <span>实人认证提示</span>
                <span class="close iconfont icon-guanbi"
                    @click="closeAuth"></span>
            </p>
            <p class="content">
                您未在10天内完成实人认证，已经暂停聊天服务，完成实人认证恢复聊天功能
                <!-- 请前往9号米仓App完成实人认证再聊天 -->
            </p>
            <el-button type="primary" @click="closeAuth">确定</el-button>
        </div>
    </div>
    
</template>

<script>
    import Leftnav from '../Leftnav.vue'
    import Friendlist from '../Friendlist'
    import Talkarea from '../Talkarea'
    import HistoryMsg from '../HistoryMessage'
    import UserInfo from '../UserInfo'
    import GroupInfo from '../GroupInfo'
    import store from '../../store/store'
    import { mapState } from 'vuex'
    import { setTimeout } from 'timers'
    import user from '../../database/user'
    import { ipcRenderer } from 'electron'
    // import _ from 'lodash'
    // import { ListChoose } from '../baseComponents/ListChoose'
    export default {
        data(){
            return{
                obj:window.obj,
                networkStatus:window.networkStatus
            }
        },
        watch:{
            networkStatus:{
                handler(val,oldval){
                    // console.log(val.status)
                    if(val.status=='success'){
                            $('.network-status').hide()
                    }else{
                        $('.network-status').show()
                    }
                },
                deep:true
            }
        },
        components:{
            'left-nav':Leftnav,
            'friend-list':Friendlist,
            'talk-area':Talkarea,
            'history-msg':HistoryMsg,
            'user-info':UserInfo,
            'group-info':GroupInfo,
            // 'list-choose':ListChoose
        },
        computed:{
            ...mapState({
                userInfo(state){
                    if(state.userInfo){
                        return state.userInfo
                    }
                    let{ address, nickname, sex, mobile, number, signature } = state.userData.data
                    let obj = {
                        address,
                        nickname,
                        sex,
                        mobile,
                        headimgurl:state.userData.data.avatar,
                        remarkName:'',
                        number,
                        signature
                    }
                    return obj
                },
                userData(state){
                    return state.userData
                },
                scale(state){
                    return state.userinfostatus ? 'scale(1)' : 'scale(0)'
                },
                currentGroup(state){
                    return state.currentGroup
                },
                friendLocation(state){
                    return state.friendLocation
                }
            }),
        },
        methods:{
            closeMap(){
                $('#container').hide()
                $('.index-close').hide()
            },
            // 关闭提示面板
            closeAuth(){
                $('.authentication').css({
                    transform:'translateX(-50%) scale(0)'
                })
            }
        },
        mounted(){
            // 传入当前路由
            ipcRenderer.send('route-message','index')
            $('#friendlist')[0].addEventListener('mousemove', (ev)=>{
                ev.preventDefault()
            })
            document.addEventListener('click',()=>{
                this.$store.commit('changeUserInfoStatus','hide')
                $('#group-info').css({
                    transform:'scale(0)'
                })
                $('.show-group-info').css({
                    transform:'scale(0)'
                })
                $('.setting>ul').hide()
            })
            document.addEventListener('keydown',function(ev){
                if(ev.keyCode===123){
                    ipcRenderer.send('open-devtool')
                }
            })
            this.$store.commit('addNewFriend',null)
            $('.close-all-msgbox')[0].addEventListener('click',function(ev){
                $(this).hide()
                $('.magnify-modal').remove()
                $('.handle-request').hide()
                $('#container').hide()
                $('.index-close').hide()
            })
            // 禁用右键菜单的默认事件
            document.addEventListener('contextmenu',(ev)=>{
                ev.preventDefault()
            })
        },
        store,
    }
</script>

<style lang="scss">
    @import '../../style/common.scss';
    #index{
        width:100%;height:100%;
        // border:1px solid #ccc;
    }
    .close-all-msgbox{
        width:100%;height:100%;position:absolute;
        z-index:11000;background:#fff;opacity:0;
        display:none;
    }
    .icon-guanbi{
        font-size:14px !important;
    }
    #container{
        width:600px;height:400px;
        // border:1px solid #ccc;
        position:fixed;border-top:0 none;
        box-shadow:$div_shadow;
        // top:96px;left:100px;
        background:#fff;
        z-index:20000;display:none;
        top:96px;left:50%;transform:translateX(-50%);
    }
    
    div.index-close{
        position:absolute;top:60px;display:none;
        // box-shadow:2px 0px 2px 0px #ddd,-2px 0px 2px #ddd;
        // border:1px solid #ccc;
        border-bottom:0 none;
        width:600px;z-index:20000;left:50%;transform:translateX(-50%);
        p.title{
            @include title_style;border:0 none;
            span{
                display:inline-block;text-align:left;padding-left:15px;
                width:400px;@include text_ellipse;float:left;
            }
            i{
                @include close_button;line-height:30px;
            }
        }
        
        
    }
    div.el-input{
        span.el-input__prefix{
            top:1px;left:8px;
        }
    }
    span.el-checkbox__inner{
        border-radius:50%;width:18px;height:18px;
    }
    span.el-checkbox__inner:after{
        left:6px;top:2px;
    }
    span.el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
        background-color: #FF5A5A;
        border-color: #FF5A5A;
    }
    .search .el-input__inner{
        background-color:#f8f8f8;
    }
    .add .el-input__inner{
        background-color:#f8f8f8;
    }
    .gm-scrollbar .thumb{
        min-height:30px !important;
        max-height:50px !important;
    }
    p.network-status{
        position:fixed;z-index:10000;
        top:0px;font-weight:bold;padding:5px 10px;
        background:#E6503F;font-size:12px;
        color:#f5f5f5;border-radius:10px;
        text-align:center;top:20px;left:480px;
    }
    .authentication{
        height:220px;width:323px;box-shadow:0 0 3px 1px rgba(0,0,0,0.3);
        position:fixed;top:100px;z-index:10000;background:#fff;
        left:50%;transform:translateX(-50%) scale(0);
        border-radius:2px;
        p.title{
            height:36px;text-align:center;background:#EFF3F6;
            span:first-child{
                float:left;margin-left:20px;margin-top:8px;
                font-size:14px;color:#333;font-weight:600;
            }
            .close{
                @include close_button; line-height:30px;
            }
        }
        p.content{
            padding:0 20px;font-size:14px;line-height:25px;
            color:#777777;margin-top:30px;text-align:center;
        }
        .el-button{
            @include btn_success;position:absolute;bottom:20px;right:130px;
        }
    }
</style>
