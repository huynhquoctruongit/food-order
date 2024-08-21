export const ItemTable = ({ children, className }) => {
  return (
    <div className={className + " text-left border-r border-gray-300 last:border-none"}>
      <div className="py-1.5 px-2 md:py-3 md:px-5 h-full flex items-center">{children}</div>
    </div>
  );
};
const optionss = [
  { title: "Sen", value: "dongchi", className: "w-4/12" },
  { title: "Món", value: "mon", className: "w-4/12" },
  { title: "Ghi chú", value: "ghi-chu", className: "w-3/12" },
  { title: "Thời gian", value: "date-luc", className: "w-2/12" },
  { title: "Tổng", value: "tong", className: "w-2/12" },
];
const TablePink = ({ headers = optionss, list = [], render = (key, value) => {} }) => {
  return (
    <div className="w-full border border-gray-300 rounded-md">
      <div className="flex items-center w-full">
        {headers.map((option, index) => {
          return (
            <ItemTable className={option.className + " font-bold text-gray-600"} key={index + "-option"}>
              {option.title}
            </ItemTable>
          );
        })}
      </div>
      <div>
        {list?.map((elm, index) => {
          return (
            <div key={index + "-elm"} className="flex items-stretch border-gray-300 border-t text-gray-500 text-md">
              {headers.map((option, index) => {
                return (
                  <ItemTable key={elm.id + "list-pink" + index} className={option.className}>
                    {render(option.value, elm)}
                  </ItemTable>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TablePink;
