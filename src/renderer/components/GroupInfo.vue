<template>
    <div id="group-info" ref="groupInfo" v-if="currentGroup!=null" v-stop>
        <div class="up" v-if="currentGroup!=null">
            <img :src="currentGroup.baseInfo.group_info.icon" alt="" v-move 
                v-if="currentGroup.baseInfo.group_info.icon!=''" data-magnify="gallery"
                    :data-src="currentGroup.baseInfo.group_info.icon">
                <!-- @click="zoomImg($event,currentGroup.baseInfo.group_info.icon)"> -->
            <span v-if="currentGroup.baseInfo.group_info.icon==''" :style="{background: portraitColor(currentGroup.baseInfo.group_info.id)}"
                class="name-img">
                {{currentGroup.baseInfo.group_info.name[0]}}
            </span>
            <p class="p-group-name">
                <i class="iconfont icon-bianji" title="修改群名称" @click="setGroupName($event)"
                    v-if="currentGroup.baseInfo.group_info.owner==userData.data.uuid"></i>
                <input type="text" v-model="currentGroup.baseInfo.group_info.name"
                class="group-name" @blur="setGroupName($event)" :title="currentGroup.baseInfo.group_info.name"
                    v-if="currentGroup.baseInfo.group_info.owner==userData.data.uuid"/>
                <span v-if="userData.data.uuid!=currentGroup.baseInfo.group_info.owner" :title="currentGroup.baseInfo.group_info.name"
                    style="color:#333;fontWeight:500;fontSize:16px;">{{currentGroup.baseInfo.group_info.name}}</span>
                    <br>
                <span style="color:#8b8b8b;fontWeight:500;width:150px;overflow:hidden;fontSize:12px;
                    position:absolute;top:40px;left:70px;">
                    群号：{{currentGroup.baseInfo.group_info.id}}
                </span>
            </p>

            <p class="group-notice">
                <span>群公告</span><br>
                <i class="iconfont icon-bianji" title="修改群公告" @click="setGroupNotice($event)"
                    v-if="userData.data.uuid==currentGroup.baseInfo.group_info.owner"></i>
                <input type="text" v-model="currentGroup.notice.content"
                    style="color:#8b8b8b;"
                    class="notice" @blur="setGroupNotice($event)" v-if="currentGroup.notice!=null && userData.data.uuid==currentGroup.baseInfo.group_info.owner">
                <input type="text" placeholder="暂无群公告" style="font-size:12px;"
                    class="notice" @blur="setGroupNotice($event)" v-if="currentGroup.notice==null && userData.data.uuid==currentGroup.baseInfo.group_info.owner">
                <span class="group-notice-title" v-if="currentGroup.notice!=null && currentGroup.notice.content.length>20">
                    {{currentGroup.notice.content}}
                </span>
                <span class="triangle iconfont icon-triangle-right" v-if="currentGroup.notice!=null && currentGroup.notice.content.length>20"></span>
                <span v-if="userData.data.uuid!=currentGroup.baseInfo.group_info.owner"
                    style="color:#8b8b8b;fontSize:12px;fontWeight:500;width:250px;overflow:hidden;display:inline-block;
                    text-overflow:ellipsis;white-space:nowrap;font-size:12px;">
                    {{currentGroup.notice==null ? '暂无群公告' : currentGroup.notice.content}}
                </span>
            </p>
            <!-- <hr> -->
            <!-- <span class="close iconfont icon-guanbi" @click="closePanel('#group-info','hide')"></span> -->
        </div>
        <div class="down" v-if="currentGroup!=null">
            <!-- <form> -->
                <!-- <span class="search iconfont icon-sousuo"></span> -->
                <!-- <el-input type="text" placeholder="搜索" class="search"
                    clearable size="mini" prefix-icon="iconfont icon-shousuo">
                </el-input> -->
            <!-- </form> -->
            <!-- <GeminiScrollbar autoshow> -->
            
            <ul>
                <li class="total">
                     <span>群成员{{currentGroup.baseInfo.members.length}}人</span>
                </li>
                <li class="add">
                    <span @click="addMember('add')"
                        class="iconfont icon-jia" title="添加群成员"></span>
                    <span>添加</span>
                    <!-- <span @click="deleteMulti('reduce')"
                        class="iconfont icon-jianhao" title="删除群成员"
                        v-if="userData.data.uuid == currentGroup.baseInfo.group_info.owner">
                    </span>
                    <span v-if="userData.data.uuid == currentGroup.baseInfo.group_info.owner">删除</span> -->

                    <!-- <span>查看全部</span> -->
                    
                </li>
                <li class="add" v-if="userData.data.uuid == currentGroup.baseInfo.group_info.owner">
                    <span @click="deleteMulti('reduce')"
                        class="iconfont icon-jianhao" title="删除群成员"
                        v-if="userData.data.uuid == currentGroup.baseInfo.group_info.owner">
                    </span>
                    <span>删除</span>
                </li>
                <!-- 管理员放在第一个 -->
                <li v-for="item of currentGroup.baseInfo.members" 
                    :key="item.uuid" class="member"
                    v-if="item.uuid == currentGroup.baseInfo.group_info.owner">
                    <img :src="item.avatar" alt=""  v-move
                        v-if="item.avatar!=null"
                        @click="showMemberInfo($event, item)">
                    <span v-if="item.avatar==null" :style="{background: portraitColor(item.uuid)}"
                        class="name-img" @click="showMemberInfo($event, item)">
                        {{item.nickname[0].toUpperCase()}}
                        <!-- {{item.info.remark_name[0] || item.info.nickname[0].toUpperCase()}} -->

                    </span>
                    <!-- <el-button class="private-chat"
                        v-if="userData.data.uuid!=item.uuid"
                        @click="intoPrivateCon($event, item)">
                        {{addGroupMemberToFriend(item)}}</el-button>
                    <el-button @click="deleteMember(item)" class="delete"
                        v-if="userData.data.uuid==currentGroup.baseInfo.group_info.owner && userData.data.uuid!=item.uuid">删除</el-button>
                    <span class="nickname">{{item.nickname}}</span>-->
                    <span v-if="item.uuid == currentGroup.baseInfo.group_info.owner"
                        class="group-owner nickname">
                        {{item.remark_name ? item.remark_name : item.nickname[0].toUpperCase()}}
                    </span>
                </li>
                <!-- 展示非群主成员 -->
                <li v-for="(item,idx) of otherMembers" 
                    :key="idx" class="member" :data-id="idx"
                    v-if="idx<showLength">
                    <img :src="item.avatar" alt="" 
                        v-if="item.avatar!=null" v-move
                        @click="showMemberInfo($event, item)">
                    <span v-if="item.avatar==null" class="name-img"
                        @click="showMemberInfo($event, item)"
                        :style="{background: portraitColor(item.uuid)}">
                        <!-- {{item.nickname[0].toUpperCase()}} -->
                        {{item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}}

                    </span>
                    <!-- <el-button class="private-chat"
                        v-if="userData.data.uuid!=item.uuid"
                        @click="intoPrivateCon($event, item)">
                        {{addGroupMemberToFriend(item)}}
                    </el-button>
                    <el-button @click="deleteMember(item)" class="delete"
                        v-if="userData.data.uuid==currentGroup.baseInfo.group_info.owner && userData.data.uuid!=item.uuid">删除</el-button> -->
                    <span class="nickname">{{item.nickname}}</span>
                    <!-- <span v-if="item.uuid == currentGroup.baseInfo.group_info.owner"
                        class="group-owner">管理员</span> -->
                </li>
            </ul>
            <el-button size="mini" class="see-all"
                @click="seeAll" 
                v-if="otherMembers.length>showLength">
                查看全部
            </el-button>
            <p class="msg-notice">
                <span>消息免打扰</span>
                <el-switch
                    v-model="groupsetting.messageNotice"
                    active-color="#498EF2"
                    inactive-color="#BFBFBF"
                    @change="setTopNotice($event)">
                </el-switch>
            </p>
            <p class="msg-top">
                <span>会话置顶</span>
                <el-switch
                    v-model="groupsetting.conversationTop"
                    active-color="#498EF2"
                    inactive-color="#BFBFBF"
                    @change="setTopNotice($event)">
                </el-switch>
            </p>
            <p class="msg-clear" style="color:#7595F1;"
                @click="clearMsg('0')">
                清除聊天记录
            </p>
            <!-- </GeminiScrollbar> -->
            <p @click="quitGroup($event)">{{ userData.data.uuid == currentGroup.baseInfo.group_info.owner ? '解散群组' : '退出群组'}}</p>
        </div>
        <!-- 添加/删除群成员 -->
        <div class="handle-group-member">
            <p class="title">
                <span class="notice">添加群成员</span>
                <span class="iconfont icon-guanbi" @click="cancelChoose"></span>
            </p>
            <div class="friend-list-add" v-if="currentGroup!=null">
                <el-input type="text" class="search" placeholder="搜索联系人" 
                    size="mini" clearable="" @keyup.native="searchLocalFriend"
                    v-model="searchFriendName"
                    prefix-icon="iconfont icon-shousuo"></el-input>
                <!-- <GeminiScrollbar autoshow> -->
                <ul class="friend">
                    <li v-for = "(item,idx) in currentList" 
                        :key="idx"
                        :class="{letterFirst:idx==0 || (idx>0 && currentList[idx].firstLetter!=currentList[idx-1].firstLetter)}">
                        <p v-if=" idx==0 || (idx>0 && currentList[idx].firstLetter!=currentList[idx-1].firstLetter)"
                            class="letter-sort">
                            {{item.firstLetter}}
                        </p>
                        <img :src="item.avatar" alt=""  v-move v-if="item.avatar!=null" @click="showMemberInfo($event, item)">
                        <span v-if="item.avatar==null" class="nickname-avatar" 
                            :style="{background: portraitColor(item.uuid),float:'left'}" @click="showMemberInfo($event, item)">
                            {{item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}}

                        </span>
                        <el-checkbox name="type" v-model="chooseArr[idx]" @change="isChoose($event,item,'add')"></el-checkbox>
                        <span class="nickname">{{item.remark_name || item.nickname}}</span>
                    </li>
                </ul>
                <!-- <span style="position:absolute;font-size:14px;bottom:45px;right:60px;">全选</span>
                <el-checkbox class="select-all" v-model="selectAllRes"
                    v-show="lastfriendlist.length!=0" v-if="searchFriendName==''"
                    @change="selectAll($event,'add')"></el-checkbox>
                <el-button size="small" class="cancel" @click="addMember('cancel')">取消</el-button>
                <el-button size="small" class="confirm" @click="addMember('confirm')">确定</el-button> -->
            </div>
            <div class="choosed-group-friend">
                <p>
                    {{ addChooseArrLen>0 ? '已选择'+ addChooseArrLen +'个联系人 ' : '请选择需要添加的联系人'}}
                </p>
                <ul>
                    <li v-for="(item,idx) in currentList" :key="item.uuid" v-if="chooseArr[idx]==true">
                        <img :src="item.avatar" alt=""  v-move v-if="item.avatar!=null" @click="showMemberInfo($event, item)">
                        <span v-if="item.avatar==null" class="nickname-avatar" 
                            :style="{background: portraitColor(item.uuid),float:'left'}" @click="showMemberInfo($event, item)">
                            {{item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}}
                        </span>
                        <span class="nickname">{{item.remark_name || item.nickname}}</span>
                        <span class="close iconfont icon-guanbi" @click="notChoose(idx)">
                        </span>
                    </li>
                </ul>
                <div class="btns">
                    <el-button class="confirm" :disabled="addChooseArrLen==0" @click="addMember('confirm')">确定</el-button>
                    <el-button class="cancel" @click="cancelChoose">取消</el-button>
                </div>
                <div class="last">

                </div>
            </div>
        </div>

        <!-- 删除群成员 -->
        <!-- div.handle -->
        <div class="member-list-reduce" v-if="currentGroup!=null">
            <ul>
                <li v-for="(item,idx) in currentGroup.baseInfo.members" 
                    :key="item.uuid" v-if="item.uuid!=userData.data.uuid">
                    <img :src="item.avatar" alt="" v-if="item.avatar!=null"  v-move
                        @click="showMemberInfo($event, item)">
                    <span v-if="item.avatar==null" class="nickname-avatar" 
                        :style="{background: portraitColor(item.uuid),float:'left'}"
                         @click="showMemberInfo($event, item)">
                        <!-- {{item.nickname[0].toUpperCase()}} -->
                        {{item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}}

                        <!-- {{item.remark_name[0] || item.nickname[0].toUpperCase()}} -->

                    </span>
                    <el-checkbox name="type" v-model="isChooseArr[idx]" 
                        @change="isChoose($event,item,'reduce')"
                        v-if="seeAllMembers!=true" v-show="userData.data.uuid!=item.uuid"></el-checkbox>
                    <span class="nickname">{{item.remark_name || item.nickname}}</span>
                    <el-button class="private-chat"
                        v-if="userData.data.uuid!=item.uuid && seeAllMembers!=false"
                        @click="intoPrivateCon($event, item)">
                        {{addGroupMemberToFriend(item)}}
                    </el-button>
                    <el-button @click="deleteMember(item)" class="delete"
                        v-if="userData.data.uuid==currentGroup.baseInfo.group_info.owner && userData.data.uuid!=item.uuid && seeAllMembers!=false">
                        删除
                    </el-button>
                </li>
            </ul>
            <el-checkbox class="select-all" v-model="selectAllRes"
                @change="selectAll($event,'reduce')"  
                v-show="currentGroup.baseInfo.members.length>=2"
                v-if="seeAllMembers!=true">全选</el-checkbox>
             <el-button size="mini" class="cancel" 
                @click="deleteMulti('cancel')">取消</el-button>
            <el-button size="mini" class="confirm" 
                @click="deleteMulti('confirm')">确定</el-button>
        </div>
        <!-- 查看群成员 -->
        <!-- 解散群 -->
        <div class="modal modal-delete-group-groupinfo" v-if="currentGroup!=null">
            <p class="title">
                <span>提示</span>
                <span class="close iconfont icon-guanbi" v-close:modal-delete-group-groupinfo></span>
            </p>
            <p class="notice">确定解散此群组？</p>
            <el-button class="reject" v-close:modal-delete-group-groupinfo>取消</el-button>
            <el-button class="resolve"  @click="dismissGroup">确定</el-button>
        </div>
         <div class="modal modal-quit-group-groupinfo" v-if="currentGroup!=null">
            <p class="title">
                <span>提示</span>
                <span class="close iconfont icon-guanbi" v-close:modal-quit-group-groupinfo></span>
            </p>
            <p class="notice">确定退出此群组？</p>
            <el-button class="reject" v-close:modal-quit-group-groupinfo>取消</el-button>
            <el-button class="resolve"  @click="confirmQuitGroup">确定</el-button>
        </div>
        <div class="modal modal-clear-message-groupinfo">
            <p class="title">
                <span>提示</span>
                <span class="iconfont icon-guanbi" v-close:modal-clear-message-groupinfo></span>
            </p>
            <p class="notice">确定清空此会话聊天记录</p>
            <el-button class="reject" v-close:modal-clear-message-groupinfo>取消</el-button>
            <el-button class="resolve"  @click="clearMsg('1')">确定</el-button>
        </div>
        <!-- 添加群成员为好友 -->
        <!-- <div class="add-friend-remark2">
            <p class="title">
                <span>好友验证</span>
                <span class="close iconfont icon-guanbi" 
                    v-close:add-friend-remark2>
                </span>
            </p>
            <input placeholder="请输入添加理由" v-model="remarkMessage"
                @click.stop="stopUp"/>
            <el-button @click="sendAddMessage">
                发送
            </el-button>
        </div> -->
        <!-- <list-choose :listMembers="sortMail"></list-choose> -->
    </div>
