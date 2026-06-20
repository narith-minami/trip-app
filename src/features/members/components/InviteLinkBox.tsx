/**
 * src/features/members/components/InviteLinkBox.tsx
 *
 * Shows the trip invite link with a copy-to-clipboard button.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface InviteLinkBoxProps {
  inviteToken: string;
}

function buildInviteUrl(token: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/invite/${token}`;
  }
  return `/invite/${token}`;
}

export function InviteLinkBox({ inviteToken }: InviteLinkBoxProps) {
  const [copied, setCopied] = useState(false);
  const url = buildInviteUrl(inviteToken);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">Invite link</p>
      <div className="flex gap-2">
        <Input readOnly value={url} className="flex-1 bg-gray-50 text-sm" />
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Anyone with this link can request to join the trip.
      </p>
    </div>
  );
}
