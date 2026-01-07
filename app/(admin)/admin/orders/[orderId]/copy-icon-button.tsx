"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyIconButton({
  text,
  ariaLabel,
  className,
}: {
  text: string | null | undefined;
  ariaLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const disabled = !text;

  const copy = async () => {
    if (!text) return;
    try {
      // 为什么这样做：管理员查看详情时高频需要复制订单号/卡密等信息，使用 clipboard 可减少手动选择带来的误操作。
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("已复制");
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("copy failed", error);
      toast.error("复制失败");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("shrink-0", className)}
      onClick={copy}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
