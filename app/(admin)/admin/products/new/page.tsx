"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProduct } from "@/lib/actions/products";
import {
  getAdminCategories,
  type AdminCategoryOption,
} from "@/lib/actions/categories";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Package } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const [isPending, startTransition] = useTransition();
  const [categoryOptions, setCategoryOptions] = useState<AdminCategoryOption[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const router = useRouter();

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      categoryId: null,
      description: "",
      content: "",
      price: 0,
      originalPrice: undefined,
      coverImage: "",
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
      minQuantity: 1,
      maxQuantity: 10,
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const categories = await getAdminCategories();
        if (!isMounted) return;
        setCategoryOptions(categories);
      } catch (error) {
        console.error("加载分类失败:", error);
        toast.error("加载分类失败");
      } finally {
        if (!isMounted) return;
        setIsCategoryLoading(false);
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-generate slug from name
  const watchName = form.watch("name");
  const generateSlug = () => {
    const slug = watchName
      .toLowerCase()
      // 为什么这样做：后端校验仅允许 a-z0-9-，这里提前规范化，避免自动生成后又校验失败。
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    form.setValue("slug", slug || `product-${Date.now()}`);
  };

  const onSubmit = (values: ProductInput) => {
    startTransition(async () => {
      const result = await createProduct(values);

      if (result.success) {
        toast.success("商品创建成功");
        router.push("/admin/products");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            添加商品
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            创建新的商品信息
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 为什么这样布局：价格属于高频信息，放右侧更便于对照与修改；发布设置放底部用于“收口”，避免打断填写流程。 */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-5 w-5" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>商品名称 *</FormLabel>
                        <FormControl>
                          <Input placeholder="输入商品名称" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL 标识 *</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="product-url" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateSlug}
                          >
                            自动生成
                          </Button>
                        </div>
                        <FormDescription>
                          商品页面 URL: /product/{field.value || "xxx"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>商品分类</FormLabel>
                        <Select
                          value={field.value ?? "none"}
                          onValueChange={(value) =>
                            field.onChange(value === "none" ? null : value)
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="选择分类（可选）" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent align="start">
                            <SelectItem value="none">未分类</SelectItem>
                            <SelectSeparator />
                            {isCategoryLoading ? (
                              <SelectItem value="__loading__" disabled>
                                加载中...
                              </SelectItem>
                            ) : categoryOptions.length > 0 ? (
                              categoryOptions.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                  {!category.isActive ? "（已隐藏）" : ""}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="__empty__" disabled>
                                暂无分类
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          用于前台筛选与商品展示（可不选）
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>简短描述</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="商品简介，显示在列表页"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>详细描述 (Markdown)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="支持 Markdown 格式的详细商品介绍"
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">价格设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 为什么这样做：把提示文案从某一个 FormItem 内挪出来，避免某列多一行导致 grid 行高看起来不对齐。 */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>售价 *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step={1}
                              min={1}
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value, 10) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>原价（划线价）</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step={1}
                              min={1}
                              placeholder="0"
                              value={field.value || ""}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                field.onChange(isNaN(val) ? undefined : val);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="minQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>最小购买数量</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 1)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>最大购买数量</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 10)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormDescription>原价留空则不显示折扣</FormDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">商品图片</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>封面图片 URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          支持外部图片链接
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">发布设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="text-base">立即上架</FormLabel>
                          <FormDescription>
                            开启后商品将在前台显示
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="text-base">推荐商品</FormLabel>
                          <FormDescription>
                            在首页热门推荐区展示
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>排序权重</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>数字越小排序越靠前</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  "创建商品"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
