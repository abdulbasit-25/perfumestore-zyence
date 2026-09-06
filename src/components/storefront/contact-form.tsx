import { useState } from "react";
import { createContactMessage } from "@/lib/contact-server";

const MESSAGE_MAX = 600;
const inputClasses =
  "w-full border-0 border-b border-border bg-transparent py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-olive transition-colors disabled:opacity-50";

type Status = "idle" | "submitting" | "sent" | "error";
type FieldName = "name" | "email" | "phone" | "subject" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

function validate(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const phone = String(data.get("phone") ?? "").trim();
  const subject = String(data.get("subject") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();

  if (name.length < 2) errors.name = "Enter your name.";
  if (!email) errors.email = "Enter your email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (phone && !/^[+\d][\d\s().-]{6,29}$/.test(phone)) {
    errors.phone = "Enter a valid phone number.";
  }
  if (subject.length > 160) errors.subject = "Keep the subject under 160 characters.";
  if (!message) errors.message = "Tell us a little about your inquiry.";
  else if (message.length > MESSAGE_MAX)
    errors.message = `Keep it under ${MESSAGE_MAX} characters.`;

  return errors;
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [messageLength, setMessageLength] = useState(0);

  function clearError(field: FieldName) {
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    if (data.get("company")) {
      setStatus("sent");
      return;
    }

    const nextErrors = validate(data);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0] as FieldName | undefined;
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const result = await createContactMessage({
        data: {
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          subject: String(data.get("subject") ?? ""),
          message: String(data.get("message") ?? ""),
        },
      });
      if (!result.success) {
        setStatus("error");
        setErrors({ message: result.message ?? "Unable to send your message right now." });
        return;
      }
      form.reset();
      setMessageLength(0);
      setErrors({});
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrors({ message: "Unable to send your message right now. Please try again." });
    }
  }

  if (status === "sent") {
    return (
      <div className="flex min-h-[320px] flex-col justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-olive-soft text-olive">
          <span aria-hidden="true" className="text-2xl">
            ✓
          </span>
        </div>
        <p className="label-caps mt-6 text-olive">Message sent</p>
        <h2 className="font-display mt-4 text-4xl text-foreground">Thank you.</h2>
        <p className="mt-4 max-w-md text-muted-foreground">
          We&apos;ve got your note and will be in touch within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p aria-live="polite" className="sr-only">
        {status === "submitting" ? "Sending your message." : ""}
      </p>
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <fieldset disabled={status === "submitting"} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Field label="Name" htmlFor="contact-name" required error={errors.name}>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jordan Ellis"
              className={inputClasses}
            />
          </Field>
          <Field label="Email" htmlFor="contact-email" required error={errors.email}>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="jordan@example.com"
              className={inputClasses}
            />
          </Field>
          <Field label="Phone" htmlFor="contact-phone" error={errors.phone}>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 555 0100"
              className={inputClasses}
            />
          </Field>
          <Field label="Subject" htmlFor="contact-subject" error={errors.subject}>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              maxLength={160}
              placeholder="How can we help?"
              className={inputClasses}
            />
          </Field>
        </div>

        <Field
          label="Message"
          htmlFor="contact-message"
          required
          error={errors.message}
          hint={`${messageLength}/${MESSAGE_MAX}`}
        >
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            maxLength={MESSAGE_MAX}
            onChange={(event) => {
              setMessageLength(event.target.value.length);
              clearError("message");
            }}
            placeholder="Tell us what's on your mind..."
            className={`${inputClasses} resize-none`}
          />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">We reply within one business day.</p>
          <button
            type="submit"
            className="label-caps inline-flex items-center gap-3 bg-primary px-7 py-4 text-primary-foreground transition-colors hover:bg-olive hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "submitting" ? "Sending..." : "Send message"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
  error,
  hint,
  required,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={htmlFor} className="label-caps text-muted-foreground">
          {label}
          {required ? (
            <span aria-hidden="true" className="text-olive">
              {" "}
              *
            </span>
          ) : null}
        </label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      <div className="mt-3">{children}</div>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
