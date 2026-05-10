import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/shadcn/ui/pagination";
import { buildPageLinks } from "./paginationLinks";

interface UsersPaginationProps {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  setPage: (page: number) => void;
}

export function UsersPagination(props: UsersPaginationProps): React.JSX.Element {
  const { currentPage, totalPages, isLoading, isLoadingMore, setPage } = props;

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
      <div className="font-mono text-xs uppercase text-theme-muted">
        Page {currentPage} of {totalPages || 1}
      </div>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage(currentPage - 1)}
              className={currentPage <= 1 || isLoading || isLoadingMore ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {buildPageLinks({ currentPage, totalPages, setPage })}

          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(currentPage + 1)}
              className={currentPage >= totalPages || isLoading || isLoadingMore ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
