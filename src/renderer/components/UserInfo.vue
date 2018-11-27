<template>
    <div class="user-info" :style="{transform:scale}" v-stop>
        <div class="info">
            <div class="left">
                <!-- <input type="text" v-model="userInfo.nickname" v-if="userData.data.uuid==userInfo.uuid"> -->
                <!-- <i class="iconfont icon-bianji" title="修改备注名" v-if="userData.data.uuid==userInfo.uuid"></i> -->
                <span class="nickname">{{userInfo.nickname}}</span>
                <span class="sex iconfont icon-nan" v-if="userInfo.sex=='男'"></span>
                <span class="sex iconfont icon-icon-nv" v-if="userInfo.sex=='女'"></span>
                <br>
                <p class="mc-number">
                    <span>账号：</span>
                    <span>{{userInfo.number}}</span>
                </p>
            </div>
            <div class="right">
                <img :src="userInfo.headimgurl" alt="" v-move 
                    v-if="userInfo.headimgurl!=null" data-magnify="gallery"
                    :data-src="userInfo.headimgurl"
                    @click="zoomImg($event, userInfo.headimgurl)">
                <span v-if="userInfo.headimgurl==null" class="nickname"
                    :style="{background:portraitColor(userInfo.uuid)}">
                    {{userInfo.remarkName ? userInfo.remarkName[0] : userInfo.nickname[0].toUpperCase()}}
                </span>
            </div>
        </div>
        <!-- <p class="address">
            <span v-if="userInfo.address!=''">
                地区
            </span>
            <span v-if="userInfo.address!=''">
                {{address}}
            </span>
        </p> -->
        <p class="nickname" v-if="isFriend">
            <span>
                备注名
            </span>
            <span v-if="userInfo.uuid==userData.data.uuid">{{userInfo.nickname | formatMessage}}</span>
            <input class="friend-remarkname" v-model="userInfo.remarkName" @blur="remarkName($event)" v-if="(userInfo.remarkName!='' && userInfo.remarkName!=undefined) && userInfo.uuid!=userData.data.uuid">
            <input class="friend-remarkname" placeholder="添加备注" @blur="remarkName($event)" v-if="(userInfo.remarkName=='' || userInfo.remarkName==undefined) && userInfo.uuid!=userData.data.uuid">
            <i class="iconfont icon-bianji" title="修改备注名" @click="remarkName($event)" v-if="userInfo.uuid!=userData.data.uuid"></i>
        </p>
        <p class="phone">
            <span>
                手机号
            </span>
            <span>
                {{userInfo.mobile | formatphone}}
            </span>
        </p>
        <p class="address" v-if="userInfo.address!=''">
            <span v-if="userInfo.address!=''">
                地区
            </span>
            <span v-if="userInfo.address!=''" :title="userInfo.address">
                {{address}}
            </span>
        </p>
        <p class="signature" v-if="userInfo.signature!='' && userInfo.uuid!=userData.data.uuid">
            <span v-if="userInfo.signature!=''">
                个性签名
            </span>
            <span v-if="userInfo.signature!=''" :title="userInfo.signature">
                {{userInfo.signature}}
            </span>
        </p>
        <p class="user-signature signature" v-if="userInfo.uuid==userData.data.uuid">
            <span>
                个性签名
            </span>
            <input type="text" placeholder="修改个人签名" v-if="userInfo.signature==''" class="no-signature" @blur="setSignature($event)">
            <input type="text" v-model="userInfo.signature" v-if="userInfo.signature!=''" 
                class="has-signature" @blur="setSignature($event)" :title="userInfo.signature">
            <i class="iconfont icon-bianji" title="修改个人签名"></i>
        </p>
        <div class="remarks">
            <span @click="addRemark($event)" title="添加备注">
                <i class="iconfont icon-bianji"></i>
                备注
            </span>
            <textarea style="display:none;padding:4px;" 
                @blur="addRemark($event)" v-model="userInfo.remarkMore"></textarea>
        </div>
        <!-- <span class="close iconfont icon-guanbi" @click="toggleUserInfo('hide')"></span> -->
        <span class="message iconfont icon-xiaoxi" v-if="isFriend==true && userData.data.uuid!=userInfo.uuid" @click="sendMsg"></span>
        <span class="add iconfont icon-tianjiahaoyou1" style="font-size:18px;" v-if="isFriend==false && userData.data.uuid!=userInfo.uuid" @click="addNewfriend"></span>
        <span class="clear-msg" style="color:#7595F1;"
            v-if="isFriend==true && userData.data.uuid!=userInfo.uuid" @click="clearMsg('0')">
            清除聊天记录
        </span>
        <div class="modal modal-clear-message-userinfo">
            <p class="title">
                <span>提示</span>
                <span class="iconfont icon-guanbi" v-close:modal-clear-message-userinfo></span>
            </p>
            <p class="notice">确定清空此会话聊天记录</p>
            <el-button class="reject" v-close:modal-clear-message-userinfo>取消</el-button>
            <el-button class="resolve"  @click="clearMsg('1')">确定</el-button>
        </div>
    </div>
