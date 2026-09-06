import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/storefront/legal-page";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Sorrel" },
      {
        name: "description",
        content:
          "Learn how Sorrel handles customer information, cookies, payments, account details, and customer rights.",
      },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <LegalPage
      label="Legal / Trust"
      title="Privacy Policy"
      intro="This Privacy Policy explains how we collect, use, and protect information when you browse our website, place an order, or contact us. Please keep in mind that the exact details in this page should be tailored to your business, contact details, and tools before launch."
      sections={[
        {
          heading: "Information We Collect",
          body: [
            "We may collect information you provide directly when you place an order, create an account, subscribe to updates, contact customer support, or participate in promotions. This can include your name, email address, shipping and billing details, phone number, order history, and preferences.",
            "We may also collect information automatically when you visit our website, such as browser type, device information, pages visited, search terms, referring websites, IP address, and usage patterns. This helps us understand how customers use the site and improve the experience.",
            "Where required by your operations, placeholders like [customer support email], [shipping provider], and [analytics tool name] should be added here to reflect the actual services you use.",
          ],
        },
        {
          heading: "How We Use Information",
          body: [
            "We use information to process and fulfill orders, manage customer accounts, communicate delivery updates, respond to support requests, and improve our products, services, and website experience.",
            "We may also use information to send practical updates about order status, account activity, product information, and service-related announcements. If you subscribe to marketing communications, we will only send those messages in accordance with your preference settings and applicable rules.",
            "We may also use information to detect and prevent fraud, maintain the security of our website, and comply with legal obligations.",
          ],
        },
        {
          heading: "Cookies and Tracking Technologies",
          body: [
            "We use cookies and similar tracking technologies to keep the website functioning, understand customer behavior, remember preferences, and improve performance. Cookies may be temporary session cookies or longer-lasting cookies stored on your device.",
            "Essential cookies help us run the storefront securely and support required functionality such as shopping cart information, page navigation, and site stability. Analytics cookies help us measure traffic, understand which pages are popular, and evaluate product performance.",
            "Functional cookies remember preferences such as language, region, or display settings. Marketing cookies may be used to support promotional campaigns, remarketing, or ad measurement when relevant to your store operations. You can typically manage cookie preferences through your browser settings or our cookie banner when available.",
          ],
        },
        {
          heading: "Payment Information",
          body: [
            "If you pay online, payment details are processed through a secure third-party payment provider. We do not usually store full card details on our own servers unless the service you use specifically requires it and you have consented to that handling.",
            "We may keep limited billing information such as transaction reference numbers, payment status, and order totals for accounting, fraud prevention, and customer support purposes.",
          ],
        },
        {
          heading: "Order Information",
          body: [
            "Order information includes details such as items purchased, shipping address, delivery instructions, order totals, and communication history. We use this information to fulfill orders, provide customer support, and maintain records for transaction and service purposes.",
            "This information may also be shared with shipping partners, payment processors, and other service providers necessary to complete the order and delivery process.",
          ],
        },
        {
          heading: "Account Information",
          body: [
            "If you create an account, we may store your email address, password information, order history, and preferences. We use this information to allow you to access your account, track orders, and manage your settings.",
            "You are responsible for keeping your account credentials secure. If you believe your account has been compromised, please contact us immediately at [contact email].",
          ],
        },
        {
          heading: "Third-Party Services",
          body: [
            "We may use third-party services to power our storefront, process payments, manage shipping, analyze website traffic, send emails, and improve customer service. These providers may process or access information as part of their service. They are expected to use that information only for the purpose described by their own service agreement.",
            "We encourage you to review the privacy policies of any third-party platforms that you use through our website.",
          ],
        },
        {
          heading: "Data Security",
          body: [
            "We take reasonable steps to protect personal information from unauthorized access, loss, misuse, or disclosure. These measures may include secure hosting, access controls, encrypted communication, and regular review of internal procedures.",
            "However, no website or online service can guarantee complete security. If you believe your information has been compromised, please contact us right away so we can investigate and assist where possible.",
          ],
        },
        {
          heading: "Data Retention",
          body: [
            "We retain personal information only for as long as necessary to provide services, fulfill legal or business obligations, resolve disputes, and maintain accurate records. Different categories of data may have different retention periods depending on the purpose for which they were collected.",
            "When information is no longer needed, we will securely delete or anonymize it in accordance with our internal policies and applicable requirements.",
          ],
        },
        {
          heading: "Customer Rights",
          body: [
            "Depending on your location and applicable law, you may have rights regarding your personal information. These can include the right to access, correct, delete, or restrict the use of your data, as well as the right to object to certain processing activities or request a copy of your data.",
            "To exercise these rights, please contact us at [contact email] with a clear description of the request. We may ask you to verify your identity before we process a request.",
          ],
        },
        {
          heading: "Children's Privacy",
          body: [
            "Our website and services are not intended for children under the age of 13, or the age required by applicable local law, without parental consent or oversight. We do not knowingly collect personal information from children for marketing or other purposes.",
            "If you believe we have inadvertently collected information from a child, please contact us immediately and we will take appropriate steps to remove it.",
          ],
        },
        {
          heading: "Policy Updates",
          body: [
            "We may update this Privacy Policy from time to time to reflect changes in our practices, services, products, technology, or legal requirements. Any revisions will be posted on this page with a revised effective date.",
            "We encourage you to review this page periodically so you remain informed about how we handle your information.",
          ],
        },
        {
          heading: "Contact Information",
          body: [
            "If you have questions, concerns, or requests related to this Privacy Policy or the handling of your personal information, please contact us at [store email], [phone number], or [physical address if applicable].",
            "We will do our best to respond in a timely and helpful way.",
          ],
        },
      ]}
      cta={{ label: "Shop now", to: "/shop", description: "Ready to browse with confidence?" }}
    />
  );
}
