import store from '../store/store'
import $ from 'jquery'
import { Conversation } from '../class/Conversation'

export function entryOfSendMsg(entry){
    let userInfo = entry.userInfo
    let conversationList = store.state.conversationList
    let exist = false
    for(let item of conversationList){
        if(userInfo.uuid==item.targetId){
            exist = true
            store.commit('getConversationList',{
                list:item,handle:'isTop'
            })
            store.commit('changeCurrentFriendName',item)
            break
        }
    }
    if(!exist){
        Conversation.createConversation({
            item:userInfo,
            type:entry.type,
            intoConversation:entry.intoConversation
        })
    }
    $('.friend-list').hide()
    $('.init-blank').hide()
    $('.choosed-friend').css({
        transform:'scale(0)'
    })
    $('.init').hide()
    $('#leftnav span.message')[0].classList.add('now')
    $('#leftnav span.relations')[0].classList.remove('now')
    $('#leftnav span.creat-group')[0].classList.remove('now')
    store.commit('showWhichList','messageList')
    store.commit('changeUserInfoStatus','hide')
    $('.create-group-container').hide()
    $('#friendlist #list').animate({scrollTop:0},0)
    $('.show-group-info').css({
        transform:'scale(0)'
    })
}