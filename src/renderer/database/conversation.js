import Vue from 'vue'

// 插入一个会话
function insert_one_conversation(params,callback){
    select_one_conversation(params,res=>{
        if(res.rows.length==0){
            let insertSql = 'INSERT INTO CONVERSATION  VALUES ' + 
                `("${params.userUuid}", "${params.targetId}", "${params.conversationType}","${params.isTop}","${params.noTips}")`
            Vue.prototype.messageDB.transaction(function(tx){
                tx.executeSql(insertSql, [], function (ctx, res) {
                    callback(res)
                },function(ctx,res){
                    console.log(res)
                })
            })
        }else{
            callback(res)
        }
    })
}

// 查找一个会话
function select_one_conversation(params,callback){
    let selectSql = `SELECT * FROM CONVERSATION WHERE 
        (userUuid="${params.userUuid}" AND targetId="${params.targetId}")`
    Vue.prototype.messageDB.transaction(function(tx){
        tx.executeSql(selectSql, [], function (ctx, res) {
            callback(res)
        },function(ctx,res){
            callback(res)
        })
    })
}

// 会话置顶
function set_top(params,callback){
    select_one_conversation(params,res=>{
        if(res.rows.length>0){
            let updateSql = `UPDATE CONVERSATION SET isTop = "${params.isTop}"
                WHERE (userUuid = "${params.userUuid}" AND targetId = "${params.targetId}")`
            Vue.prototype.messageDB.transaction(function(tx){
                tx.executeSql(updateSql, [], function (ctx, _res) {
                    callback(_res)
                },function(ctx,_res){
                    callback(_res)
                })
            })
        }
    })
}

// 消息免打扰
function set_tips(params,callback){
    select_one_conversation(params,res=>{
        if(res.rows.length>0){
            let updateSql = `UPDATE CONVERSATION SET noTips = "${params.noTips}"
                WHERE (userUuid = "${params.userUuid}" AND targetId = "${params.targetId}")`
            Vue.prototype.messageDB.transaction(function(tx){
                tx.executeSql(updateSql, [], function (ctx, _res) {
                    callback(_res)
                },function(ctx,_res){
                    callback(_res)
                })
            })
        }
    })
}
export default {
    insert_one_conversation,
    select_one_conversation,
    set_top,
    set_tips
}