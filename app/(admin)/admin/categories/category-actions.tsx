"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Eye, EyeOff, Trash2 } from "lucide-react";
import { toggleCategoryActive, deleteCategory } from "@/lib/actions/categories";
import { toast } from "sonner";
import { EditCategoryDialog, type AdminCategoryEditable } from "./edit-category-dialog";

interface CategoryActionsProps {
  category: AdminCategoryEditable;
  productCount: number;
}

export function CategoryActions({
  category,
  productCount,
}: CategoryActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggleActive = () => {
    startTransition(async () => {
      const result = await toggleCategoryActive(category.id);
      if (result.success) {
        toast.success(result.message);
        // 为什么这样做：状态切换会影响列表与前台展示，需要刷新以同步服务端渲染数据。
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = () => {
    if (productCount > 0) {
      toast.error(`该分类下有 ${productCount} 个商品，无法删除`);
      return;
    }

    if (!confirm("确定要删除此分类吗？")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.success) {
        toast.success(result.message);
        // 为什么这样做：删除后需要立刻从表格移除，避免误判。
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <EditCategoryDialog
        category={category}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)} disabled={isPending}>
            <Pencil className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleActive} disabled={isPending}>
            {category.isActive ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                隐藏
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                显示
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-rose-600 focus:text-rose-600"
            disabled={productCount > 0 || isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
