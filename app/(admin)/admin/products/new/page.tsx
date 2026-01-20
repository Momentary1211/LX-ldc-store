"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createProduct, getProductTemplateById } from "@/lib/actions/products";
import {
  getAdminCategories,
  type AdminCategoryOption,
} from "@/lib/actions/categories";
import { type ProductInput } from "@/lib/validations/product";
import { ProductForm } from "@/components/admin/products/product-form";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function NewProductPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<AdminCategoryOption[]>([]);
  const [initialData, setInitialData] = useState<Partial<ProductInput>>({});
  const [templateInfo, setTemplateInfo] = useState<{ name: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);

      try {
        const [categoriesResult, templateResult] = await Promise.all([
          getAdminCategories(),
          templateId ? getProductTemplateById(templateId) : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        setCategories(categoriesResult);

        if (templateResult) {
          if (templateResult.success) {
            setInitialData(templateResult.data);
            setTemplateInfo({ name: templateResult.templateName });
          } else {
            toast.error(templateResult.message);
          }
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("加载数据失败:", error);
        toast.error("加载数据失败");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [templateId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <ProductForm
      initialData={initialData}
      categories={categories}
      onSubmit={createProduct}
      templateInfo={templateInfo}
    />
  );
}
