const ThirtyFour = () => {
  return (
    <div className="hidden absolute top-0 right-0 h-full w-[1100px] md:flex justify-end">
      {/* <img src="/bell.gif" className="w-32 aspect-square absolute left-1/2 top-10 translate-x-0" alt="" />
      <img src="/gifs.gif" className="w-40 aspect-square absolute left-1/2 bottom-10 translate-x-0" alt="" /> */}
      <img src="https://vnpt.com.vn/Media/Images/24042024/tinh-than-30-thang-4.png" alt="" />
      <img src="/VN.png" alt="" className="w-60 absolute bottom-0 translate-x-0 left-1/2 -ml-16 object-contain" />
      <div className=" absolute top-full right-0 mt-4 z-10 w-fit px-6 bg-red-50 py-3 rounded-md">
        <div className="text-primary-01 text-3xl font-bold">Chào mừng ngày giải phóng miền Nam</div>
      </div>
    </div>
  );
};

export default ThirtyFour;

const categories = [
  {
    type: "grammar",
    error_group: "Subject - Finite Verb",
    error_name: "Subject Missing",
    error_code: "subject-missing",
    description: "Mệnh đề chỉ có Finite Verb(s) mà không có Subject",
    ref_item: {
      type: "lesson",
      class: 234,
      item_id: "1",
    },
  },
  {
    type: "grammar",
    error_group: "Subject - Finite Verb",
    error_name: "Finite Verb Missing",
    error_code: "finite-verb-missing",
    description: "Mệnh đề chỉ có Subject mà không có Finite Verb",
    ref_item: {
      type: "lesson",
      class: 234,
      item_id: "1",
    },
  },
  {
    type: "grammar",
    error_group: "Subject - Finite Verb",
    error_name: "Wrong form of Subject",
    error_code: "wrong-form-of-subject",
    description: "Subject không phải là noun, gerund hoặc to-infinitive",
    ref_item: {
      type: "lesson",
      class: 234,
      item_id: "1",
    },
  },
  {
    type: "grammar",
    error_group: "Use of Verbs",
    error_name: "Object of Verb",
    error_code: "object-of-verb",
    description: "Object của transitive verb không phải là gerund hoặc noun clause",
    ref_item: {
      type: "lesson",
      class: 234,
      item_id: "1",
    },
  },
  {
    type: "grammar",
    error_group: "Use of Verbs",
    error_name: "Object missing",
    error_code: "object-missing",
    description: "Thiếu object sau transitive verb",
    ref_item: {
      type: "lesson",
      class: 234,
      item_id: "1",
    },
  },
  {
    type: "grammar",
    error_group: "Word Class",
    error_name: "Word Structure",
    error_code: "word-structure",
    description: "Cấu trúc của verb, noun, hoặc adjective không đúng",
    ref_item: {
      type: "lesson",
      class: 234,
      item_id: "1",
    },
  },
  {
    type: "grammar",
    error_group: "Word Class",
    error_name: "Singular/Plural",
    error_code: "singular-plural",
    description: "Nhằm lẫn giữa dạng singular và plural của noun và verb trong câu",
    ref_item: {
      type: "lesson",
      class: 234,
      item_id: "1",
    },
  },
  {
    type: "grammar",
    error_group: "Word Class",
    error_name: "Countable & Uncountable",
    error_code: "countable-uncountable",
    description: "Nhằm lẫn giữa danh từ đếm được và không đếm được",
    ref_item: {
      type: "lesson",
      class: 234,
      item_id: "1",
    },
  },
  {
    type: "grammar",
    error_group: "Word Class",
    error_name: "Word class",
    error_code: "word-class",
    description: "Nhằm lẫn giữa các word class, adjective/adverb/noun/verb",
    ref_item: {
      type: "lesson",
      class: 234,
      item_id: "1",
    },
  },
  {
    type: "grammar",
    error_group: "Word Class",
    error_name: "Adverb Placement",
    error_code: "adverb-placement",
    description: "Đặt adverb giữa transitive verb và object, hoặc lỗi vị trí adverb khác",
    ref_item: {
      type: "lesson",
      class: 234,
      item_id: "1",
    },
  },
  {
    type: "grammar",
    error_group: "Word Class",
    error_name: "Adj/Adv Comparison",
    error_code: "adj-adv-comparison",
    description: "Sử dụng sai form comparative và superlative của adjective hoặc adverb",
    ref_item: {
      type: "lesson",
      class: 234,
      item_id: "1",
    },
  },
  {
    type: "grammar",
    error_group: "Word Class",
    error_name: "Wrong preposition",
    error_code: "wrong-preposition",
    description: "Sử dụng preposition không phù hợp, cần thay thế bằng preposition khác",
  },
  {
    type: "grammar",
    error_group: "Word Class",
    error_name: "Object of Preposition",
    error_code: "object-of-preposition",
    description: "Không sử dụng đúng gerund hoặc cấu trúc: Preposition + Object + V-ing sau preposition",
    ref_item: {
      type: "lesson",
      class: 234,
      item_id: "1",
    },
  },
];
