import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/storefront/legal-page";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Sorrel" },
      {
        name: "description",
        content:
          "Sorrel's comprehensive refund and return policy. Learn about refund eligibility, processing times, return procedures, and customer support.",
      },
    ],
  }),
  component: RefundPolicy,
});

function RefundPolicy() {
  return (
    <LegalPage
      label="Legal / Trust"
      title="Refund Policy"
      intro="At Sorrel, we want you to feel confident in every purchase. This Refund Policy outlines how refunds work, eligibility criteria, our process for handling returns, and your rights as a customer. If you have questions or need assistance, our support team is here to help."
      sections={[
        {
          heading: "Refund Policy Overview",
          body: [
            "Sorrel is committed to customer satisfaction. We understand that sometimes a product may not meet your expectations, or circumstances may require you to return an order.",
            "Eligible refunds are processed through the original payment method where applicable. Our refund process is straightforward: request a refund, provide required information, work with our support team, and receive your refund after approval.",
            "This policy applies to all orders placed through the Sorrel website. Some exclusions may apply; please review the sections below to understand which items are eligible and any conditions that may apply.",
          ],
        },
        {
          heading: "Eligibility for Refunds",
          body: [
            "To be eligible for a refund, you must have purchased from Sorrel within the last [X days] and meet the conditions outlined below.",
            "Refunds are available for items that have not been used or altered since purchase. The product must be in resalable condition, with original tags and packaging intact where applicable.",
            "Proof of purchase (order number or receipt) and customer contact information are required to process a refund request. If you received the wrong item, a defective item, or a damaged product, special conditions may apply (see the section below for more information).",
            "Orders paid via Cash on Delivery may be handled differently. Please contact support for specific details about your refund eligibility.",
          ],
        },
        {
          heading: "Non-Refundable Items",
          body: [
            "[Store owner note: Clearly define which product categories or types cannot be refunded. Examples might include: final sale items, custom or personalized products, severely damaged goods (if customer caused damage), or items purchased outside the return window.]",
            "Items marked as 'Final Sale' at the time of purchase are not eligible for refund.",
            "If a product has been worn, washed, altered, or significantly used, it may not qualify for a full refund. Minor wear or handling does not disqualify an item.",
            "If you are unsure whether a specific item is refundable, please contact us before making your purchase.",
          ],
        },
        {
          heading: "Damaged, Defective, or Incorrect Items",
          body: [
            "If you receive a product that is damaged, defective, or incorrect, we want to make it right. Please contact us as soon as possible — ideally within [X days] of receiving your order.",
            "When requesting a refund for a damaged or defective item, please provide: your order number, your contact information, a description of the issue, and photographs of the damage or defect if possible.",
            "If you received the wrong product entirely, or if an item is missing from your order, please contact support immediately with your order number and relevant details.",
            "Items damaged due to improper handling after delivery may require evaluation. Our support team will review your request and determine the appropriate resolution.",
            "Refunds for damaged, defective, or incorrect items are typically processed more quickly than standard returns, as these issues are the responsibility of Sorrel.",
          ],
        },
        {
          heading: "How to Request a Refund",
          body: [
            "Follow these steps to request a refund:",
            "Step 1: Contact our customer support team at [Support Email] or [Support Phone] with your order number and the reason for your refund request.",
            "Step 2: Provide your order number, proof of purchase, and any additional information we request, such as photos or a description of the issue.",
            "Step 3: Wait for our team to review your request. We typically respond within [X business days].",
            "Step 4: If we approve your refund, we will provide instructions for returning the item (if applicable) and confirm the refund amount.",
            "Step 5: Once we receive and inspect the returned item, your refund will be processed. See 'Refund Processing' below for timeline details.",
            "For damaged or defective items, you may not need to return the product. Our support team will advise you based on the situation.",
          ],
        },
        {
          heading: "Refund Processing",
          body: [
            "After your refund is approved and the returned item is received and inspected, the refund will be processed to the original payment method.",
            "Refunds are typically processed within [X–Y business days] after we confirm receipt of your return and complete our inspection.",
            "If you paid by cash on delivery, please note that refunds cannot be processed directly. Contact support for alternative arrangements.",
            "Depending on your bank or payment provider, it may take an additional [X–Y business days] for the refund to appear in your account after we've processed it.",
            "Refund amounts will include the product price. See 'Shipping Costs' below for details about how shipping is handled.",
          ],
        },
        {
          heading: "Shipping Costs",
          body: [
            "[Store owner note: Define your shipping refund policy clearly. Examples: Do you refund original shipping if the customer changed their mind? Do you refund original shipping for damaged items? Who pays for return shipping?]",
            "Original shipping costs are [refundable / non-refundable] when a customer initiates a standard return (except for damaged, defective, or incorrect items).",
            "For damaged, defective, or incorrect items: [Define your policy. Example: 'Original shipping is fully refunded, and we will provide a return shipping label at no cost.']",
            "Return shipping costs are the responsibility of [customer / Sorrel]. If we are providing a return label, you are not responsible for return shipping charges.",
            "If a refund is denied or partially approved, shipping costs will be handled according to the specific circumstances. Our support team will explain this at the time of decision.",
          ],
        },
        {
          heading: "Late or Missing Refunds",
          body: [
            "If you were notified that your refund was processed but have not received it, please check your bank account or payment provider first. Sometimes refunds can take longer to appear than expected.",
            "Contact us at [Support Email] or [Support Phone] if [X–Y business days] have passed since we confirmed the refund and it still has not appeared in your account.",
            "When contacting us about a missing refund, please provide: your order number, the date we notified you of the refund, and a screenshot of your bank or payment provider statement if possible.",
            "We will investigate with your payment provider if necessary and work to resolve the issue.",
          ],
        },
        {
          heading: "Exchanges",
          body: [
            "[Store owner note: Define whether exchanges are available. Example options: 'We offer exchanges for items in a different size or color within [X days] of purchase' or 'Exchanges are not available; customers must process a refund and place a new order.']",
            "If you would like to exchange an item for a different size, color, or product, contact our support team at [Support Email] or [Support Phone] to discuss your options.",
            "Exchanges may be available for items within [X days] of purchase and in eligible condition. Availability depends on stock and the specific item.",
            "Exchange requests are handled on a case-by-case basis. Our support team will inform you of costs, return procedures, and timelines.",
          ],
        },
        {
          heading: "Order Cancellations",
          body: [
            "If you would like to cancel an order, please contact us as soon as possible. Cancellation eligibility depends on the order status.",
            "Orders can typically be cancelled within [X hours] of placement if the order has not yet been prepared for shipment. Once an order has entered the fulfillment process, cancellation may not be possible, and you will need to request a refund instead.",
            "To cancel an order, contact [Support Email] or [Support Phone] with your order number. Our team will check the status and advise you.",
            "If your order has already shipped, you cannot cancel it. In this case, you may refuse delivery or follow our standard refund process after the item arrives.",
          ],
        },
        {
          heading: "Contact Information",
          body: [
            "If you have questions about this Refund Policy or need to request a refund, please reach out to us:",
            "Email: [Support Email]",
            "Phone: [Support Phone]",
            "Business Hours: [Business Hours]",
            "We are committed to resolving any issues fairly and promptly. Thank you for shopping with Sorrel.",
          ],
        },
      ]}
      cta={{ label: "Shop now", to: "/shop", description: "Ready to shop with confidence?" }}
    />
  );
}
