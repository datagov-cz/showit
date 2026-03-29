import { createResource, SchemaInterface } from "ldkit";
import { dcterms, skos, ldkit } from "ldkit/namespaces";
import { $ } from "ldkit/sparql";

import { context } from "./context";
import { n } from "./utils";
import { TermBaseSchema } from "./terms";

export const HIDDEN_VOCABULARY = "https://slovník.gov.cz/základní";
const VocabularyTermSchema = {
  "@type": TermBaseSchema["@type"],
  label: TermBaseSchema.label,
} as const;

const VocabularySchema = {
  "@type": skos.ConceptScheme,
  label: {
    "@id": skos.prefLabel,
  },
  description: {
    "@id": dcterms.description,
    "@optional": true,
  },
} as const;

export type VocabularyInterface = SchemaInterface<typeof VocabularySchema>;

export const Vocabularies = createResource(VocabularySchema, context);

export type VocabularyTermInterface = SchemaInterface<
  typeof VocabularyTermSchema
>;

export const VocabularyTerms = createResource(VocabularyTermSchema, context);

export const getVocabularyTermsQuery = (vocabularyIri: string) => {
  const query = $`
  CONSTRUCT {
    ?iri a ${n(skos.Concept)} , ${n(ldkit.Resource)} ;
      ${n(skos.prefLabel)} ?label ;
      ${n(skos.definition)} ?definition .
  }
  WHERE {
    ?iri a ${n(skos.Concept)} ;
      ${n(skos.inScheme)} ${n(vocabularyIri)} ;
      ${n(skos.prefLabel)} ?label .
    OPTIONAL { ?iri ${n(skos.definition)} ?defi . }
    OPTIONAL { ?iri ${n(dcterms.description)} ?desc . }
    BIND(COALESCE(?defi, ?desc) as ?definition)
  }
  `.toString();

  return query;
};
