import React from "react";

export function WhoBadge({ text, title }: { text: string; title?: string }) {
  return (
    <span className="wayx-badge" data-wayx title={title}>
      {text}
    </span>
  );
}
