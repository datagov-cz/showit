import React from "react";
import { Typography} from "@material-ui/core";
import { useSearch } from "../api/WordsAPI";
import useRouteQuery from "../hooks/useRouteQuery";
import _ from "lodash";

const Search: React.FC = () => {
  const routeQuery = useRouteQuery();
  const wordLabel = routeQuery.get("label");
  const { data = [], isSuccess, isLoading, isError } = useSearch(wordLabel ?? undefined);

  let view;

  // Just to show something, not a final version at all
  if (isLoading)
    return <Typography variant="h1">Loading...</Typography>;

  if(isError)
    return <Typography variant="h1">Error occurred</Typography>;

  if (isSuccess) {
    const item = _.find(data, { label: wordLabel ?? "" });
    if (item === undefined) {
      // All results are gonna be here (Search miss)
      view = <Typography variant="body1">We couldn't find exact meaning for "{wordLabel}"</Typography>;
    } else if (item.isWord) {
      //List of all possible meanings is gonna be here (Search hit)
      view = <Typography variant="body1">Found multiple meanings for {item.label}</Typography>;
    } else {
      //Redirect to Term Detail is gonna happen here  (Search direct hit)
      view = <Typography variant="body1">Found exactly one meaning for {item.label}</Typography>;
    }
  }




  return (
    <>
      <Typography variant="h1">Search results - WIP</Typography>
      {view}
    </>
  );
};

export default Search;
