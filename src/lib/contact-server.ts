import { createServerFn } from "@tanstack/react-start";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requirePermission } from "@/lib/authorization-server";
import { ensureCollection, ensureIndex, getMongoDb } from "@/lib/mongodb";

const contactInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .regex(/^[+\d][\d\s().-]{6,29}$/, "Enter a valid phone number.")
    .or(z.literal(""))
    .optional()
    .default(""),
  subject: z.string().trim().max(160, "Subject is too long.").optional().default(""),
  reason: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(1, "Message is required.").max(600, "Message is too long."),
});

const contactIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid contact message.");

type ContactDocument = {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  subject: string;
  reason: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ContactMessage = Omit<ContactDocument, "_id"> & {
  id: string;
};

function serializeContact(document: ContactDocument): ContactMessage {
  return {
    id: String(document._id),
    name: document.name,
    email: document.email,
    phone: document.phone,
    subject: document.subject,
    reason: document.reason,
    message: document.message,
    isRead: document.isRead,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

async function prepareContactsCollection() {
  const db = await getMongoDb();
  await ensureCollection(db, "contactMessages");
  await ensureIndex(db, "contactMessages", { createdAt: -1 });
  await ensureIndex(db, "contactMessages", { isRead: 1, createdAt: -1 });
  return db.collection<ContactDocument>("contactMessages");
}

export const createContactMessage = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactInputSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const collection = await prepareContactsCollection();
      const now = new Date();
      const document: Omit<ContactDocument, "_id"> = {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone ?? "",
        subject: data.subject ?? "",
        reason: data.reason ?? "",
        message: data.message,
        isRead: false,
        createdAt: now,
        updatedAt: now,
      };
      const result = await collection.insertOne(document as ContactDocument);
      return { success: true, id: String(result.insertedId) };
    } catch (error) {
      console.error("Create contact message error:", error);
      return { success: false, message: "Unable to send your message right now." };
    }
  });

export const getContactMessages = createServerFn({ method: "GET" })
  .validator((data: { token?: string }) => data)
  .handler(async ({ data }): Promise<ContactMessage[]> => {
    await requirePermission(data.token, "manageContacts");
    const collection = await prepareContactsCollection();
    const documents = await collection.find({}).sort({ createdAt: -1, _id: -1 }).toArray();
    return documents.map(serializeContact);
  });

export const getContactUnreadCount = createServerFn({ method: "GET" })
  .validator((data: { token?: string }) => data)
  .handler(async ({ data }): Promise<number> => {
    await requirePermission(data.token, "manageContacts");
    const collection = await prepareContactsCollection();
    return collection.countDocuments({ isRead: false });
  });

export const updateContactMessageReadState = createServerFn({ method: "POST" })
  .validator((data: { token?: string; id: string; isRead: boolean }) => data)
  .handler(async ({ data }) => {
    const parsedId = contactIdSchema.safeParse(data.id);
    if (!parsedId.success) return { success: false, message: "Invalid contact message." };
    const { db } = await requirePermission(data.token, "manageContacts");
    const result = await db
      .collection<ContactDocument>("contactMessages")
      .updateOne(
        { _id: new ObjectId(data.id) },
        { $set: { isRead: data.isRead, updatedAt: new Date() } },
      );
    return result.matchedCount
      ? { success: true }
      : { success: false, message: "Message not found." };
  });

export const deleteContactMessage = createServerFn({ method: "POST" })
  .validator((data: { token?: string; id: string }) => data)
  .handler(async ({ data }) => {
    const parsedId = contactIdSchema.safeParse(data.id);
    if (!parsedId.success) return { success: false, message: "Invalid contact message." };
    const { db } = await requirePermission(data.token, "manageContacts");
    const result = await db.collection<ContactDocument>("contactMessages").deleteOne({
      _id: new ObjectId(data.id),
    });
    return result.deletedCount
      ? { success: true }
      : { success: false, message: "Message not found." };
  });
