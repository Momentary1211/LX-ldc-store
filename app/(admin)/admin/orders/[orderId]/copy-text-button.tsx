"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyTextButton({
  text,
  label,
  ariaLabel,
  className,
  disabled,
}: {
  text: string;
  label: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (disabled) return;
    if (!text) return;
    try {
      // 为什么这样做：管理员经常需要“一次性复制全部卡密/信息”用于客服处理，提供显式按钮可减少逐条复制的时间成本。
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
      variant="outline"
      size="sm"
      className={cn("gap-2", className)}
      onClick={copy}
      disabled={disabled || !text}
      aria-label={ariaLabel}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      {label}
    </Button>
  );
}