</template>
<script>
    import Vue from 'vue'
    import store from '../store/store'
    import _ from 'lodash'
    import { mapState } from 'vuex'
    import { Group } from '../class/Group'
    import { exists } from 'fs'
    import { Message } from '../class/Message'
    import { DOMController } from '../class/DOMController'
    import { Conversation } from '../class/Conversation'
    import { getHistoryMessages } from '../rongcloud/getHistoryMessage'
    import conversation_db from '../database/conversation'
    // import ListChoose from './baseComponents/ListChoose'
    export default {
        data(){
            return{
                isChooseArr:[],
                selectAllRes:false,
                seeAllMembers:false,
                groupsetting:{
                    messageNotice:false,
                    conversationTop:false
                },
                searchResult:[],
                searchFriendName:'',
                addChooseArr:[],
                reduceChooseArr:[],
                chooseArr:[],
                currentList:[],
                currentHandle:''
            }
        },
        // components:{
        //     'list-choose':ListChoose
        // },
        computed:{
            ...mapState({
                currentGroup(state){
                    return state.currentGroup
                },
                userData(state){
                    return state.userData
                },
                conversationList(state){
                    return state.conversationList
                },
                lastfriendlist(state){
                    let hasArr = []
                    let lastArr = []
                    if(this.currentGroup == null){
                        return []
                    }
                    for(let item of this.currentGroup.baseInfo.members){
                        hasArr.push(item.uuid)
                    }
                    for(let item of state.friendlist){
                        let exist = false
                        for(let i=0;i<hasArr.length;i++){
                            if(hasArr[i]==item.uuid){
                                exist = true
                                break
                            }
                        }
                        if(!exist){
                            lastArr.push(item)
                        }
                    }
                    lastArr.sort((a,b)=>{
                        return a.firstLetter>b.firstLetter
                    })
                    return lastArr
                },
                friendlist(state){
                    return state.friendlist
                },
                reduceMemebers(state){
                    let arr = []
                    // for(let )
                  
                },
                showLength(state){
                    return state.showMemberCount
                },
                searchList(state){
                    return state.searchList
                }
            }),
            addChooseArrLen(){
                let count = 0
                for(let item of this.chooseArr){
                    if(item==true){
                        count++
                    }
                }
                return count
            },
            // reduceChooseArrLen(){
            //     let count = 0
            //     for(let item of this.addChooseArr){
            //         if(item){
            //             count++
            //         }
            //     }
            //     return count
            // },
            // 非群主成员
            otherMembers(){
                let res = []
                if(this.currentGroup==null || this.currentGroup.baseInfo==null){
                    return
                }
                for(let item of this.currentGroup.baseInfo.members){
                    if(item.uuid!=this.currentGroup.baseInfo.group_info.owner){
                        res.push(item)
                    }
                }
                // console.log(this.showLength)
                // console.log(res)
                return res
            },
            // 生成26个大写英文字母
            getBigLetters(){
                let bigLetter = []
                for(let i=65;i<91;i++){
                    bigLetter.push(String.fromCharCode(i))
                }
                return bigLetter
            },
            // 通讯录排序
            sortMail(){
                let res = []
                let special = []
                
                for(let item of this.lastfriendlist){
                    let name = item.remark_name || item.nickname
                    let first = pinyin.getFullChars(name)[0].toUpperCase()
                    if(this.getBigLetters.indexOf(first)>=0){
                        item.firstLetter = first
                        res.push(item)
                    }else{
                        item.firstLetter = '#'
                        special.push(item)
                    }
                }
                res.sort((a,b)=>{
                    return a.firstLetter>b.firstLetter
                })
                for(let item of special){
                    res.push(item)
                }
                return res
            },
            // 群成员排序
            sortMembers(){
                let res = []
                let special = []
                for(let item of this.otherMembers){
                    let name = item.remark_name || item.nickname
                    let first = pinyin.getFullChars(name)[0].toUpperCase()
                    if(this.getBigLetters.indexOf(first)>=0){
                        item.firstLetter = first
                        res.push(item)
                    }else{
                        item.firstLetter = '#'
                        special.push(item)
                    }
                }
                res.sort((a,b)=>{
                    return a.firstLetter>b.firstLetter
                })
                for(let item of special){
                    res.push(item)
                }
                return res
            }
        },
        watch:{
            searchList(val,oldval){
                // console.log(val)
                if(val.list.length==0){
                    for(let i=0;i<this.currentList.length;i++){
                        $('.friend-list-add ul li').eq(i).hide()
                    }
                    return
                }
                if(val.list.length>0){
                    let arr = []
                    for(let item of val.list){
                        let exist = false
                        for(let i=0;i<this.currentList.length;i++){
                            if(item.uuid==this.currentList[i].uuid){
                                arr.push(i)
                                break
                            }
                        }
                    }
                    for(let i=0;i<this.currentList.length;i++){
                        if(arr.indexOf(i)>=0){
                            $('.friend-list-add ul li').eq(i).show()
                        }else{
                            $('.friend-list-add ul li').eq(i).hide()
                        }
                    }
                }
            },
            searchFriendName(val,oldval){
                if(val==''){
                    this.$store.commit('searchList',{list:this.friendlist})
                }
            }
        },
        methods:{
            // 关闭选择列表
            cancelChoose(){
                for(let i=0;i<this.chooseArr.length;i++){
                    Vue.set(this.chooseArr,i,false)
                }
                this.currentHandle = ''
                // console.log(this.chooseArr)
                this.chooseArr.splice(0)
                $('.handle-group-member').hide()
            },
            // 搜索本地好友
            searchLocalFriend(){
                this.searchResult = []
                if(this.searchFriendName==""){
                    this.$store.commit('searchList',{list:this.currentList})
                    return
                }
                console.log(444)
                let remark, item, nickname
                let search = pinyin.getFullChars(this.searchFriendName).toLocaleLowerCase()
                for(let i=0;i<this.currentList.length;i++){
                    item = this.currentList[i]
                    remark = pinyin.getFullChars((item.remark_name ? item.remark_name : '')).toLocaleLowerCase()
                    nickname = pinyin.getFullChars(item.nickname).toLocaleLowerCase()
                    if(remark.indexOf(search)>=0 || nickname.indexOf(search)>=0){
                        this.searchResult.push(item)
                    }
                }
                // console.log(this.searchResult)
                this.$store.commit('searchList',{list:this.searchResult})
            },
            // 设置群组置顶/消息免打扰
            setTopNotice(bool){
                let id = this.currentGroup.baseInfo.group_info.id
                let con = _.find(this.conversationList,(o)=>o.targetId==id)
                if(con){

                }
                // 置顶
                conversation_db.set_top({
                    targetId:id,
                    userUuid:this.userData.data.uuid,
                    isTop:this.groupsetting.conversationTop ? '1' : '0'
                },res=>{
                    if(res.rowsAffected>=1){
                        this.$store.commit('getConversationList',{
                            handle:'topOrtips',
                            list:{
                                isTop:this.groupsetting.conversationTop ? '1' : '0',
                                userUuid:this.userData.data.uuid,
                                targetId:id,
                                noTips:con.noTips
                            }
                        })
                    }
                }) 
                // 免打扰   
                conversation_db.set_tips({
                    targetId:id,
                    userUuid:this.userData.data.uuid,
                    noTips:this.groupsetting.messageNotice ? '1' : '0',
                    isTop:con.isTop
                },res=>{
                    if(res.rowsAffected>=1){
                        this.$store.commit('getConversationList',{
                            handle:'topOrtips',
                            list:{
                                isTop:con.isTop,
                                userUuid:this.userData.data.uuid,
                                targetId:id,
                                noTips:this.groupsetting.messageNotice ? '1' : '0'
                            }
                        })
                    }
                })        
                
            },
            // 计算头像背景颜色
            portraitColor(uuid){
                return DOMController.portraitColor(uuid)
            },
            // 放大头像图片
            zoomImg(ev, avatar){
                $('.img-preview img').remove()
                let imgTag = `<img src="${avatar}" 
                    style="width:${ev.target.naturalWidth}px;
                    height:${ev.target.naturalHeight}px;"/>`
                $('.img-preview .imgpreview-container').append(imgTag)
                $('.img-preview').css({
                    transform:'scale(1) translateX(-50%)'
                })
            },
            // 设置群公告
            setGroupNotice(ev){
                if(ev.target.tagName=='I'){
                    $('.notice').focus()
                }
                if(ev.target.tagName=="INPUT"){
                    let { id, owner }= this.currentGroup.baseInfo.group_info
                    let content = ev.target.value
                    if(owner!=this.userData.data.uuid){
                        ev.target.value = ''
                        return
                    }else{
                        Group.getGroupInfo({id},({baseInfo,notice})=>{
                            if((notice!=null && notice.content!=$('.group-notice .notice').val()) || (notice==null && $('.group-notice .notice').val()!='')){
                                Group.setGroupNotice({id, content},(res)=>{
                                    var conversationtype = RongIMLib.ConversationType.GROUP
                                    // 目标 Id
                                    var targetId = this.currentGroup.baseInfo.group_info.id+''

                                    // @ 消息对象
                                    var mentioneds = new RongIMLib.MentionedInfo()
                                    // 全部：RongIMLib.MentionedType.ALL；部分：RongIMLib.MentionedType.PART
                                    // if(arr.indexOf('@所有人 ')>=0){
                                    mentioneds.type = RongIMLib.MentionedType.ALL
                                    mentioneds.userIdList = _.map(this.currentGroup.baseInfo.members,'uuid')
                                    // serIdList = _.map(resUUID,'uuid')
                                    
                                    var msg = new RongIMLib.TextMessage({content:"@所有人 "+$('.group-notice .notice').val(),extra:"附加信息",mentionedInfo:mentioneds})
                                    RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
                                                onSuccess: function (message) {
                                                    //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                                                    // console.log("Send successfully")
                                                    this.$store.commit('getSendedMessage',{
                                                        list:message,
                                                        str:'new'
                                                    })
                                                    DOMController.scrollToBottom({toBottom:true,_this:this})
                                                    // setTimeout(()=>{
                                                    //     $('#talkarea .right .middle').scrollTop($('#talkarea .right .middle')[0].scrollHeight)
                                                    // },100)
                                                    // console.log(message)
                                                    let content = message.content
                                                    let msg = {
                                                        targetId:''+this.currentGroup.baseInfo.group_info.id + '',
                                                        content:message.content,
                                                        sentTime:new Date().getTime()
                                                    }
                                                    this.$store.commit('addUnreadCount',msg)
                                                    this.message = ''
                                                }.bind(this),
                                                onError: function (errorCode,message) {
                                                    var info = '';
                                                    switch (errorCode) {
                                                        case RongIMLib.ErrorCode.TIMEOUT:
                                                            info = '超时';
                                                            break;
                                                        case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                                                            info = '未知错误';
                                                            break;
                                                        case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                                                            info = '在黑名单中，无法向对方发送消息';
                                                            break;
                                                        case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                                                            info = '不在讨论组中';
                                                            break;
                                                        case RongIMLib.ErrorCode.NOT_IN_GROUP:
                                                            info = '不在群组中';
                                                            break;
                                                        case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
                                                            info = '不在聊天室中';
                                                            break;
                                                        default :
                                                            info = x;
                                                            break;
                                                    }
                                                    console.log('发送失败:' + info);
                                                }
                                            },true)
                              
                                })
                        
                            }
                        })
                    }
                }
            },
            // 设置群名称
            setGroupName(ev){
                if(ev.target.tagName=='I'){
                    $('.group-name').focus()
                }
                if(ev.target.tagName=="INPUT"){
                    let { id, owner }= this.currentGroup.baseInfo.group_info
                    let name = ev.target.value
                    if(owner!=this.userData.data.uuid){
                        // name = this.currentGroup.baseInfo.group_info.name
                        return
                    }else{
                        Group.getGroupInfo({id},({baseInfo,notice})=>{
                            if(baseInfo.group_info.name==name){
                                return
                            }else{
                                Group.setGroupName({id, name},(res)=>{
                        //    console.log(res)
                                }) 
                            }
                        })
                    }
                }
            },
            // 删除多个群成员
            deleteMulti(str){
                this.seeAllMembers = false
                if(str=='reduce'){
                    $('.friend-list-add').css({
                        transform:'scale(1)'
                    })
                    this.currentHandle = 'member'
                    this.isFalse('member')
                    this.currentList = this.sortMembers
                    $('.handle-group-member').show()
                    $('.handle-group-member p span.notice').text('删除群成员')
                }
                if(str=='cancel'){
                    // $('.member-list-reduce').css({
                    //     transform:'scale(0)'
                    // })
                    // $('.handle-group-member').show()
                    this.selectAllRes = false
                }
                if(str=='confirm'){
                    // $('.member-list-reduce').css({
                    //     transform:'scale(0)'
                    // })
                    this.selectAllRes = false
                    let deleteArr = []
                    console.log(this.currentList)
                    for(let i=0;i<this.chooseArr.length;i++){
                        if(this.chooseArr[i]){
                            deleteArr.push(this.currentList[i].uuid)
                        }
                    }
                    // console.log(deleteArr)
                    Group.quitGroup({id:this.currentGroup.baseInfo.group_info.id, friends:deleteArr.join(',')}, (res)=>{
                        if(res.status=='1'){
                            if(res.status=='1'){
                                Group.getGroupInfo({id:this.currentGroup.baseInfo.group_info.id},({baseInfo, notice})=>{
                                    this.$store.commit('showGroupInfo',{
                                        group:{
                                            baseInfo,notice
                                        },
                                        handle:'getInfo'
                                    })
                                    this.cancelChoose()
                                })
                            }
                        }
                    })
                }
                // console.log(this.currentGroup.baseInfo.members)
            },
            // 删除群成员
            deleteMember(item){
                // console.log(_.compact(this.isChooseArr))
                if(_.compact(this.isChooseArr).length>=2){
                    this.deleteMulti('confirm')
                    return
                }
                const id = this.currentGroup.baseInfo.group_info.id
                const friends = item.uuid
                $('.handle-group-member').hide()
                // console.log(1111)
                Group.quitGroup({id, friends}, (res)=>{
                    if(res.status=='1'){
                        if(res.status=='1'){
                            Group.getGroupInfo({id},({baseInfo, notice})=>{
                                this.$store.commit('showGroupInfo',{
                                    group:{
                                        baseInfo,notice
                                    },
                                    handle:'getInfo'
                                })
                            })
                            DOMController.scrollToBottom({toBottom:true,_this:this})
                        }
                    }
                })
                // console.log(this.currentGroup)
            },
            // 清空所有被勾选好友
            isFalse(str){
                if(str=='friend'){
                    for(let item of this.lastfriendlist){
                        this.chooseArr.push(false)
                    }
                }
                if(str=='member'){
                    for(let item of this.otherMembers){
                        this.chooseArr.push(false)
                    }
                }
                // console.log(this.chooseArr)
                // this.addChooseArr = []
                // for(let item of this.sortMail){
                //     this.addChooseArr.push(false)
                // }
                // this.reduceChooseArr = []
                // for(let item of this.otherMembers){
                //     this.reduceChooseArr.push(false)
                // }
            },
            // 添加群成员
            addMember(str){
                this.seeAllMembers = false
                if(str=='add'){
                    // $('.friend-list-add').addClass('slideInDown')
                    this.currentHandle = 'friend'
                    $('.friend-list-add').css({
                        transform:'scale(1)'
                    })
                    //  $('.member-list-reduce').addClass('slideOutUp')
                    $('.member-list-reduce').css({
                        transform:'scale(0)'
                    })
                    this.isFalse('friend')
                    this.currentList = this.sortMail
                    $('.handle-group-member').show()
                    $('.handle-group-member p span.notice').text('添加群成员')
                    this.searchFriendName = ''
                }else if(str=='cancel'){
                    // $('.friend-list-add').addClass('slideOutUp')
                    $('.friend-list-add').css({
                        transform:'scale(0)'
                    })
                    this.selectAllRes = false
                    this.searchFriendName = ''
                }else{
                    //  $('.friend-list-add').addClass('slideOutUp')
                    // $('.friend-list-add').css({
                    //     transform:'scale(0)'
                    // })
                    $('.handle-group-member').hide()
                    this.selectAllRes = false
                    let friends = []
                    let name = []
                    this.chooseArr.forEach((item,idx)=>{
                        if(item){
                            friends.push(this.currentList[idx].uuid)
                        }
                    })
                    
                    let { id } = this.currentGroup.baseInfo.group_info
                    if(this.currentHandle=='friend'){
                        Group.joinGroup({
                            id,
                            friends:friends.join(',')
                        },(res)=>{
                            if(res.status=='1'){
                                Group.getGroupInfo({id},({baseInfo, notice})=>{
                                    this.$store.commit('showGroupInfo',{
                                        group:{
                                            baseInfo,notice
                                        },
                                        handle:'getInfo'
                                    })
                                    this.cancelChoose()
                                })
                            }
                        })
                    }
                    if(this.currentHandle=='member'){
                        this.deleteMulti('confirm')
                    }
                    
                }
            },
            // 查看全部成员
            seeAll(){
                this.$store.commit('showMemberCount',this.currentGroup.baseInfo.members.length)
                return
            },
            // 是否全选
            selectAll(bool,str){
                if(bool){
                    if(str=='add'){
                        this.isFalse()
                    }
                    if(str=='reduce'){
                        this.isChooseArr = []
                        for(let item of this.currentGroup.baseInfo.members){
                            this.isChooseArr.push(true)
                        }
                    }   
                }else{
                    if(str=='add'){
                        this.isFalse()
                    }
                    if(str=='reduce'){
                        this.isChooseArr = []
                        for(let item of this.currentGroup.baseInfo.members){
                            this.isChooseArr.push(false)
                        }
                    }
                }
                
                // console.log(str)
            },
            // 删除已勾选好友
            notChoose(idx){
                Vue.set(this.chooseArr, idx, false)
            },
            // 是否选中
            isChoose(bool,item,str){
                if(bool){
                    if(str=='add'){
                        let middleware = false
                        for(let item of this.chooseArr){
                            if(item==false){
                                middleware = true
                                break
                            }
                        }
                        // console.log(this.chooseArr)
                        // console.log(this.addChooseArr)
                        if(middleware){
                            this.selectAllRes = false
                        }else{
                            this.selectAllRes = true
                        }
                    }
                    if(str=='reduce'){
                        let count = 0
                        for(let i=0;i<this.isChooseArr.length;i++){
                            if(this.isChooseArr[i]==false){
                                count++
                                if(count>1){
                                    break
                                }
                            }
                        }
                        if(count>1){
                            this.selectAllRes = false
                        }else{
                            this.selectAllRes = true
                        }
                    }
                }else{
                    this.selectAllRes = false
                }

            },
            // 添加群成员为好友
            addGroupMemberToFriend(item){
                let exist = false
                for(let friend of this.friendlist){
                    if(item.uuid==friend.uuid){
                        exist = true
                        break
                    }
                }
                if(exist){
                    return '发消息'
                }else{
                    return '加好友'
                }
            },
            // 删除群组
            dismissGroup(){
                const { id } = this.currentGroup.baseInfo.group_info
                Group.deleteGroup({id}, (res)=>{
                    if(res.status=='1'){
                        // this.$store.commit('getGroupList', {
                        //     list:this.currentGroup.baseInfo.group_info,
                        //     handle:'delete'
                        // })
                        // this.$store.commit('getConversationList', {
                        //     list:this.currentGroup.baseInfo.group_info,
                        //     handle:'delete'
                        // })
                        this.$store.commit('changeCurrentFriendName',{})
                        this.$nextTick(()=>{
                            $('.init').show()
                        })
                        this.closePanel('.delete-group','hide')
                        this.closePanel('#group-info','hide')
                        $('.modal-delete-group-groupinfo').hide()
                        // $('.init').show()
                    }
                })
            },
            // 确认退出群组
            confirmQuitGroup(){
                const { id } = this.currentGroup.baseInfo.group_info
                const friends = this.userData.data.uuid
                console.log(222)
                Group.quitGroup({id, friends},(res)=>{
                    if(res.status=='1'){
                        this.$store.commit('getGroupList',{
                            list:this.currentGroup.baseInfo.group_info, handle:'delete'
                        })
                        this.closePanel('#group-info','hide')
                        this.$store.commit('getConversationList', {
                            list:this.currentGroup.baseInfo.group_info,
                            handle:'delete'
                        })
                        this.$store.commit('changeCurrentFriendName',null)
                        $('.init').show()
                        $('#group-info').css({
                            transform:'scale(0)'
                        })
                        $('.modal-quit-group-groupinfo').hide()
                    }
                })
            },
            // 退出群组
            quitGroup(ev){
                const { id } = this.currentGroup.baseInfo.group_info
                const friends = this.userData.data.uuid
                if(ev.target.innerText=='退出群组'){
                    $('.modal-quit-group-groupinfo').show()
                    return
                    Group.quitGroup({id, friends},(res)=>{
                        if(res.status=='1'){
                            this.$store.commit('getGroupList',{
                                list:this.currentGroup.baseInfo.group_info, handle:'delete'
                            })
                            this.closePanel('#group-info','hide')
                            this.$store.commit('getConversationList', {
                                list:this.currentGroup.baseInfo.group_info,
                                handle:'delete'
                            })
                            this.$store.commit('changeCurrentFriendName',null)
                            $('.init').show()
                            $('#group-info').css({
                                transform:'scale(0)'
                            })
                            $('.modal-quit-group-groupinfo').hide()
                        }
                    })
                }
                if(ev.target.innerText=='解散群组'){
                    $('.modal-delete-group-groupinfo').show()
                    return
                    Group.deleteGroup({id}, (res)=>{
                        if(res.status=='1'){
                            this.$store.commit('getGroupList',{
                                list:this.currentGroup.baseInfo.group_info,
                                handle:'delete'
                            })
                            this.$store.commit('getConversationList',{
                                list:this.currentGroup.baseInfo.group_info,
                                handle:'delete'
                            })
                            this.$store.commit('changeCurrentFriendName',null)
                            $('.init').show()
                            $('#group-info').css({
                                transform:'scale(0)'
                            })
                        }
                    })
                }
            },
            // 显示/隐藏群资料面板 || 弹窗
            closePanel(el,str){
                if(str=='hide'){
                    $(el).css({
                        transform:'scale(0)'
                    })
                    this.searchFriendName = ''
                }
                if(str=='show'){
                    $(el).css({
                        transform:'scale(1)'
                    })
                }
            },
            // 向群成员发消息/添加群成员为好友
            intoPrivateCon(ev, item){
                this.closePanel('#group-info','hide')
                if(ev.target.innerText=='发消息'){
                    for(let leag of this.conversationList){
                        if(item.uuid==leag.targetId){
                            this.$store.commit('changeCurrentFriendName',leag)
                            break
                        }
                    }
                    
                }
                if(ev.target.innerText=='加好友'){
                    $('.add-friend-remark').css({
                        transform:'scale(1)'
                    })
                    this.$store.commit('addFrienduuid',item)
                }
            },
            // 查看群成员信息
            showMemberInfo(ev,item){
                this.axios.get(this.ajaxUrl + '/v1/search_friends',{
                        params:{
                            token:sessionStorage.usertoken,
                            to_user:item.uuid
                        }
                    }).then(res=>{
                        if(res.data.status){
                            // $('.user-info').css({right:0})
                            this.$store.commit('showFriendMsg',res.data.data)
                            this.$store.commit('changeUserInfoStatus','show')
                            const params = {
                                el:$('.user-info'),
                                clientX:ev.clientX,
                                clientY:ev.clientY
                            }
                            DOMController.userInfoPosition(params)
                        }})
            },
            // 清除群聊天记录
            clearMsg(status){
                if(status==='0'){
                    $('.modal-clear-message-groupinfo').show()
                    return
                }
                if(status==='1'){
                    let sentTime = 0
                    for(let item of this.conversationList){
                        if(item.targetId==this.currentGroup.baseInfo.group_info.id){
                            sentTime = item.sentTime
                        }
                    }
                    let params = {
                        targetId:this.currentGroup.baseInfo.group_info.id.toString(),
                        conversationType:'GROUP',
                        sentTime
                    }
                    Message.clearHistoryMsg({
                        list:[params]
                    }, (res)=>{
                        if(res.status){
                            this.$store.commit('getSendedMessage',{
                                list:[],
                                str:'changeFriend'
                            })
                            this.$store.commit('getConversationList',{
                                list:[{targetId:this.currentGroup.baseInfo.group_info.id}],
                                handle:'clear-latestmsg'
                            })
                            $('#group-info').css({
                                transform:'scale(0)'
                            })
                            this.$store.commit('getCurrentUnreadCount',{
                                count:0,
                                handle:'change'
                            })
                            this.$store.commit('getAppLatestMsg',null)
                            // console.log()
                            // this.$nextTick(()=>{
                            //     $('.toBottom').remove()
                            // })
                            $('.modal-clear-message-groupinfo').hide()
                            params = null
                        }
                    })
                }
            }

        },
        mounted(){
            $('#group-info').bind('click',(ev)=>{
                if(ev.target.classList.contains('name-img') || ev.target.classList.contains('nickname-avatar') || ev.target.tagName==='IMG'){

                }else{
                    this.$store.commit('changeUserInfoStatus','hide')
                }
            })
            // this.addChooseArr = []
            // for(let i=0;i<this.sortMail.length;i++){
            //     this.addChooseArr.push(false)
            // }
            // this.reduceChooseArr = []
            // for(let i=0;i<this.otherMembers.length;i++){
            //     this.reduceChooseArr.push(false)
            // }
        },
        store
    }
