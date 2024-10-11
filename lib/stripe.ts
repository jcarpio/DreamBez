import Stripe from "stripe"
import { env } from "@/env.mjs"
import { prisma } from "@/lib/db"  // Import database connection

// Create a Stripe instance
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
});

// Function to create a Stripe Checkout session for one-time payment
export async function createCheckoutSession(
  userId: string,
  emailAddress: string,
  priceId: string, // Now you pass a pre-defined Price ID
  quantity: number
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId, // Instead of using dynamic price_data, use a predefined Price ID
        quantity: 1,
      },
    ],
    mode: 'payment', // Ensure this is set to 'payment' for one-time purchases
    success_url: `${env.NEXT_PUBLIC_APP_URL}/payment-status?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: {
      userId,
      credits: quantity.toString(),
    },
    customer_email: emailAddress, // Pre-populate the customer's email
    billing_address_collection: 'required', // O 'auto' si quieres que Stripe decida si es necesaria
    phone_number_collection: {
      enabled: true, 
    },
    tax_id_collection: {
      enabled: true, // Enable VAT/Tax ID collection
    },
    allow_promotion_codes: true,
    invoice_creation: {
      enabled: true,
    },
    automatic_tax: true,
    custom_fields: [
        {
          key: 'id_number', // Clave personalizada para el campo
          label: {
            type: 'custom',
            custom: 'ID Number (Mandatory for companies)',
          },
          type: 'text',
        },
      ],
  });

  return session; // Return the full session object
}
/*
// Create some commonly used Stripe-related functions
export async function createCheckoutSession(
  amount: number,
  quantity: number,
  description: string,
  userId: string,
  emailAddress: string
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${quantity} Credits of DreamBez.Com`,
            description: description,
          },
          unit_amount: Math.round(amount * 100), // Ensure the amount is an integer
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${env.NEXT_PUBLIC_APP_URL}/payment-status?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: {
      userId,
      credits: quantity.toString(),
    },
    customer_email: emailAddress, // Pre-fill the customer's email address
  });

  return session; // Return the full session object
}
*/

export async function handleStripeWebhook(/* Parameters */) {
  // Implement logic to handle Stripe webhook
}

export async function handleSuccessfulPayment(sessionId: string) {
  const transaction = await prisma.stripeTransaction.findUnique({
    where: { stripeSessionId: sessionId },
  });

  if (transaction && transaction.status === 'completed') {
    return transaction; // Payment already processed
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (session.payment_status !== 'paid') {
    return null; // Payment not successful
  }

  const userId = session.metadata?.userId;
  const credits = parseInt(session.metadata?.credits || "0", 10);

  if (!userId || !credits) {
    throw new Error("Invalid metadata in session");
  }

  // Update transaction status
  const updatedTransaction = await prisma.stripeTransaction.update({
    where: { stripeSessionId: sessionId },
    data: { 
      status: "completed",
      stripePaymentIntentId: session.payment_intent as string || null
    },
  });

  // Update user credits
  await prisma.user.update({
    where: { id: userId },
    data: {
      credits: { increment: credits },
    },
  });

  // Record credit transaction
  await prisma.creditTransaction.create({
    data: {
      userId,
      amount: credits,
      type: "PURCHASE",
    },
  });

  return updatedTransaction;
}

// Function to create the Stripe session
export async function createCheckoutSessionForSubscription(
  priceId: string,
  userId: string,
  emailAddress: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // The Price ID must be passed here
          quantity: 1,
        },
      ],
      billing_address_collection: 'auto',
      customer_creation: 'if_required',
      subscription_data: {
        metadata: {
          userId,
        },
      },
      allow_promotion_codes: true,
      automatic_tax: {
        enabled: true,
      },
      mode: 'subscription',
      success_url: `${env.NEXT_PUBLIC_APP_URL}/payment-status?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
      customer_email: emailAddress, // Prepopulate the customer's email
    });

    return session;
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    throw new Error('Failed to generate user stripe session');
  }
}

// Function to handle successful subscription payments
export async function handleSuccessfulSubscriptionPayment(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Find the user in the database using the Stripe customer ID
  const user = await prisma.user.findUnique({
    where: {
      stripeCustomerId: customerId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get the plan from the payment session (use metadata if present)
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const planId = subscription.items.data[0].plan.id;
  
  // Logic to determine the number of credits according to the plan and the time interval
  let creditsToAdd = 0;

  switch (planId) {
    // Plan Starter
    case process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID:
      creditsToAdd = 9; // Annual credits for Starter
      break;
    case process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID:
      creditsToAdd = 141; // Annual credits for Starter
      break;

    // Plan Pro
    case process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID:
      creditsToAdd = 21; // Annual credits for Pro
      break;
    case process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID:
      creditsToAdd = 321; // Annual credits for Pro
      break;

    // Plan Business
    case process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID:
      creditsToAdd = 49; // Annual credits for Business
      break;
    case process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID:
      creditsToAdd = 735; // Annual credits for Business
      break;

    default:
      throw new Error("Invalid plan ID");
  }

  // Update user credits
  await prisma.user.update({
    where: { id: user.id },
    data: {
      credits: { increment: creditsToAdd }, // Add the credits corresponding to the user
    },
  });

  console.log(`✅ Successfully added ${creditsToAdd} credits to user ${user.id}`);
}
