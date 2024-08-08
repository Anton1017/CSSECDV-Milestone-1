require('dotenv').config();

function sendErrorMessage(error_msg){
    if(process.env.DEBUG_MODE == 1){
        res.status(500).send(error_msg);
    } else {
        res.status(500).send("An error occurred.");
    }
}

module.exports = sendErrorMessage  