const axios = require('axios').default;
let paymentTransaction;
const makePayment = async (opts) => {
     
  try {
  // 1. make axios request to get token
  const token_reponse = await axios({
    method: 'post',
    url: process.env.PONITOR_TOKEN_URL,
    data: {
      "app_id": process.env.APP_ID,
      "app_secret": process.env.APP_SECRET
    }
  });
  // console.log("The token: ", token_reponse);
  let token = token_reponse.data.data.token;
  console.log(token, opts);
    // 2. use token to request payment
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
        "message": "Payment made to buy ticket using Ticket Booth" 
      }
    });
    console.log("The data", payments_response.data.data);
    paymentTransaction = payments_response.data.data.transaction
    return paymentTransaction;
  }
 
  
}

catch (error) {
  console.log(error.message);
}
}
// console.log("Trans: ", paymentTransaction);
// const getCollection = async ()=>{
//   try {
//     if (payments_response) {
//       console.log("We have it here: ", paymentTransaction);
//       let transaction_id = paymentTransaction.id;
//       const collection_token = await axios({
//         method: 'post',
//         url: process.env.PONITOR_TOKEN_URL,
//         data: {
//           "app_id": process.env.APP_ID,
//           "app_secret": process.env.APP_SECRET
//         }

//       });
//       console.log("The Collection token: ", collection_token);
//       let token_result = collection_token.data.data.token;

//       if (token_result) {
//         const get_collection = await axios({

//           url: `https://api.ponitor.com/v1/momo/collect?id=${transaction_id}`,
//           headers: { 'Authorization': 'Bearer ' + token_result }
//         })
//         console.log("We see: ", get_collection.data.data.transactions);
//         let collectionResult = get_collection.data.data.transactions;
//         return collectionResult;
//       }

//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

module.exports = {
    makePayment
}