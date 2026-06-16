export function DataList({ data, renderItem, emptyMessage = "No data found." }) {
  return (
    <div className="flex flex-col gap-3 mt-4">
      {data.length > 0 ? (
        data.map((item, index) => renderItem(item, index))
      ) : (
        <div className="text-center p-8 text-muted-foreground bg-white border rounded-md">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
