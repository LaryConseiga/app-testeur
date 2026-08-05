import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DiscoveryPaginationProps = {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  const delta = 1;
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  const pages: (number | "ellipsis")[] = [1];
  if (left > 2) pages.push("ellipsis");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("ellipsis");
  if (total > 1) pages.push(total);

  return pages;
}

export function DiscoveryPagination({
  currentPage,
  totalPages,
  buildHref,
}: DiscoveryPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <nav
      aria-label="Pagination des apps à tester"
      className="mx-auto flex w-full justify-center"
    >
      <ul className="flex items-center gap-0.5">
        <li>
          <Link
            href={buildHref(Math.max(1, currentPage - 1))}
            aria-label="Page précédente"
            aria-disabled={isFirst}
            tabIndex={isFirst ? -1 : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "gap-1 pl-1.5",
              isFirst && "pointer-events-none opacity-50"
            )}
          >
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:block">Précédent</span>
          </Link>
        </li>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <li
              key={`ellipsis-${i}`}
              className="flex size-8 items-center justify-center"
              aria-hidden
            >
              <MoreHorizontalIcon className="size-4" />
              <span className="sr-only">Plus de pages</span>
            </li>
          ) : (
            <li key={p}>
              <Link
                href={buildHref(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={cn(
                  buttonVariants({
                    variant: p === currentPage ? "outline" : "ghost",
                    size: "icon",
                  })
                )}
              >
                {p}
              </Link>
            </li>
          )
        )}

        <li>
          <Link
            href={buildHref(Math.min(totalPages, currentPage + 1))}
            aria-label="Page suivante"
            aria-disabled={isLast}
            tabIndex={isLast ? -1 : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "gap-1 pr-1.5",
              isLast && "pointer-events-none opacity-50"
            )}
          >
            <span className="hidden sm:block">Suivant</span>
            <ChevronRightIcon className="size-4" />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
