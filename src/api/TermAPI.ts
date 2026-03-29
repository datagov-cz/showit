import { useQuery } from "react-query";

import { isProperty } from "../utils/TermUtils";
import {
  getPropertyRelationsQuery,
  getTermRelationsQuery,
  getTermSourcesQuery,
  getTermTypeQuery,
  TermBaseInterface,
  TermInterface,
  TermRelationsInterface,
  Terms,
  TermSourceInterface,
  TermsRelationsResource,
  TermsSourcesResource,
  TermsTypes,
} from "./data/terms";
import { HIDDEN_VOCABULARY } from "./data/vocabularies";

// This is a supertype of TermBaseInterface containing term id and vocabulary id
export type TermBase = Pick<TermBaseInterface, "$id"> & {
  vocabulary: Pick<TermBaseInterface["vocabulary"], "$id">;
};

export const getTerm = async (term: TermBase) => {
  //If user is trying to fetch term from hidden vocabulary, immediately return null -> no retries from React Query
  if (term.vocabulary.$id === HIDDEN_VOCABULARY) return null;

  const data = await Terms.findByIri(term.$id);
  if (!data) {
    // Term not found
    throw new Error("404 Term not found");
  }
  const types = await TermsTypes.query(getTermTypeQuery(term.$id));
  (data.$type as string[]) = types[0].$type;
  //Removes all mentions of terms coming from hidden vocabulary
  (data.parentTerms as TermBaseInterface[]) = data.parentTerms.filter(
    (term) => term.vocabulary.$id !== HIDDEN_VOCABULARY
  );
  (data.subTerms as TermBaseInterface[]) = data.subTerms.filter(
    (term) => term.vocabulary.$id !== HIDDEN_VOCABULARY
  );

  return data;
};

export const getRelations = async (
  term: TermInterface | undefined
): Promise<TermRelationsInterface[]> => {
  if (typeof term === "undefined") {
    return Promise.reject("Invalid term");
  }
  if (isProperty(term)) {
    return await TermsRelationsResource.query(
      getPropertyRelationsQuery(term.$id)
    );
  } else {
    return await TermsRelationsResource.query(getTermRelationsQuery(term.$id));
  }
};

export const getSources = async (
  term: TermBase | undefined
): Promise<TermSourceInterface[]> => {
  if (typeof term === "undefined") {
    return Promise.reject("Invalid term");
  }
  return await TermsSourcesResource.query(getTermSourcesQuery(term.$id));
};

export type RelationResult = ReturnType<typeof getRelations> extends Promise<
  (infer U)[]
>
  ? U
  : never;

export type RelationTermResult = RelationResult["range"] extends (infer U)[]
  ? U
  : never;

export const useTerm = (term: TermBase) => {
  return useQuery(["term", term.$id], () => getTerm(term), {
    enabled: !!term.$id,
    notifyOnChangeProps: ["data", "isError"],
  });
};

export const useRelations = (term: TermInterface | undefined) => {
  return useQuery(["relations", term?.$id], () => getRelations(term), {
    enabled: !!term,
    notifyOnChangeProps: ["data", "isError"],
  });
};

export const useSources = (term: TermBase | undefined) => {
  return useQuery(["sources", term?.$id], () => getSources(term), {
    enabled: !!term?.$id,
    notifyOnChangeProps: ["data", "isError"],
  });
};
