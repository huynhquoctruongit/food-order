const enumFood = ["/food1.png", "/food2.png", "/food3.png", "/food4.png"];
const ListFood = ({ listFood, onSelectFood }) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-10 relative">
      <img
        className="absolute z-0 top-0 right-10 w-64 opacity-70"
        src="/bg-opacity.png"
      />
      <div className="w-full md:w-1/5 ">
        <img src="/book.png" alt="" />
      </div>
      <div className="w-full md:w-4/5 flex flex-wrap gap-5 relative z-10">
        {listFood?.map((elm, index) => {
          const text = elm.split(".")[1];
          return (
            <div
              key={index + "-elm"}
              onClick={() => onSelectFood(elm)}
              className="rounded-lg border border-gray-300 w-[calc((100%-40px)/2)] md:w-[calc((100%-60px)/3)] flex items-center gap-2 hover:border-pastel-pink hover:shadow-button-small duration-200 cursor-pointer"
            >
              <div className="h-[100px] aspect-square bg-[#FFCFC8]/20 flex items-center justify-center">
                <img className="" src={enumFood[index % 4]} alt="" />
              </div>
              <div className="flex-1 text-left text-sm p-2 text-gray-700">
                {text || elm}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListFood;
