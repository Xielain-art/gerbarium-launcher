import { PaginationEllipsis, PaginationItem, PaginationLink } from "@/components/shadcn/ui/pagination";

interface PageLinksProps {
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
}

export function buildPageLinks({
  currentPage,
  totalPages,
  setPage,
}: PageLinksProps): React.JSX.Element[] {
  const links: React.JSX.Element[] = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    links.push(
      <PaginationItem key="1">
        <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
      </PaginationItem>,
    );
    if (startPage > 2) {
      links.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }
  }

  for (let i = startPage; i <= endPage; i += 1) {
    links.push(
      <PaginationItem key={i}>
        <PaginationLink
          isActive={i === currentPage}
          onClick={() => setPage(i)}
        >
          {i}
        </PaginationLink>
      </PaginationItem>,
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      links.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }
    links.push(
      <PaginationItem key={totalPages}>
        <PaginationLink onClick={() => setPage(totalPages)}>
          {totalPages}
        </PaginationLink>
      </PaginationItem>,
    );
  }

  return links;
}
