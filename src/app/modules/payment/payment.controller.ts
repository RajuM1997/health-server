import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../../shared/sendResponse";
import config from "../../../config";
import { stripe } from "../../../helpers/stripe";

const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret =
      "whsec_1e5acc410f4022bf84bc476053a5cc6c98586d515400600588f87b2845a26ce4";
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (error) {
      return res.status(400).send(`Webhook Error: ${error}`);
    }
    const result = await PaymentService.handleStripeWebhookEvent(event);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Payment send successfully",
      data: result,
    });
  }
);
export const PaymentController = {
  handleStripeWebhookEvent,
};
