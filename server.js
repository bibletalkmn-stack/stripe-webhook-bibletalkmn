fetch("https://time-for-god-by-bibletalkmn.ai.studio/api/paymentSuccess", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userEmail: session.customer_details.email })
});
