const { TamaraClientFactory } = require("tamara-sdk");

const config = {
  baseUrl: "https://api-sandbox.tamara.co",
  apiToken:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhY2NvdW50SWQiOiI0ZmUxNDU1MC1jZTUzLTRhNmYtYWIyMi05MDkxOThkNmUxNmEiLCJ0eXBlIjoibWVyY2hhbnQiLCJzYWx0IjoiODcxZjY3OGM0MjAwYzg4YWQxZTM0YTIxMTExN2IyYjYiLCJyb2xlcyI6WyJST0xFX01FUkNIQU5UIl0sImlhdCI6MTcxNzY1OTc3NCwiaXNzIjoiVGFtYXJhIn0.xDxkOqZsPt65OGuy0rDfrrjKL6hWLP2EL4ynnxQynK5lr6kMQn2dUlvLACIZc1Bx4wo5vlCcqn5L4h1zQWkFTZXDkVjaiuRh6lyLZmVkGi6KfCdZLjMmve6n3tQhuJT6c4BYcS_7Y1BS4HMCOPpwPu5ZiaYNlGYVmrhM2rdtIq9gd3yWD_8oAFO9qoF0CmdA48LNHVoAXutxR-kNlVk62MQfOD4rf2yxNuzvSj9xywiaXGrleoayEJxF9uw3ANYNVE1fGBjR_uL_dR5EJI6p16oa5NBdZtX29Tn05bx4dsjH_13xSq58hGVpEHIRjZF8NLcwSxvdBeK1zuu7DDU1CA",
  notificationPrivateKey: "55c8a029-b4fc-4bc0-9033-696e4aecc7b6",
};

exports.createTamaraPayment = async (req, res) => {
  const { shippingAddress, courseId } = req.body;

  try {
    const tamara = TamaraClientFactory.createApiClient(config);

    const course_id = courseId || 4;

    const customerData = {
      email: "customer@email.com",
      first_name: "Mona",
      last_name: "Lisa",
      phone_number: "566027755",
    };

    const items = [
      {
        name: "Summer camp",
        type: "camp",
        reference_id: "123",
        sku: "1",
        quantity: 1,
        total_amount: {
          amount: 100,
          currency: "AED",
        },
      },
    ];

    const shipping_amount = {
      amount: 0,
      currency: "AED",
    };

    const total_amount = {
      amount: 300,
      currency: "AED",
    };

    const shipping_address = {
      city: "Riyadh",
      country_code: "AE",
      first_name: "Mona",
      last_name: "Lisa",
      line1: "3764 Al Urubah Rd",
      line2: "string",
      phone_number: "532298658",
    };

    const merchant_url = {
      cancel: "http://awesome-qa-tools.s3-website.me-south-1.amazonaws.com/#/cancel",
      failure: "http://awesome-qa-tools.s3-website.me-south-1.amazonaws.com/#/fail",
      success: `http://localhost:4000/en/user/payment/confirm/${course_id}`,
      notification: "https://store-demo.com/payments/tamarapay",
    };

    const checkout = await tamara.createCheckout({
      totalAmount: total_amount,
      shippingAmount: shipping_amount,
      taxAmount: shipping_amount,
      referenceOrderId: "123",
      referenceId: "S1233",
      items: items,
      consumer: customerData,
      countryCode: "AE",
      description: "lorem ipsum dolor",
      paymentType: "PAY_BY_INSTALMENTS",
      instalments: 4,
      shippingAddress: shipping_address,
      merchantUrl: merchant_url,
    });

    console.log("checkout===============>", checkout);

    res.status(200).send({ status: true, data: checkout.data });
  } catch (err) {
    console.error("error:", err.message);
    res.status(400).send(`Error: ${err.message}`);
  }
};

exports.tamaraWebHook = async (req, res) => {
  try {
    console.log("req====>", req.body);
    const notificationService = TamaraClientFactory.createNotificationService(config);
    const payload = notificationService.processWebhook(req.body);

    console.log("payload===>", payload);

    const notificationType = payload.notificationType;
    const order = payload.order;

    console.log(`Received webhook notification: ${notificationType}`);
  } catch (err) {
    console.error("error:", err.message);
    res.status(400).send(`Error: ${err.message}`);
  }
};
