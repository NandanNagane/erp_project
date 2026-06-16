export function DataGrid({ data, renderCard, emptyMessage = "No data found." }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
      {data.length > 0 ? (
        data.map((item, index) => renderCard(item, index))
      ) : (
        <div className="col-span-full text-center p-8 text-muted-foreground bg-white border rounded-md">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