</template>

<script>
import store from '../store/store'
import { mapState } from 'vuex'
import { DOMController } from '../class/DOMController'
import { userInfo } from 'os';
import { Conversation } from '../class/Conversation'
import { Message } from '../class/Message'
import { entryOfSendMsg } from '../public/entryOfSendMsg'
export default {
    data(){
        return{
        }
    },
    computed:{
        ...mapState({
            friendlist(state){
                return state.friendlist
            },
            currentFriendName:'currentFriendName',
            conversationList(state){
                return state.conversationList
            },
            userData(state){
                return state.userData
            }
        }),
        address(){
            let arr = this.userInfo.address.split('-')
            return arr[0] + '-' + arr[1]
        },
        isFriend(){
            let res = false
            // if(userInfo.uuid==userData.data.uuid){
            //     return false
            // }
            for(let item of this.friendlist){
                if(this.userInfo.uuid==item.uuid){
                    res = true
                    break
                }
            }
            return res
        }
    },
    props:['userInfo','scale'],
    watch:{
        userInfo(val, oldval){
            this.$store.commit('getConversationList',{
                list:{
                    id:val.uuid,
                    icon:val.headimgurl
                },
                handle:'updateicon'
            })
            this.$store.commit('updateFriendPortrait',{
                list:{
                    id:val.uuid,
                    icon:val.headimgurl
                }
            })
        }
    },
    methods:{
        // 修改个性签名
        setSignature(ev){
            this.axios.put(this.ajaxUrl + '/user/1',{
                token:sessionStorage.usertoken,
                signature:ev.target.value
            }).then(res=>{
                
            })
        },
        // 清除聊天记录
        clearMsg(status){
            // console.log(this.userInfo)
            if(status==='0'){
                $('.modal-clear-message-userinfo').show()
                return
            }
            if(status==='1'){
                let sentTime = 0
                for(let item of this.conversationList){
                    if(item.targetId==this.userInfo.uuid){
                        sentTime = item.sentTime
                    }
                }
                let params = {
                    targetId:this.userInfo.uuid,
                    conversationType:'PRIVATE',
                    sentTime
                }
               
                Message.clearHistoryMsg({
                    list:[params]
                }, res=>{
                    if(res.status){
                        this.$store.commit('getSendedMessage',{
                            list:[],
                            str:'changeFriend'
                        })
                        this.$store.commit('getConversationList',{
                            list:[params],
                            handle:'clear-latestmsg'
                        })
                        if(this.userInfo.uuid===this.currentFriendName.targetId){
                            this.$store.commit('getCurrentUnreadCount',{
                                count:0,
                                handle:'change'
                            })
                            this.$store.commit('getAppLatestMsg',null)
                        }
                        this.toggleUserInfo('hide')
                        $('.modal-clear-message-userinfo').hide()
                        params = null
                    }
                })
            }
        },
        // 计算头像背景颜色
        portraitColor(uuid){
            return DOMController.portraitColor(uuid)
        },
        // 切换好友信息
        toggleUserInfo(str){
            this.$store.commit('changeUserInfoStatus',str)
        },
        // 放大头像图片
        zoomImg(ev, avatar){
            return
            // this.imgContainerArr = []
            // this.imgContainerArr = $('.container img.msgImg')
            // this.currentContainerImg = $(ev.target)


            $('.img-preview img').remove()
            let imgTag = `<img src="${avatar}" 
                style="width:${ev.target.naturalWidth}px;
                height:${ev.target.naturalHeight}px;"/>`
            $('.img-preview .imgpreview-container').append(imgTag)
            $('.img-preview').css({
                transform:'scale(1) translateX(-50%)'
            })
        },
        // 修改好友备注名
        remarkName(ev){
            if(ev.target.tagName=='I'){
                // console.log(this.userInfo)
                $(ev.target).next().focus()
            }else{
                // 修改好友备注名
                if(this.userInfo.uuid){
                    // console.log(this.userInfo)
                    this.axios.put(this.ajaxUrl + '/v1/friends/1',{
                        token:sessionStorage.usertoken,
                        to_user:this.userInfo.uuid,
                        remark_name:ev.target.value
                    }).then(res=>{
                        if(res.data.status=='1'){
                            // console.log(res)
                            // 更新好友列表
                            for(let item of this.friendlist){
                                if(item.uuid==this.userInfo.uuid){
                                    item.remark_name = $('.friend-remarkname').val()
                                }
                            }
                            this.$store.commit('getFriendList',this.friendlist)
                            // 更新会话列表
                            for(let item of this.conversationList){
                                if(item.targetId==this.userInfo.uuid){
                                    item.remarkName = $('.friend-remarkname').val()
                                }
                            }
                            this.$store.commit('getConversationList',this.conversationList)
                        }
                    })
                   
                }else{
                // 修改自己的昵称
                    this.axios.put(this.ajaxUrl + '/user/1',{
                        token:sessionStorage.usertoken,
                        nickname:this.userInfo.nickname
                    }).then(res=>{
                        if(res.data.status=='1'){
                            this.axios.get(this.ajaxUrl +　'/user/query',{
                            params:{
                                token:sessionStorage.usertoken,
                                uuid:this.userData.uuid
                            }
                        }).then(res=>{
                            $('.user-info').css({right:0})
                                this.$store.commit('showFriendMsg',res.data.data)
                                this.$store.commit('changeUserInfoStatus','show')
                                this.$store.commit('getUserData',res.data)
                            })
                        }
                    })
                }
            }
        },
        // 添加备注
        addRemark(ev){
            // console.log(ev.target)
            if(ev.target.tagName=='TEXTAREA'){
                let area = $('.remarks').children('textarea')
                area.css({
                    display:'none'
                })
                this.axios.put(this.ajaxUrl + '/v1/friends/1',{
                    token:sessionStorage.usertoken,
                    to_user:this.userInfo.uuid,
                    remark_more:$('.remarks').children('textarea').val()
                }).then(res=>{
                    // console.log(res.data)
                })
            }else{
                let area = $('.remarks').children('textarea')
                area.css({
                    display:'block'
                }).focus()
            }
        },
        // 发送消息
        sendMsg(){
            entryOfSendMsg({
                _this:this,
                userInfo:this.userInfo,
                type:'friend',
                intoConversation:true
            })
        },
        // 加好友
        addNewfriend(){
            $('.add-friend-remark').css({
                transform:'scale(1)'
            })
            this.toggleUserInfo('hide')
            $('#group-info').css({
                transform:"scale(0)"
            })
            this.$store.commit('addFrienduuid',this.userInfo)
            this.toggleUserInfo('changeUserInfoStatus','hide')
        }
    },
    store,
    mounted(){
        
    }
}
</script>

