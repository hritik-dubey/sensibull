const express = require('express');
const router = express.Router();
const api  =  require("../controller/orderController")

router.post("/order-service",api.placeOrder)
router.put("/order-service/",api.modify)
router.delete("/order-service/",api.cancel)
router.get("/order-service/",api.getStatus)




module.exports = router; 
