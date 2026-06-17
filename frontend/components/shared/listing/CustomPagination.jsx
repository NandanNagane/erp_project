import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CustomPagination({ pagination }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  };

  const changeLimit = (newLimit) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", String(newLimit));
    params.set("page", "1"); // reset to page 1
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex justify-between items-center p-3 mt-4 text-sm text-slate-600 bg-white border border-slate-200 rounded-md shadow-sm">
      <div>
        View{" "}
        <span className="font-medium text-black">
          {(pagination.page - 1) * pagination.limit + 1} -{" "}
          {Math.min(pagination.total, pagination.page * pagination.limit)}
        </span>{" "}
        of <span className="font-medium text-black">{pagination.total}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <Pagination>
          <PaginationContent>
            {pagination.page > 2 && (
              <PaginationItem>
                <PaginationPrevious href={goToPage(pagination.page - 1)} />
              </PaginationItem>
            )}
            {pagination.page > 1 && (
              <PaginationItem>
                <PaginationLink href={goToPage(pagination.page - 1)}>
                  {pagination.page - 1}
                </PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink href={goToPage(pagination.page)} isActive>
                {pagination.page}
              </PaginationLink>
            </PaginationItem>
            {pagination.page < pagination.totalPages && (
              <PaginationItem>
                <PaginationLink href={goToPage(pagination.page + 1)}>
                  {pagination.page + 1}
                </PaginationLink>
              </PaginationItem>
            )}
            {pagination.page < pagination.totalPages - 1 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href={goToPage(pagination.page + 1)} />
                </PaginationItem>
              </>
            )}
          </PaginationContent>
        </Pagination>
        <Field orientation="horizontal" className="w-fit">
          <Select
            defaultValue={10}
            onValueChange={(value) => changeLimit(Number(value))}
          >
            <SelectTrigger className="w-20" id="select-rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                {[10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

{
  /* <div className="flex justify-between items-center p-3 mt-4 text-sm text-slate-600 bg-white border border-slate-200 rounded-md shadow-sm">
  <div>
    View{" "}
    <span className="font-medium text-black">
      1 - {Math.min(10, pagination.total)}
    </span>{" "}
    of <span className="font-medium text-black">{pagination.total}</span>
  </div>
  <div className="flex items-center gap-1">
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8 text-slate-400"
      disabled
    >
      &lt;
    </Button>
    <Button
      variant="default"
      className="h-8 w-8 bg-blue-600 text-white px-0 hover:bg-blue-700"
    >
      1
    </Button>
    <span className="px-2 text-slate-400">...</span>
    <Button variant="outline" size="icon" className="h-8 w-8 text-slate-400">
      &gt;
    </Button>
    <div className="flex items-center ml-2 cursor-pointer border px-2 py-1 rounded">
      <span className="mr-2">10</span>
      <ChevronDown className="size-4" />
    </div>
  </div> 
</div>; */
}
