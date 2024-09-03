import AxiosClient from "@/lib/api/axios-client";
import useSWR from "swr";

const useQuestion = () => {
  const { data, isLoading } = useSWR("/items/question?fields=*,options.*");
  const {
    data: answer,
    isLoading: isLoadingAnswer,
    mutate: mutateAnswer,
  } = useSWR("/items/answer?filter[user_created][_eq]=$CURRENT_USER");
  const questions = data?.data || [];
  const listAnswer = answer?.data || [];

  const getNextQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
    if (listAnswer.find((item) => item.question === question.id)) return getNextQuestion();
    return randomIndex;
  };
  const createAnswer = (id, payload) => {
    AxiosClient.post("/items/answer", payload);
    mutateAnswer(
      (oldData) => {
        const newData = [...oldData.data, payload];
        return { data: newData };
      },
      { revalidate: false },
    );
  };

  return {
    questions: questions,
    isLoading: isLoading || isLoadingAnswer,
    createAnswer,
    getNextQuestion,
  };
};

export default useQuestion;
