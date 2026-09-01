import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe requires the raw body for signature verification
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("✅ Payment success:", session);

      // Send data to your Google AI Studio app
      try {
        const response = await fetch(
          "https://time-for-god-by-bibletalkmn.ai.studio/api/paymentSuccess",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userEmail: session.customer_details?.email,
              sessionId: session.id,
              amountTotal: session.amount_total
            })
          }
        );

        const text = await response.text();
        console.log("AI Studio response:", text);
      } catch (err) {
        console.error("❌ AI Studio error:", err);
      }
    }

    res.json({ received: true });
  }
);

app.listen(3000, () => console.log("🚀 Webhook server running on port 3000"));
