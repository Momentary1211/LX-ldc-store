export const dynamic = "force-dynamic";

import { getAllCategoriesWithCount } from "@/lib/actions/categories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderTree, Eye, EyeOff } from "lucide-react";
import { CategoryActions } from "./category-actions";
import { CreateCategoryDialog } from "./create-category-dialog";

export default async function CategoriesPage() {
  const categories = await getAllCategoriesWithCount();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            分类管理
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            管理商品分类
          </p>
        </div>
        <CreateCategoryDialog />
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderTree className="h-5 w-5" />
            分类列表 ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>分类名称</TableHead>
                    <TableHead>URL 标识</TableHead>
                    <TableHead className="text-center">商品数量</TableHead>
                    <TableHead className="text-center">排序</TableHead>
                    <TableHead className="text-center">状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {category.icon && (
                            <span className="text-lg">{category.icon}</span>
                          )}
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-500">
                        {category.slug}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {category.productCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {category.sortOrder}
                      </TableCell>
                      <TableCell className="text-center">
                        {category.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <Eye className="mr-1 h-3 w-3" />
                            显示
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="mr-1 h-3 w-3" />
                            隐藏
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <CategoryActions
                          category={{
                            id: category.id,
                            name: category.name,
                            slug: category.slug,
                            description: category.description,
                            icon: category.icon,
                            sortOrder: category.sortOrder,
                            isActive: category.isActive,
                          }}
                          productCount={category.productCount}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <FolderTree className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-zinc-500">暂无分类</p>
              <CreateCategoryDialog>
                <Button className="mt-4">创建第一个分类</Button>
              </CreateCategoryDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
