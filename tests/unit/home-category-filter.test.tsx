import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import {
  FilterableProductItem,
  HomeCategoryFilter,
  type CategoryTabItem,
} from "@/components/store/home-category-filter";

describe("HomeCategoryFilter", () => {
  it("should filter items by selected category (pure client filter)", () => {
    const categories: CategoryTabItem[] = [
      { id: "c1", name: "分类 1", slug: "c1" },
      { id: "c2", name: "分类 2", slug: "c2" },
    ];

    render(
      <HomeCategoryFilter categories={categories}>
        <FilterableProductItem categoryId="c1">
          <div>商品 A</div>
        </FilterableProductItem>
        <FilterableProductItem categoryId="c2">
          <div>商品 B</div>
        </FilterableProductItem>
      </HomeCategoryFilter>
    );

    expect(screen.getByText("商品 A")).toBeInTheDocument();
    expect(screen.getByText("商品 B")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "分类 1" }));
    expect(screen.getByText("商品 A")).toBeInTheDocument();
    expect(screen.queryByText("商品 B")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "全部商品" }));
    expect(screen.getByText("商品 A")).toBeInTheDocument();
    expect(screen.getByText("商品 B")).toBeInTheDocument();
  });

  it("should hide uncategorized items when a category is selected", () => {
    const categories: CategoryTabItem[] = [
      { id: "c1", name: "分类 1", slug: "c1" },
    ];

    render(
      <HomeCategoryFilter categories={categories}>
        <FilterableProductItem categoryId={null}>
          <div>未分类</div>
        </FilterableProductItem>
        <FilterableProductItem categoryId="c1">
          <div>分类内</div>
        </FilterableProductItem>
      </HomeCategoryFilter>
    );

    expect(screen.getByText("未分类")).toBeInTheDocument();
    expect(screen.getByText("分类内")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "分类 1" }));
    expect(screen.queryByText("未分类")).toBeNull();
    expect(screen.getByText("分类内")).toBeInTheDocument();
  });
});

