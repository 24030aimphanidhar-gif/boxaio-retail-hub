import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
export function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  useEffect(() => {
    if (user)
      setForm({ name: user.profile.name, email: user.email, phone: user.profile.phone || "" });
  }, [user]);
  if (!user)
    return (
      <div className="wrap empty-state">
        <User size={35} />
        <h1>Start a demo session</h1>
        <p>Choose a shopper or retailer demo to edit your profile.</p>
        <Link href="/login" className="solid-button">
          Choose a demo
        </Link>
      </div>
    );
  return (
    <div className="wrap profile-page">
      <div className="breadcrumb">
        <Link href="/dashboard">Your account</Link>
        <span>/</span>
        <span>Edit profile</span>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR DETAILS</span>
          <h1>Make yourself at home.</h1>
          <p>Keep your demo profile up to date.</p>
        </div>
      </div>
      <form
        className="form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          updateUser({ email: form.email, profile: { name: form.name.trim(), phone: form.phone } });
          toast.success("Profile saved");
        }}
      >
        <label>
          Full name
          <input
            required
            minLength={2}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Phone number
          <input
            type="tel"
            pattern="[0-9+ ()-]{10,18}"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <button className="solid-button">
          Save changes <CheckCircle2 size={16} />
        </button>
      </form>
    </div>
  );
}
