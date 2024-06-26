const getBuyerEnquiryEmailBody = (
  sellerName,
  itemId,
  buyerName,
  buyerEmail,
  buyerPhone
) => {
  return `<div>
<p> Hi <strong>${sellerName}</strong>,</p>
<p> You have a lead for the property post with ID-  ${
    process.env.FE_BASE_URL + "/item/" + itemId
  }</p>
<p> <b>Name: </b> ${buyerName}</p>
<p> <b>Email: </b> ${buyerEmail}</p>
<p> <b>Phone: </b> <a href="tel:${buyerPhone}">${buyerPhone}</a></p>
</div>
`;
};

module.exports = { getBuyerEnquiryEmailBody };
