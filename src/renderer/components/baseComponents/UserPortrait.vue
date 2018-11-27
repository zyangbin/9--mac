<template>
    <div class="user-portrait">
        <img :src="userInfo.avatar" alt="" 
            v-if="userInfo.avatar!=null"
            :class="className" v-stop
            @click="getFriendInfo($event,userInfo.uuid)">
        <span v-if="userInfo.avatar==null"
            @click="getFriendInfo($event,userInfo.uuid)" 
            :class="className" v-stop
            v-nickname-portrait
            :style="{background:portraitColor(userInfo.uuid)}">
            {{userInfo.nickname[0]}}
        </span>
    </div>
</template>
<script>
    import { getFriendInfo } from '../../public/getFriendInfo'
    import { DOMController } from '../../class/DOMController'

    export default {
        data(){
            return{

            }
        },
        props:['userInfo','size'],
        computed:{
            // 控制头像大小
            className(){
                if(this.size=='default'){
                    if(this.userInfo.avatar!=null){
                        return 'avatar-portrait-primary'
                    }else{
                        return 'nickname-portrait-primary'
                    }
                }
                if(this.size=='mini'){
                    if(this.userInfo.avatar!=null){
                        return 'avatar-portrait-mini'
                    }else{
                        return 'nickname-portrait-mini'
                    }
                }
            }
        },
        methods:{
            // 获取好友信息
            getFriendInfo(ev,uuid){
                getFriendInfo({
                    ev,
                    uuid
                })
            },
            // 计算头像背景颜色
            portraitColor(uuid){
                return DOMController.portraitColor(uuid)
            }
        }
    }
</script>
<style lang="scss" scoped>
    .user-portrait{
        width:44px;height:44px;margin:0;
        float:left;
    }
</style>


