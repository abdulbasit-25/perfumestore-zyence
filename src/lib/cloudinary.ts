import { createHash } from "node:crypto";

type CloudinaryUpload = {
  secure_url: string;
  public_id: string;
};

function cloudinaryConfig() {
  const cloudName = process.env["CLOUDINARY_CLOUD_NAME"];
  const apiKey = process.env["CLOUDINARY_API_KEY"];
  const apiSecret = process.env["CLOUDINARY_API_SECRET"];
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured");
  }
  return { cloudName, apiKey, apiSecret };
}

function signature(parameters: Record<string, string>, apiSecret: string) {
  const payload = Object.entries(parameters)
    .filter(([, value]) => value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export async function uploadProductImage(
  data: Buffer,
  productId: string,
  fileName: string,
): Promise<{ url: string; publicId: string }> {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = `sorrel/products/${productId}/${fileName.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const params = { public_id: publicId, timestamp };
  const body = new FormData();
  body.append("file", `data:application/octet-stream;base64,${data.toString("base64")}`);
  body.append("api_key", apiKey);
  body.append("public_id", publicId);
  body.append("timestamp", timestamp);
  body.append("signature", signature(params, apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  if (!response.ok) {
    console.error("Cloudinary upload failed", response.status, await response.text());
    throw new Error("Product image upload failed");
  }
  const result = (await response.json()) as CloudinaryUpload;
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteProductImage(publicId: string): Promise<void> {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp,
    api_key: apiKey,
    signature: signature({ public_id: publicId, timestamp }, apiSecret),
  });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    console.error("Cloudinary deletion failed", response.status, await response.text());
    throw new Error("Product image deletion failed");
  }
}
