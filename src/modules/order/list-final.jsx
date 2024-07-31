import { ItemTable } from "./list-order";
import groupBy from "lodash/groupBy";
const options = [
  { title: "Món", value: "mon", className: "w-5/12" },
  { title: "Món", value: "mon", className: "w-3/12" },
  { title: "Lưu ý", value: "note", className: "w-4/12" },
];

const NumberOval = ({ children }) => {
  return (
    <div className="w-6 h-6 rounded-full border border-dashed border-gray-500 text-xs flex items-center justify-center">
      {children}
    </div>
  );
};

const Item = ({ number, title }) => {
  return (
    <div className="flex gap-2">
      <NumberOval>{number}</NumberOval>
      {title}
    </div>
  );
};
// enumFood;
const ListFinal = ({ order }) => {
  const groupedData = groupBy(order, "name");
  const getClass = (index) => {
    return options[index].className;
  };
  return (
    <div className="w-full border border-gray-300 rounded-md mt-10">
      <div className="flex items-center justify-center">
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
      <div className="">
        {Object.keys(groupedData).map((key, index) => {
          const items = groupedData[key];
          const group = groupBy(items, "price");
          console.log(group);
          return (
            <div className="flex items-stretch border-gray-300 border-t text-gray-500 text-md">
              <ItemTable className={getClass(0) + " gap-2"}>
                <div className="flex gap-2">
                  <NumberOval>{items.length}</NumberOval>
                  {key}
                </div>
              </ItemTable>
              <ItemTable className={getClass(1) + " gap-2 "}>
                <div className="flex flex-col gap-2">
                  {Object.keys(group).map((keyx, index) => {
                    const item = group[keyx];
                    return (
                      <Item
                        key={index + key}
                        number={item.length}
                        title={keyx === "25" ? "Không cơm" : "Có cơm"}
                      />
                    );
                  })}
                </div>
              </ItemTable>
              <ItemTable className={getClass(2) + " gap-2 "}>
                <div className="flex flex-col gap-2">
                  {items.map((item, index) => {
                    if (!item.note) return null;
                    return <div key={index + key}>{item.note}</div>;
                  })}
                </div>
              </ItemTable>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListFinal;
