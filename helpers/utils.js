const axios = require('axios').default;

const makePayment = async (opts) => {
     
  try {
    // 1. post data to the tickets table 
    
  // 1. get the uuid, amount, msisdn, currency from the response 
       // 2. make axios request to get token
  const token_reponse = await axios({
   
    method: 'post',
    url: process.env.PONITOR_TOKEN_URL,
    data: {
      "app_id": process.env.APP_ID,
      "app_secret": process.env.APP_SECRET
    }
    
  });
  console.log("The token: ", token_reponse);
  let token = token_reponse.data.data.token;
  // console.log("Ponitor's API token: ", token);
        
    // 3. use token to request payment
  if (token) {
    const payments_response = await axios({
      method: 'post',
      url: process.env.PONITOR_PAYMENT,
      headers: { 'Authorization': 'Bearer ' + token },
      data: {
        "amount": opts.amount,
        "msisdn": opts.msisdn,
        "currency": opts.currency,
        "external_id": opts.external_id,
        "message": "Payment made to buy ticket Ticket Booth" 
      }

    });
    // transaction_date = payment_reponse.data.data.transaction.created_at;
    // transaction_id = payment_reponse.data.data.transaction.id;
    // status = payment_reponse.data.data.transaction.status;
    
    // console.log("Date, Id, status", transaction_date, transaction_id, status);
    console.log("The data", payments_response.data.data.transaction);
    return payments_response.data.data.transaction;
    // console.log("The transaction: ", transaction);
   
  }
 
  
}

catch (error) {
  console.log(error.message);
}
}


module.exports = {
    makePayment
}