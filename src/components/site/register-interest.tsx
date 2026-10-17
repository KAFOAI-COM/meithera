"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button, Input, Label, Select } from "@/components/ui";

/** Register-interest form. Demonstration only — nothing is sent or stored. */
export function RegisterInterest() {
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-mint p-6 text-emerald">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
        <div>
          <p className="font-sans font-semibold">Thank you — interest recorded (demonstration).</p>
          <p className="mt-1 text-sm">In this demo nothing has been sent or stored. A live version would only contact you with your consent.</p>
        </div>
      </div>
    );
  return (
    <form
      className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="ri-name">First name</Label>
        <Input id="ri-name" required maxLength={40} placeholder="e.g. Aoife" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ri-role">I am a…</Label>
        <Select id="ri-role" defaultValue="investor">
          <option value="investor">Prospective investor</option>
          <option value="partner">Authorised financial services provider</option>
          <option value="property">Property / housing partner</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <Button type="submit" size="lg">Register interest</Button>
      <p className="text-xs text-muted sm:col-span-3">Demonstration form. Please do not enter an email address or any personal information.</p>
    </form>
  );
}
