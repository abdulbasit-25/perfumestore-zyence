import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/storefront/legal-page";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Sorrel" },
      {
        name: "description",
        content:
          "Learn what cookies we use on Sorrel, why we use them, and how you can manage your cookie preferences.",
      },
    ],
  }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <LegalPage
      label="Legal / Trust"
      title="Cookie Policy"
      intro="This Cookie Policy explains what cookies are, why we use them, and how you can manage your preferences while using our site. This language is written for clarity and should be adjusted to match your actual cookie setup, consent tools, and analytics providers."
      sections={[
        {
          heading: "What Are Cookies?",
          body: [
            "Cookies are small text files stored on your device when you visit a website. They help the site recognize your device, remember certain choices, and improve the way the site works for visitors over time.",
            "Some cookies are temporary and disappear when you close your browser, while others may remain for a longer period to remember preferences or improve performance.",
          ],
        },
        {
          heading: "Why the Website Uses Cookies",
          body: [
            "We use cookies to make the website easier to use, remember your preferences, support core shopping functions such as cart behavior, and understand how visitors interact with the site.",
            "Cookies also help us monitor website performance, identify common issues, and improve customer experience over time. Some cookies are necessary for the website to operate correctly, while others help us measure and improve engagement.",
          ],
        },
        {
          heading: "Essential Cookies",
          body: [
            "Essential cookies support key functions like secure browsing, page navigation, session continuity, and shopping activity. Without these cookies, some parts of the website may not work as expected.",
            "These cookies are usually set for a short period and are needed to maintain the functionality of the storefront.",
          ],
        },
        {
          heading: "Analytics Cookies",
          body: [
            "Analytics cookies help us understand how people use our website, which pages are most popular, and where visitors may have difficulty. This information is typically gathered in aggregate form and helps us improve our content and customer experience.",
            "Examples of analytics providers may include [analytics platform name], which should be replaced with the names of the tools you actually use.",
          ],
        },
        {
          heading: "Functional Cookies",
          body: [
            "Functional cookies remember preferences such as chosen language, display settings, or region. These cookies help us deliver a more consistent experience when you return to the website.",
            "If you have an account or save settings, these cookies may also help maintain those preferences across visits.",
          ],
        },
        {
          heading: "Marketing and Advertising Cookies",
          body: [
            "Marketing or advertising cookies may be used to support campaign measurement, interest-based advertising, or to understand whether a promotional message led to a purchase or other action.",
            "If you do not use marketing cookies, you can still browse the site and make purchases. If your store does not run paid advertising or remarketing, this section can be shortened or removed.",
          ],
        },
        {
          heading: "Third-Party Cookies",
          body: [
            "Some cookies are set by third parties that provide services such as analytics, payments, customer support, advertising, or embedded media. These third parties may use cookies to better understand user behavior or deliver their own service.",
            "We do not always control these cookies directly, so we recommend reviewing the privacy and cookie policies of any third-party services you interact with.",
          ],
        },
        {
          heading: "How to Manage or Disable Cookies",
          body: [
            "Most browsers allow you to manage or disable cookies through their settings. You can usually delete cookies, block new cookies, or receive alerts before a cookie is saved. The exact steps vary by browser and device.",
            "Please note that disabling certain cookies may affect the functionality of the website, including your ability to shop, navigate pages, or keep certain preferences.",
          ],
        },
        {
          heading: "Updates to This Cookie Policy",
          body: [
            "We may update this Cookie Policy from time to time to reflect changes in how we use cookies or the tools we rely on. Any updates will be posted on this page with a revised effective date.",
            "We encourage you to review this policy regularly so you understand how and why cookies are used.",
          ],
        },
        {
          heading: "Contact Information",
          body: [
            "If you have questions about our Cookie Policy or need help managing cookie settings, please contact us at [store email], [phone number], or [business address, if applicable].",
            "We are happy to provide more information about the cookies used on our website.",
          ],
        },
      ]}
      cta={{
        label: "Continue shopping",
        to: "/shop",
        description: "Need to revisit the store after reading this?",
      }}
    />
  );
}