</script>
<style lang="scss" scoped>
    @import '../style/common';
    #group-info{
        position:fixed;transform:scale(0);
        z-index:5000;width:300px;display:flex;
        flex-direction:column;right:1px;top:1px;
        border-bottom:1px solid #ccc;
        // border-left:$border_style;border-bottom:1px solid #ccc;
        box-shadow:3px 2px 3px 1px rgba(155, 145, 145,0.1),-3px 2px 3px 1px rgba(155, 145, 145,0.1);
        background:#fff;bottom:0;margin-top:60px;
        .modal-clear-message-groupinfo,
        .modal-delete-group-groupinfo,
        .modal-quit-group-groupinfo{
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
        
        .up{
            // hr{
            //     position:absolute;top:103px;width:270px;
            //     left:15px;border-bottom:$border_style;
            // }
            border-bottom:$border_style;
            // ::after{
            //     content:'';
            //     display:block;
            //     height:1px;width:100%;
            // border-bottom:$border_style;

            // }
            padding:10px;position:relative;
            padding-bottom:50px;
            span.name-img{
                @include nickname_avatar;margin-top:0px;margin-bottom:10px;
                margin-left:10px;width:44px;height:44px;line-height:44px;
            }
            img{
                width:44px;height:44px;
                float:left;cursor:pointer;
                margin-left:10px;margin-bottom:10px;
                top:10px;border-radius:50%;
            }
            p{
                color:#333;font-size:12px;
                i{
                    font-size:12px;cursor:pointer;
                    opacity:0;margin-left:5px;
                }
                &:hover{
                    i{
                        opacity:1;
                    }
                }
                input{
                    cursor: pointer;width:110px;padding:2px 2px;font-weight:500;
                    @include text-ellipse;font-size:16px;
                }
                .notice{
                    color:#333;font-size:12px;font-weight:500;
                }
            }
            input,textarea{
                border:0 none;resize:none;
            }
            textarea{
                height:20px;text-align:left;
            }
            .close{
                @include close_button;
            }
            p.p-group-name{
                span{
                    width:110px;padding:2px 4px;font-weight:500;
                    @include text-ellipse;font-size:16px;
                    margin-left:20px;display:inline-block;
                }
            }
            p:nth-child(2){
                margin-top:10px;
            }
            p.group-notice{
                position:absolute;top:60px;
                span{
                    margin-left:12px;color:#333;font-weight:500;
                    font-size:14px;
                }
                i{
                    margin-left:-5px;
                }
                input{
                    width:250px;
                }
                .group-notice-title{
                    display:block;width:247px;position:absolute;
                    box-shadow:0px 1px 3px 1px rgba(155, 145, 145, 0.2),0px 2px 3px 1px rgba(155, 145, 145,0.2);
                    @include word_break;display:none;
                    padding:10px;background:#fff;color:#8b8b8b;
                    border-radius:2px;top:45px;left:-5px;
                }
                .triangle{
                    position:absolute;top:33px;transform:rotate(-90deg);
                    left:10px;color:rgba(0,0,0,0.1);display:none;
                }
                &:hover .group-notice-title{
                    display:block;
                }
                // &:hover .triangle{
                //     display:block;
                // }
            }
        }
        .down{
            flex:1;display:flex;flex-direction:column;
            form{
                display:block;height:30px;text-align:center;
                padding:15px;
                position:relative;
                .el-input{
                    height:20px;
                }
                >span{
                    position:absolute;z-index:1;top:15px;left:15px;
                }
            }
            .gm-scrollbar-container{
                flex:1;
            }
            ul::-webkit-scrollbar {/*滚动条整体样式*/
                width: 5px;
                height: 5px;
            }
            ul::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
                border-radius: 10px;max-height:30px;
                background: #fff;
            }
            ul::-webkit-scrollbar-track {/*滚动条里面轨道*/
                border-radius: 10px;
                background: #fff;
            }
            ul:hover::-webkit-scrollbar-thumb{
                background:#ddd;
            }
            ul{
                overflow-y:auto;
                flex:1;padding:10px;
                li.total{
                    padding-left:12px;font-size:14px;
                }
                .add{
                    span.iconfont{
                        border:1px solid #ccc;text-align:center;box-sizing:border-box;
                        line-height:36px;
                        background:#fff;
                        color:#333;border-radius:50%;margin-top:6px;
                        cursor:pointer;margin-left:6px;margin-bottom:6px;
                        display:inline-block;height:36px;width:36px;
                    }
                    span:last-child{
                        display:inline-block;
                        text-align:Center;color:#ccc;
                        // height:100%;
                        // line-height:50px;
                        width:100%;@include text_ellipse;
                        font-size:12px;
                    }
                }
                li:not(.add){
                    // height:50px;line-height:50px;
                }
                li.member,li.add{
                    list-style:none;width:50px;float:left;
                    padding:2px;cursor:pointer;height:73px;
                    img{
                        @include portrait_mini;cursor:pointer;
                        margin:6px;float:left;
                    }
                    span.nickname{
                        display:inline-block;
                        text-align:Center;color:#ccc;
                        // height:100%;
                        // line-height:50px;
                        width:100%;@include text_ellipse;
                        font-size:12px;
                    }
                    .name-img{
                        @include portrait_name_mini;float:left;
                        margin:6px;cursor:pointer;
                    }
                    // .group-owner{
                    //     float:right;font-size:12px;margin-right:10px;
                    // }
                    >.el-button{
                        padding:0px;float:right;font-size:12px;margin:15px 3px;
                        font-weight:100;color:$main_font_color;padding:2px
                    }
                    .private-chat{
                        background:rgb(228,228,228);
                    }
                    .delete{
                        background:$icon_color;color:#fff;
                    }

                }
            }
            .see-all{
                background:#fff;width:100%;margin:0;border:0 none;
                position:absolute;top:290px;color:$color-success;
            }
            .msg-notice,.msg-top,.msg-clear{
                height:40px;border-top:$border_style;line-height:40px;
                font-size:14px;box-sizing:border-box;padding:0 15px;
                // display:none;
                .el-switch{
                    float:right;cursor: pointer;margin-top:10px;
                }
            }
            .msg-notice,.msg-top{
                // display:none;
            }
            .msg-clear{
                color:$color-success;cursor: pointer;text-align:center;
            }
            p:last-child{
                text-align:center;line-height:40px;font-size:14px;height:40px;
                color:$icon_color;border-top:1px solid #ddd;cursor:pointer;
                font-weight:500;
            }
        }
        .handle-group-member{
            position: fixed;;top:0px;right:50%;
            width:539px;height:456px;background:#fff;
            display:none;
            box-shadow:3px 2px 3px 1px rgba(155, 145, 145,0.1),-3px 2px 3px 1px rgba(155, 145, 145,0.1);
            p.title{
                @include title_style;
                span:nth-child(1){
                    float:left;margin-left:15px;font-weight:600;
                }
                span:nth-child(2){
                    float:right;margin-right:10px;cursor:pointer;
                    line-height:38px;
                }
            }
        }
        .choosed-group-friend{
            position:absolute;
            border-left:1px solid #ddd;
            // left:340px;top:61px;
            left:238px;top:36px;
            overflow-y:auto;
            width:300px;height:420px;
            display:flex;flex-direction:column;
            // transform:scale(0);
            p{
                padding:20px 0px 15px 20px;
                // background:#EFF3F6;
                background:#fff;color:#868686;
                font-size:14px;
            }
            ul::-webkit-scrollbar {/*滚动条整体样式*/
                width: 5px;
                height: 1px;
            }
            ul::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
                border-radius: 10px;max-height:30px;
                background: #fff;
            }
            ul::-webkit-scrollbar-track {/*滚动条里面轨道*/
                border-radius: 10px;
                background: #fff;
            }
            ul:hover::-webkit-scrollbar-thumb{
                background:#ccc;
            }
            ul{
                background:#fff;overflow-y:auto;
                height:500px;width:100%;
                li{
                    list-style:none;height:58px;position:relative;
                    cursor:pointer;
                     img{
                        @include portrait-mini;float:left;
                        margin:10px;cursor:pointer;
                    }
                    .nickname-avatar{
                        @include portrait_name_mini;
                        margin:10px;cursor:pointer;float:left;
                    }
                    span.nickname{
                        display:inline-block;height:100%;margin:0px;
                        line-height:58px;margin-left:5px;
                        float:left;width:100px;font-size:12px;
                        @include text_ellipse;
                    }
                    span.close{
                        position:absolute;top:18px;right:20px;
                        display:inline-block;background:#ccc;
                        border-radius:50%;color:#fff;height:18px;
                        width:18px;text-align:center;line-height:22px;
                    }
                }
            }
            .btns{
                height:50px;background:#fff;padding-right:20px;
                line-height:50px;text-align:right;
                >.confirm{
                    right:10px;@include btn_success;
                }
                >.cancel{
                    right:70px;@include btn_default;
                }
            }
            .last{
                height:10px;
            }
            // .el-button{
            //     position:absolute;bottom:10px;
            // }
            // >.confirm{
            //     right:20px;@include btn_success;
            // }
            // >.cancel{
            //     right:100px;@include btn_default;
            // }
        }
        
        .friend-list-add,.member-list-reduce{
            position:absolute;height:100%;width:238px;
            border-right:$border_style;
            // background:#fff;
            transform:scale(0);
            z-index:5003;
            // left:-480px;
            top:36px;
            // box-shadow:0 0 3px 1px rgba(0,0,0,0.3);
            // border:1px solid #ddd;
            .search{
                width:200px;margin:20px;
            }
            ul::-webkit-scrollbar {/*滚动条整体样式*/
                width: 5px;
                height: 5px;
            }
            ul::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
                border-radius: 10px;
                background: #fff;
            }
            ul::-webkit-scrollbar-track {/*滚动条里面轨道*/
                border-radius: 10px;
                background: #fff;
            }
            ul:hover::-webkit-scrollbar-thumb{
                background:#ddd;
            }
            ul{
                margin:0;padding:0 10px;
                height:352px;overflow-y:auto;
                li.letterFirst{
                    height:78px !important;
                    span.nickname{
                        height:50px !important;margin-top:20px !important;
                    }
                    img,.nickname-avatar{
                        margin-top:30px !important;
                    }
                    .el-checkbox{
                        margin-top:38px !important;
                    }
                    
                }
                li{
                    position:relative;
                    list-style:none;height:58px;
                    // border-bottom:$border_style;
                    .letter-sort{
                        position:absolute;
                        padding-left:22px;
                        color:#827B7B;
                        font-size:14px;
                        width:100%;box-sizing:border-box;height:20px;line-height:20px;
                        
                    }
                    img{
                       @include portrait_mini;float:left;
                        margin:10px;cursor:pointer;
                    }
                    .nickname-avatar{
                        @include portrait_name_mini;float:left;
                        margin:10px;cursor:pointer;
                    }
                    span.nickname{
                        display:inline-block;height:100%;margin:0px;
                        line-height:50px;margin-left:8px;
                        float:left;width:80px;font-size:12px;
                        @include text_ellipse;
                    }
                    .el-checkbox{
                        float:right;margin:10px;margin-top:15px;
                        margin-right:5px;
                    }
                    >.el-button{
                        padding:0px;float:right;font-size:12px;margin:15px 3px;
                        font-weight:100;color:$main_font_color;padding:2px
                    }
                    .private-chat{
                        background:rgb(228,228,228);
                    }
                    .delete{
                        background:$icon_color;color:#fff;
                    }
                    
                }
            }
           
            .select-all{
                margin-top:10px;float:right;
                margin-right:25px;
            }
            >.el-button{
                position:absolute;bottom:10px;
            }
            .confirm{
                right:25px;
                @include btn_success;
            }
            .cancel{
                right:100px;@include btn_default;
            }
        }
        .member-list-reduce ul{
            height:80% !important;
        }
    }
</style>

