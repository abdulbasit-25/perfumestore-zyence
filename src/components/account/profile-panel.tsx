import { Camera, Mail, Phone, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SessionUser } from "@/lib/store";

type Profile = Pick<SessionUser, "name" | "email" | "phone" | "avatarUrl">;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProfilePanel({
  user,
  onSave,
}: {
  user: SessionUser;
  onSave: (profile: Profile) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), email: user.email, phone: phone.trim(), avatarUrl });
      setEditing(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update your profile");
    } finally {
      setSaving(false);
    }
  };

  const chooseAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => setAvatarUrl(String(reader.result)));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-none shadow-none">
        <div className="h-28 bg-olive-soft" />
        <CardContent className="relative px-6 pb-6 pt-0 sm:px-8">
          <Avatar className="-mt-12 h-24 w-24 border-4 border-card">
            <AvatarImage src={user.avatarUrl} alt="" />
            <AvatarFallback className="bg-primary text-xl text-primary-foreground">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-caps text-olive">Personal profile</p>
              <h2 className="mt-2 text-4xl">{user.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
              {user.phone && <p className="mt-1 text-sm text-muted-foreground">{user.phone}</p>}
            </div>
            <Button variant="outline" onClick={() => setEditing((value) => !value)}>
              <UserRound size={16} />
              {editing ? "Close editor" : "Edit profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {editing && (
        <Card className="rounded-none shadow-none">
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>
              Keep your contact details current for delivery updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
              <ProfileField
                label="Full name"
                value={name}
                onChange={setName}
                icon={<UserRound size={15} />}
              />
              <ProfileField
                label="Email"
                value={user.email}
                onChange={() => undefined}
                icon={<Mail size={15} />}
                readOnly
              />
              <ProfileField
                label="Phone"
                type="tel"
                value={phone}
                onChange={setPhone}
                icon={<Phone size={15} />}
              />
              <div className="flex items-end gap-3">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  onChange={chooseAvatar}
                  className="sr-only"
                />
                <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
                  <Camera size={16} />
                  Choose photo
                </Button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="text-xs text-muted-foreground underline underline-offset-4"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="flex justify-end sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <InfoTile
          label="Account type"
          value={
            user.role === "admin"
              ? "Administrator"
              : user.role === "manager"
                ? "Manager"
                : "Customer"
          }
        />
        <InfoTile label="Email status" value="Verified at sign in" />
        <InfoTile label="Profile photo" value={avatarUrl ? "Added" : "Initials avatar"} />
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  icon,
  type = "text",
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="label-caps text-muted-foreground">{label}</span>
      <span className="mt-2 flex items-center gap-2 border-b border-hairline py-2 focus-within:border-olive">
        <span className="text-muted-foreground">{icon}</span>
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none read-only:text-muted-foreground"
        />
      </span>
    </label>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-olive bg-surface px-4 py-4">
      <p className="label-caps text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm">{value}</p>
    </div>
  );
}
