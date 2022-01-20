import React from "react";
import useURLVocabulary from "../../hooks/useURLVocabulary";
import { useVocabulary, useVocabularyTerms } from "../../api/VocabularyAPI";
import Loader from "../Loader";
import { Box } from "@mui/material";
import NoResults from "../search/NoResults";
import VocabularyHeader from "./VocabularyHeader";
import VocabularyDefinition from "./VocabularyDefinition";
import VocabularyTerms from "./VocabularyTerms";
import ErrorPage from "../ErrorPage";

const VocabularyPage: React.FC = () => {
  const uri = useURLVocabulary();
  const { data, isLoading, isSuccess, isError } = useVocabulary(uri);
  const {
    isSuccess: vIsSuccess,
    isLoading: vIsLoading,
    isError: vIsError,
  } = useVocabularyTerms(uri);

  if (isLoading || vIsLoading) return <Loader />;

  if (isError || !data || vIsError) return <ErrorPage />;

  if (vIsSuccess && isSuccess) {
    return (
      <Box mb={2}>
        <VocabularyHeader vocabulary={data} />
        <VocabularyDefinition description={data.description} />
        <VocabularyTerms vocabularyIri={data.$id} />
      </Box>
    );
  }
  return <NoResults />;
};

export default VocabularyPage;
