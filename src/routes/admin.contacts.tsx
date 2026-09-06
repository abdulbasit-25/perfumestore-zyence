import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Mail, MailOpen, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import type { ContactMessage } from "@/lib/contact-server";
import {
  deleteContactMessage,
  getContactMessages,
  updateContactMessageReadState,
} from "@/lib/contact-server";

export const Route = createFileRoute("/admin/contacts")({ component: AdminContacts });

function AdminContacts() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const {
    data: messages = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: () => getContactMessages({ data: {} }),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-contact-unread-count"] });
  };

  async function setRead(message: ContactMessage, isRead: boolean) {
    const result = await updateContactMessageReadState({
      data: { id: message.id, isRead },
    });
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(isRead ? "Message marked as read." : "Message marked as unread.");
    setSelected((current) => (current?.id === message.id ? { ...current, isRead } : current));
    refresh();
  }

  async function remove(message: ContactMessage) {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;
    const result = await deleteContactMessage({ data: { id: message.id } });
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success("Message deleted.");
    setSelected(null);
    refresh();
  }

  return (
    <AdminShell title="Messages">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="label-caps text-muted-foreground">Customer contact</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {messages.length} message{messages.length === 1 ? "" : "s"}, newest first
          </p>
        </div>
        <span className="label-caps text-olive">
          {messages.filter((message) => !message.isRead).length} unread
        </span>
      </div>

      {isPending ? <p className="py-12 text-muted-foreground">Loading messages...</p> : null}
      {isError ? (
        <p role="alert" className="py-12 text-destructive">
          Unable to load contact messages.
        </p>
      ) : null}
      {!isPending && !isError ? (
        <div className="overflow-x-auto border border-border bg-card">
          {messages.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Mail className="mx-auto h-7 w-7 text-muted-foreground" />
              <h2 className="mt-4 font-display text-2xl">No messages yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Customer inquiries will appear here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Received</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr
                    key={message.id}
                    className={`border-b border-border/70 last:border-0 ${message.isRead ? "" : "bg-olive-soft/25"}`}
                  >
                    <td className="px-4 py-4">
                      <p className={message.isRead ? "" : "font-semibold"}>{message.name}</p>
                      <p className="text-xs text-muted-foreground">{message.email}</p>
                    </td>
                    <td className="max-w-xs px-4 py-4">
                      <p className="truncate">
                        {message.subject || message.reason || "General inquiry"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{message.message}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                      {formatDate(message.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        {message.isRead ? (
                          <MailOpen className="h-3.5 w-3.5" />
                        ) : (
                          <Mail className="h-3.5 w-3.5 text-olive" />
                        )}
                        {message.isRead ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(message)}
                        className="label-caps text-olive hover:text-foreground"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}

      {selected ? (
        <ContactDrawer
          message={selected}
          onClose={() => setSelected(null)}
          onToggleRead={() => void setRead(selected, !selected.isRead)}
          onDelete={() => void remove(selected)}
        />
      ) : null}
    </AdminShell>
  );
}

function ContactDrawer({
  message,
  onClose,
  onToggleRead,
  onDelete,
}: {
  message: ContactMessage;
  onClose: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onClick={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-background p-6 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-olive">Contact message</p>
            <h2 className="mt-3 font-display text-4xl">
              {message.subject || message.reason || "General inquiry"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close message"
            title="Close message"
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="mt-10 grid gap-5 border-y border-border py-6 text-sm">
          <div>
            <dt className="label-caps text-muted-foreground">Name</dt>
            <dd className="mt-1">{message.name}</dd>
          </div>
          <div>
            <dt className="label-caps text-muted-foreground">Email</dt>
            <dd className="mt-1">
              <a className="link-underline" href={`mailto:${message.email}`}>
                {message.email}
              </a>
            </dd>
          </div>
          {message.phone ? (
            <div>
              <dt className="label-caps text-muted-foreground">Phone</dt>
              <dd className="mt-1">
                <a className="link-underline" href={`tel:${message.phone}`}>
                  {message.phone}
                </a>
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="label-caps text-muted-foreground">Received</dt>
            <dd className="mt-1">{formatDate(message.createdAt)}</dd>
          </div>
        </dl>

        <div className="py-7">
          <p className="label-caps text-muted-foreground">Message</p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7">{message.message}</p>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={onToggleRead}
            className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm hover:border-olive"
          >
            {message.isRead ? <Mail className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            Mark as {message.isRead ? "unread" : "read"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </aside>
    </div>
  );
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
