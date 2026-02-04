import Icon from "@/components/Icon";

type TablePaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

const TablePagination = ({
    page,
    totalPages,
    onPageChange,
    hasNextPage,
    hasPrevPage
}: TablePaginationProps) => (
    <div className="flex justify-between items-center mt-6 md:mt-5">
        <button
            className={`btn-stroke btn-small ${!hasPrevPage ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrevPage}
        >
            <Icon name="arrow-prev" />
            <span>Prev</span>
        </button>
        <div className="text-sm font-bold">Page {page} of {totalPages || 1}</div>
        <button
            className={`btn-stroke btn-small ${!hasNextPage ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
        >
            <span>Next</span>
            <Icon name="arrow-next" />
        </button>
    </div>
);

export default TablePagination;
