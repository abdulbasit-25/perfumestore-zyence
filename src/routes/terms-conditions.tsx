import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/storefront/legal-page";

export const Route = createFileRoute("/terms-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Sorrel" },
      {
        name: "description",
        content:
          "Review Sorrel's terms covering eligibility, ordering, payments, shipping, returns, and customer responsibilities.",
      },
    ],
  }),
  component: TermsAndConditions,
});

function TermsAndConditions() {
  return (
    <LegalPage
      label="Legal / Trust"
      title="Terms & Conditions"
      intro="These Terms & Conditions outline the basic rules for using our website and placing orders with us. Please review them before making a purchase. We recommend tailoring the placeholders below to your exact business model and the regions you serve."
      sections={[
        {
          heading: "Introduction",
          body: [
            "These terms apply to your use of the Sorrel website and to any purchases made through it. By accessing or using the website, you agree to be bound by these terms and any additional policies referenced within them, including our Privacy Policy and Cookie Policy.",
            "We may update these Terms & Conditions from time to time. Any changes become effective when posted on the site, and continued use of the website means you accept the updated terms.",
          ],
        },
        {
          heading: "Eligibility to Use the Website",
          body: [
            "You must be at least 18 years old, or have parental or guardian consent if local laws require it, to place an order or create an account. You agree to provide accurate and complete information when using the website.",
            "We reserve the right to refuse service, close accounts, or cancel orders where we believe the customer is misrepresenting information, using the site unlawfully, or engaging in fraudulent activity.",
          ],
        },
        {
          heading: "Account Responsibilities",
          body: [
            "If you create an account, you are responsible for keeping your login details secure and for all activity that occurs under your account. Please notify us immediately if you suspect unauthorized use of your account.",
            "You agree to provide accurate contact and shipping information so we can communicate with you and deliver your orders successfully.",
          ],
        },
        {
          heading: "Products and Product Information",
          body: [
            "We aim to provide accurate product descriptions, images, pricing, and availability information. However, product details may change over time, and the colors, materials, dimensions, and appearance of goods may vary slightly from the website due to screen settings or manufacturing differences.",
            "We reserve the right to correct errors, remove products, or update listings without notice. Product availability is subject to change and stock may be limited.",
          ],
        },
        {
          heading: "Pricing and Availability",
          body: [
            "Prices are shown in the currency displayed on the website and may be updated at any time without prior notice. Additional shipping, taxes, or other charges may apply depending on the destination and the order details.",
            "If an item is incorrectly priced or unavailable due to an error, we may cancel the order or contact you to confirm whether you would like to continue with a corrected price or alternative product.",
          ],
        },
        {
          heading: "Orders and Payment",
          body: [
            "By placing an order, you are making an offer to purchase the selected products subject to these terms. We may accept or reject an order at our discretion, especially where stock is unavailable, payment cannot be validated, or details appear incomplete or inaccurate.",
            "Payment must be completed in accordance with the method we provide at checkout. If payment is not authorized or completed successfully, we may cancel or delay your order pending confirmation.",
          ],
        },
        {
          heading: "Shipping and Delivery",
          body: [
            "Delivery times provided on the website are estimates and may vary due to shipping carrier schedules, local conditions, customs requirements, or other factors outside our control. We are not responsible for delays caused by carriers or circumstances beyond our reasonable control.",
            "You are responsible for ensuring the shipping address is accurate and that someone is available to receive the order where required. If a package is returned because of an incorrect address or failed delivery, additional shipping charges may apply.",
          ],
        },
        {
          heading: "Returns and Refunds",
          body: [
            "Our return and refund policies are set out in the relevant product or order information and may be updated over time. In general, we aim to treat returns fairly and to communicate clearly about the process, timelines, and eligibility criteria.",
            "If a product arrives damaged, incorrect, or does not match the description, please contact us promptly so we can review the issue and help resolve it.",
          ],
        },
        {
          heading: "Intellectual Property",
          body: [
            "All content on this website, including text, graphics, logos, product photography, layout, and branding, is owned by Sorrel or used under license. You may not reproduce, distribute, or use this content without our permission unless expressly allowed by law.",
            "Any trademarks, brand names, or product names appearing on the site remain the property of their respective owners.",
          ],
        },
        {
          heading: "Prohibited Use",
          body: [
            "You agree not to misuse the website, interfere with its operation, attempt unauthorized access, or use the site for unlawful, fraudulent, or harmful purposes. This includes submitting false information, disrupting service, or tampering with the platform or related systems.",
            "We reserve the right to suspend or restrict access to anyone who violates these terms or otherwise creates risk for the store, customers, or operations.",
          ],
        },
        {
          heading: "Limitation of Liability",
          body: [
            "To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages resulting from your use of the website or purchase of products.",
            "Our total liability for any claim arising from the website or a purchase shall not exceed the amount you paid for the relevant order, unless local law sets a different limit.",
          ],
        },
        {
          heading: "Third-Party Services and Links",
          body: [
            "Our website may include links to third-party platforms, shipping providers, or other services. These links are provided for convenience and do not mean we endorse or control the linked websites or their content.",
            "We are not responsible for the policies, practices, or operations of third-party websites or services.",
          ],
        },
        {
          heading: "Changes to the Website or Terms",
          body: [
            "We may change, suspend, or discontinue any part of the website or its services at any time without prior notice. We may also update these Terms & Conditions as needed to reflect operational or regulatory changes.",
            "Continued use of the website after changes are posted means you accept the updated terms.",
          ],
        },
        {
          heading: "Governing Law",
          body: [
            "These Terms & Conditions are governed by the laws of the jurisdiction in which the business operates, unless otherwise required by local law. If you are unsure which laws apply, please add the correct jurisdiction before publishing this page.",
            "If any provision is found to be unenforceable, the remaining provisions will continue in full force and effect.",
          ],
        },
        {
          heading: "Contact Information",
          body: [
            "For questions about these Terms & Conditions, orders, or website use, please contact us at [store email], [phone number], or [business address if applicable].",
            "We appreciate the opportunity to help and will respond as quickly as we can.",
          ],
        },
      ]}
      cta={{
        label: "Browse products",
        to: "/shop",
        description: "Need a quick refresher before checking out?",
      }}
    />
  );
}
