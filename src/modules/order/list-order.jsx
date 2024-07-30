import dayjs from "dayjs";

const enumFood = ["/food1.png", "/food2.png", "/food3.png", "/food4.png"];
const ItemTable = ({ children, className }) => {
  return (
    <div
      className={
        className + " text-left border-r border-gray-300 last:border-none"
      }
    >
      <div className="py-3 px-5 h-full flex items-center">{children}</div>
    </div>
  );
};
const options = [
  { title: "Đồng chí", value: "dongchi", className: "w-4/12" },
  { title: "Món", value: "mon", className: "w-3/12" },
  { title: "Ghi chú", value: "ghi-chu", className: "w-2/12" },
  { title: "Đặt lúc", value: "date-luc", className: "w-4/12" },
  { title: "Tổng", value: "tong", className: "w-2/12" },
];
const ListOrder = ({ groupedData }) => {
  return (
    <div className="w-full border border-gray-300 rounded-md">
      <div className="flex items-center w-full">
        {options.map((option, index) => {
          return (
            <ItemTable
              className={option.className + " font-bold text-gray-600"}
              key={index + "-option"}
            >
              {option.title}
            </ItemTable>
          );
        })}
      </div>
      <div>
        {groupedData?.map((elm, index) => {
          return (
            <div
              key={index + "-elm"}
              className="flex items-stretch border-gray-300 border-t text-gray-500 text-md"
            >
              <ItemTable className={options[0].className}>
                <div className="flex items-center gap-2">
                  <img
                    src={enumFood[index % enumFood.length]}
                    alt=""
                    className="w-10 h-10 rounded-md border-2 border-white"
                  />
                  <span>{elm.user.fullname}</span>
                </div>
              </ItemTable>
              <ItemTable
                className={options[1].className + " flex flex-col gap-2"}
              >
                {elm.items.map((el) => {
                  return <div key={el.name + "name"}>{el.name}</div>;
                })}
              </ItemTable>
              <ItemTable className={options[2].className}>
                {elm.items.reduce(
                  (total, item) => total + parseInt(item.price),
                  0
                )}
                .000 vnd
              </ItemTable>
              <ItemTable className={options[3].className}>
                {elm.items.map((el) => {
                  return <div  key={el.note + "note"}>{el.note}</div>;
                })}
              </ItemTable>
              <ItemTable className={options[4].className}>
                {elm.items.reduce(
                  (total, item) => total + parseInt(item.price),
                  0
                )}
                .000 vnd
              </ItemTable>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListOrder;
