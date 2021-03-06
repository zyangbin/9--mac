import Vue from 'vue'

// 查找所有数据
function select_all(callback){
    Vue.prototype.messageDB.transaction(function(tx){
        tx.executeSql('SELECT * FROM LASTREADMESSAGE', [], function (ctx, res) {
            callback(res)
        })
    })
}

// 插入一条数据
function insert_one(params,callback){
    select_one(params,doc=>{
        if(doc.rows.length==0){
           let insertSql = 'INSERT INTO LASTREADMESSAGE  VALUES ' + `("${params.senderUserId}", "${params.messageUId}","${params.lastMessageSendTime}")`
            Vue.prototype.messageDB.transaction(function(tx){
                tx.executeSql(insertSql, [], function (ctx, res) {
                    callback(res)
                },function(ctx, res){
                    // console.log(res)
                })
            }) 
        }else{
            update_one(params,res=>{
                callback(res)
            })
        }
    })
}

// 更新一条数据
function update_one(params,callback){
    let updateSql = `UPDATE LASTREADMESSAGE SET lastMessageSendTime = "${params.lastMessageSendTime}" WHERE senderUserId = "${params.senderUserId}"`
    Vue.prototype.messageDB.transaction(function(tx){
        tx.executeSql(updateSql, [], function (ctx, res) {
            callback(res)
        },function(ctx,res){
            // console.log(res)
        })
    })
}

// 查找一条数据
function select_one(params,callback){
    let { senderUserId } = params
    Vue.prototype.messageDB.transaction(function(tx){
        tx.executeSql(`SELECT * FROM LASTREADMESSAGE WHERE senderUserId="${senderUserId}"`, [], function (ctx, res) {
            callback(res)
        },function(ctx,res){
            // console.log(res)
        })
    })
}

export default {
    select_all,
    select_one,
    insert_one
}