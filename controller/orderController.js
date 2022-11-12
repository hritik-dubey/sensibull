let orderModel = require("../model/orderModel")
const axios = require("axios");
let cron = require("node-cron")
let placeOrder = async (req, res) => {
    try {
        const axiousResponse = await axios({
            url: "https://sensibull-api.herokuapp.com/api/v1/order/place",
            method: "post",
            data: req.body,
            headers: {
                'X-AUTH-TOKEN': "asdfghjkghjbghh"
            }
        });
        let data = {}
        data.identifier = axiousResponse.data.payload.order.order_id,
            data.symbol = axiousResponse.data.payload.order.symbol,
            data.quantity = axiousResponse.data.payload.order.request_quantity
        data.filled_quantity = axiousResponse.data.payload.order.filled_quantity
        data.order_status = axiousResponse.data.payload.order.status 

        let orderCreated = await orderModel.create(data)
        return res.status(200).send({ success: true, payload: orderCreated })
    } catch (err) {
        return res.status(500).send({ success: false, error: err.message })
    }
}
let modify = async (req, res) => {
    try {
        let dbRecord  =  await orderModel.findOne({identifier:req.body.identifier})
        if(dbRecord){
        if(dbRecord.order_status!="open"){
            return res.status(400).send({ success: false, message: "you can not update the order" })
        }
        if(dbRecord.filled_quantity>req.body.quantity){
            return res.status(400).send({ success: false, message: "requested quantity is greater than filled quantity" })
        }
        const axiousResponse = await axios({
            url: `https://sensibull-api.herokuapp.com/api/v1/order/${req.body.identifier}`,
            method: "put",
            data: {
                "quantity": req.body.quantity
            },
            headers: {
                'X-AUTH-TOKEN': "asdfghjkghjbghh"
            }
        });
        
        if(axiousResponse.data.message){
            return res.status(400).send({success: false, message: "requested quantity is greater than filled quantity" })
        }
        let updatedRecord = axiousResponse.data.payload;
        let update = await orderModel.findOneAndUpdate({ identifier: updatedRecord.order.order_id }, { quantity: updatedRecord.order.request_quantity, filled_quantity: updatedRecord.order.filled_quantity}, { new: true })
        return res.status(200).send({success: true, payload: update })
    }else{
        return res.status(400).send({ success: false, message: "no record found for this id" })
    }
    } catch (err) {
        return res.status(500).send({success:false, error: err.message })
    }
}
let cancel  = async(req,res)=>{
    try{
        let dbRecord  =  await orderModel.findOne({identifier:req.body.identifier})
        if(dbRecord){
        if(dbRecord.order_status!="open"){
            return res.status(400).send({ success: false, message: "you can not update the order" })
        }
        const axiousResponse = await axios({
            url: `https://sensibull-api.herokuapp.com/api/v1/order/${req.body.identifier}`,
            method: "delete",
            headers: {
                'X-AUTH-TOKEN': "asdfghjkghjbghh"
            }
        });
        if(axiousResponse.data.message){
            return res.status(400).send({ success: false, message: "order can not be cancelled, order status must be open"})
        }
        let updatedRecord = axiousResponse.data.payload;
        let update = await orderModel.findOneAndUpdate({ identifier: updatedRecord.order.order_id }, {order_status:updatedRecord.order.status}, { new: true })
        return res.status(200).send({success: true, payload: update })
    }else{
        return res.status(400).send({ success: false, message: "no record found for this id" })
    }
    }catch(err){
        return res.status(500).send({success: false, error: err.message })
    }
}
let getStatus   = async(req,res)=>{
    try{
        let dbRecord  =  await orderModel.findOne({identifier:req.params.id})
        if(!dbRecord){
        return res.status(400).send({ success: false, message: "no record found for this id" })
        }
        return res.status(200).send({success: true, payload: dbRecord })
    }catch(err){
        return res.status(500).send({ success: false, error: err.message })
    }
}
cron.schedule("*/90 * * * * *", async function () {
    try {
        let data = await orderModel.find({ order_status: "open" })
        let identifierArray = data.map((el) => el.identifier)
        if (identifierArray.length) {
            const axiousResponse = await axios({
                url: `https://sensibull-api.herokuapp.com/api/v1/order/status-for-ids`,
                method: "post",
                data: {
                    "order_ids": identifierArray
                },
                headers: {
                    'X-AUTH-TOKEN': "asdfghjkghjbghh"
                }
            });
            let updatedRecord = axiousResponse.data.payload;
            for (let el of updatedRecord) {
                let status = "complete"
                if(el.filled_quantity<el.request_quantity){
                    status = "open"
                }
                let update = await orderModel.findOneAndUpdate({ identifier: el.order_id }, { filled_quantity: el.filled_quantity, order_status:status })
            }
        }
    } catch (err) {
        return res.status(500).send({success: false, error: err.message })

    }
});

module.exports = {
    placeOrder,
    modify,
    cancel,
    getStatus
}

