import Vue from 'vue'

// 查找所有数据
function select_all_msg(callback){
    Vue.prototype.messageDB.transaction(function(tx){
        tx.executeSql('SELECT * FROM DELETEMSG', [], function (ctx, res) {
            callback(res)
        })
    })
}
// 插入数据
function insert_msg(params,callback){
    let inserSql = 'INSERT INTO DELETEMSG  VALUES ' + `("${params.messageUId}", "${params.senderUserId}", "${params.avatar}", "${params.nickname}", "${params.remark_name}", "${params.is_delete}","${params.targetId}","${params.handleUser}")`
    Vue.prototype.messageDB.transaction(function(tx){
        tx.executeSql(inserSql, [], function (ctx, res) {
            callback(res)
        })
    })
}
export default {
    select_all_msg,
    insert_msg
}