<style lang="scss" scoped>
    @import '../style/common';
    .user-info{
        width:220px;height:270px;background:#fff;position:absolute;
        top:50px;left:70px;z-index:6000;display:flex;padding:0 20px;
        border:5px;
        // box-shadow:0 0 3px 1px rgba(0,0,0,0.3);
        box-shadow: 3px 3px 3px 1px rgba(155, 145, 145,0.1),
            -3px -3px 3px 1px rgba(155, 145, 145,0.1),
            3px -3px 3px 1px rgba(155, 145, 145,0.1);
        // box-shadow:2px 2px 2px #ccc,-2px 2px 2px #ccc,2px -2px 2px #ccc,-2px -2px 2px #ccc;
        flex-direction:column;font-size:13px;
        .modal{
            position:fixed;background:#fff;width:295px;height:207px;
            box-shadow:$div_shadow;top:50%;transform:translate(-50%,-50%);
            left:50%;
            display:none;
            z-index:12000;
            p.title{
                @include title_style;
                span:nth-child(1){
                    float:left;margin-left:15px;font-weight:600;
                }
                span:nth-child(2){
                    float:right;margin-right:10px;cursor:pointer;
                }
            }
            p.notice{
                text-align:center;margin-top:40px;font-size:14px;
            }
            .el-button{
                position:absolute;bottom:20px;
            }
            >.resolve{
                right:70px;@include btn_success;
            }
            >.reject{
                left:70px;@include btn_default;
            }
        }
        .info{
            border-bottom:$border_style;display:flex;
            padding-top:20px;margin-bottom:15px;
            padding-bottom:5px;
            .left{
                width:80%;
                .mobile{
                    color:#bbb;
                }
                span.nickname{
                    float:left;max-width:80px;display:inline-block;
                    @include text_ellipse;padding-right:5px;font-size:16px;
                    font-weight:500;
                }
                input{
                    float:left;width:100px;border:0 none;
                    padding:2px 4px;cursor:pointer;vertical-align:middle;
                    @include text_ellipse;
                    margin-right:24px;font-weight:500;
                    &:hover+i{
                        display:block;
                    }
                }
                i.icon-bianji{
                    display:none;
                    vertical-align:middle;
                    font-size:12px;margin-top:2px;
                    color:$min_font_color;cursor:pointer;
                    position:absolute;left:130px;top:23px;

                }
                // i{
                //     color:$min_font_color;margin-right:5px;cursor:pointer;
                //     display:none;
                // }
                .sex{
                    float:left;
                }
                .icon-icon-nv{
                    color:#FF4D94;margin-top:3px;font-size:15px;
                }
                .icon-nan{
                    color:#3FA8FF;font-size:15px;margin-top:4px;
                }
                .mc-number{
                    margin-top:10px;color:$min-font-color;margin-bottom:15px;
                }
            }
            .right{
                flex:1;
                img{
                    width:50px;height:50px;float:right;margin-right:0px;
                    border-radius:50%;cursor:pointer;
                }
                .nickname{
                    @include nickname_avatar;margin-right:0px;
                    float:right;margin-top:-5px;
                }
            }
        }
        >p{
            padding:5px 0;font-size:14px;
            font-weight:500;
            input{
                font-size:14px;
            }
            span:nth-child(1){
                color:$min_font_color;
                display:inline-block;width:60px;
            }
        }
        p.signature,p.address{
             @include text_ellipse;width:auto;
             max-width:210px;cursor: pointer;
        }
        p.user-signature{
            position:relative;
            input{
                outline:none;border: 0 none;cursor:pointer;
                width:120px;@include text_ellipse;font-size:14px;
                &:hover+i{
                    display:block;
                }
            }
            .no-sigture{
                color:#333;
            }
            i.icon-bianji{
                display:none;
                vertical-align:middle;
                font-size:12px;margin-top:2px;
                color:$min_font_color;cursor:pointer;
                position:absolute;left:190px;top:5px;
            }
        }
        p.nickname{
            span{
                float:left;
            }
            span:nth-child(2){
                margin-left:4px;
            }
            input{
                float:left;max-width:120px;border:0 none;
                padding:2px 4px;cursor:pointer;vertical-align:middle;
                @include text_ellipse;width:auto;
                margin-right:4px;font-weight:500;
            }
            input:hover+i{
                display:block;
            }
            i{
                display:none;vertical-align:middle;
                font-size:12px;margin-top:2px;
                color:$min_font_color;
            }
        }
        .remarks{
            display:none;
            span{
                float:left;margin-right:10px;color:$min_font_color;
                margin-top:20px;cursor:pointer;
            }
            textarea{
                width:200px;outline:none;resize:none;
                border-radius:4px;border-color:#ccc;
                height:50px;
            }
        }
        .close{
            @include close_button;font-size:16px;
        }
        .add,.message{
            position:absolute;right:18px;color:#333;
            bottom:14px;cursor:pointer;font-size:20px;
        }
        .add{
            font-size:22px;
        }
        .clear-msg{
            color:$color-success;cursor:pointer;
            position:absolute;bottom:20px;left:20px;
        }
    }
    .user-or-friend{
        right:0px;
    }
</style>
