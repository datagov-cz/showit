import React from "react";
import { Box } from "@mui/material";
import { useRelations, useSources, useTerm } from "../../api/TermAPI";
import NoResults from "../search/NoResults";
import TermHeader from "./TermHeader";
import TermDefinition from "./TermDefinition";
import { Hierarchy } from "./Hierarchy";
import Loader from "../Loader";
import ErrorPage from "../ErrorPage";
import Relations from "./Relations";
import useRouteQuery from "../../hooks/useRouteQuery";
import { generateTermBase } from "../../utils/Utils";

const TermPage: React.FC = () => {
  const routeQuery = useRouteQuery();
  const termIRI = routeQuery.get("iri") ?? "";

  const { data, isLoading, isSuccess, isError } = useTerm(
    generateTermBase(termIRI),
  );

  const {
    data: sourceData,
    isLoading: sourceIsLoading,
    isSuccess: sourceIsSuccess,
    isError: sourceIsError,
  } = useSources(generateTermBase(termIRI));
  //This hook is here to show the page when the relations are loaded
  const {
    isSuccess: rIsSuccess,
    isLoading: rIsLoading,
    isError: rIsError,
  } = useRelations(data ?? undefined);
  if (isLoading || rIsLoading || sourceIsLoading) return <Loader />;

  if (isError || rIsError || sourceIsError || !data) return <ErrorPage />;

  if (rIsSuccess || isSuccess || sourceIsSuccess) {
    return (
      <Box>
        <TermHeader term={data} />
        <TermDefinition term={data} sources={sourceData ?? undefined} />
        <Hierarchy term={data} />
        {/**Relations component checks if the term is empty, because it is the last one**/}
        <Relations term={data} />
      </Box>
    );
  }

  return <NoResults />;
};
export default TermPage;
