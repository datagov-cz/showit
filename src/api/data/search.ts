import { SchemaInterface, createResource } from "ldkit";
import { xsd, skos, dcterms, ldkit } from "ldkit/namespaces";
import { $ } from "ldkit/sparql";
import { lucene, luceneInstance } from "./namespaces";
import { n, l } from "./utils";
import { context } from "./context";
import { HIDDEN_VOCABULARY } from "./vocabularies";

const VocabularySchema = {
  "@type": skos.ConceptScheme,
  title: skos.prefLabel,
};

const SearchSchema = {
  "@type": skos.Concept,
  label: skos.prefLabel,
  definition: {
    "@id": skos.definition,
    "@optional": true,
  },
  vocabulary: {
    "@id": skos.inScheme,
    "@context": VocabularySchema,
  },
  snippetField: lucene.snippetField,
  snippetText: lucene.snippetText,
  score: {
    "@id": lucene.score,
    "@type": xsd.double,
  },
} as const;

const VocabularySearchSchema = {
  "@type": skos.ConceptScheme,
  label: {
    "@id": skos.prefLabel,
  },
  description: {
    "@id": dcterms.description,
    "@optional": true,
  },
  snippetField: lucene.snippetField,
  snippetText: lucene.snippetText,
  score: {
    "@id": lucene.score,
    "@type": xsd.double,
  },
} as const;

export type SearchInterface = SchemaInterface<typeof SearchSchema>;

export const SearchResource = createResource(SearchSchema, context);

export const VocabularySearchResource = createResource(
  VocabularySearchSchema,
  context
);

// Search query utils
const getWildcardString = (text: string) => {
  if (text.endsWith("*")) {
    return text;
  }
  const tokens = text.split(/\s+/);
  const lastToken = text.split(/\s+/).slice(-1);
  return `${tokens.join(" ")} ${lastToken}*`;
};

const getExactMatchString = (text: string) => {
  return `<em>${text.replaceAll(/\s+/g, "</em> <em>")}</em>`;
};

export const getSearchQuery = (text: string) => {
  // append asterisk for partial matching in Lucene index
  const wildcardString = getWildcardString(text);
  // wrap words with <em> tags for exact matching in Lucene index
  const exactMatchString = getExactMatchString(text);

  const query = $`
CONSTRUCT {
  ?entity a ${n(skos.Concept)} , ${n(ldkit.Resource)} ;
          ${n(skos.prefLabel)} ?label ;
          ${n(skos.definition)} ?definition ;
          ${n(skos.inScheme)} ?vocabulary ;
          ${n(lucene.snippetText)} ?snippetText ;
          ${n(lucene.snippetField)} ?snippetField ;
          ${n(lucene.score)} ?score .
  ?vocabulary ${n(skos.prefLabel)} ?vocabularyTitle .
} WHERE {
  SELECT DISTINCT ?entity ?label ?definition ?vocabulary ?vocabularyTitle ?snippetField ?snippetText ?score {
    { ?search a ${n(luceneInstance.label_index)} } 
    UNION 
    { ?search a ${n(luceneInstance.defcom_index)} }
    ?search ${n(lucene.query)} ${l(wildcardString)} ;
            ${n(lucene.snippetSize)} 100 ;
            ${n(lucene.entities)} ?entity . 
    GRAPH ?g {
      ?entity a ${n(skos.Concept)} ;
              ${n(skos.prefLabel)} ?label .
    }
    ?entity ${n(skos.inScheme)} ?vocabulary .
    ?vocabulary ${n(skos.prefLabel)} ?vocabularyTitle .
    OPTIONAL { ?entity ${n(skos.definition)} ?defi . }
    OPTIONAL { ?entity ${n(dcterms.description)} ?desc . }
    BIND(COALESCE(?defi, ?desc) AS ?description)
    ?entity ${n(lucene.score)} ?initScore ;
            ${n(lucene.snippets)} _:s .
    _:s ${n(lucene.snippetText)} ?snippetText ;
        ${n(lucene.snippetField)} ?snippetField .
    FILTER (lang(?label) = "cs")
    FILTER (?vocabulary != ${n(HIDDEN_VOCABULARY)})
    BIND(IF(lcase(str(?snippetText)) = lcase(str(${l(
      exactMatchString
    )})), ?initScore * 2, IF(CONTAINS(lcase(str(?snippetText)), ${l(
    text
  )}), IF(?snippetField = "label", ?initScore * 1.5, ?initScore), ?initScore)) as ?exactMatchScore)
    BIND(IF(?snippetField = "label", ?exactMatchScore * 2, IF(?snippetField = "definition", ?exactMatchScore * 1.2, ?exactMatchScore)) as ?score)
  }
  ORDER BY desc(?score)
  LIMIT 100
}
`.toString();
  return query;
};

/**
 * Very similar to getSearchQuery -> searches only for vocabularies
 * Main differences: different CONSTRUCT (diff namespaces, missing graph nodes),
 *                   vocabularies have different namespaces for labels and definitions, different snippet size
 * Since I need it to be complaint with the ldkit schema I had to have these two methods separated
 * If there is better solution, please let me know **/
export const getVocabularySearchQuery = (text: string) => {
  const wildcardString = getWildcardString(text);
  const exactMatchString = getExactMatchString(text);

  const query = $`
CONSTRUCT {
  ?entity a ${n(skos.ConceptScheme)} , ${n(ldkit.Resource)} ;
          ${n(skos.prefLabel)} ?label ;
          ${n(dcterms.description)} ?definition ;
          ${n(lucene.snippetText)} ?snippetText ;
          ${n(lucene.snippetField)} ?snippetField ;
          ${n(lucene.score)} ?score .
} WHERE {
  SELECT DISTINCT ?entity ?label ?definition ?snippetField ?snippetText ?score {
    { ?search a ${n(luceneInstance.label_index)} } 
    UNION 
    { ?search a ${n(luceneInstance.defcom_index)} }
    ?search ${n(lucene.query)} ${l(wildcardString)} ;
            ${n(lucene.snippetSize)} 2000 ;
            ${n(lucene.entities)} ?entity . 
    GRAPH ?g {
      ?entity a ${n(skos.ConceptScheme)} ;
              ${n(skos.prefLabel)} ?label .
    }
    OPTIONAL { ?entity ${n(dcterms.description)} ?definition . }
    ?entity ${n(lucene.score)} ?initScore ;
            ${n(lucene.snippets)} _:s .
    _:s ${n(lucene.snippetText)} ?snippetText ;
        ${n(lucene.snippetField)} ?snippetField .
    FILTER (lang(?label) = "cs")
    FILTER (?entity != ${n(HIDDEN_VOCABULARY)})
    BIND(IF(lcase(str(?snippetText)) = lcase(str(${l(
      exactMatchString
    )})), ?initScore * 2, IF(CONTAINS(lcase(str(?snippetText)), ${l(
    text
  )}), IF(?snippetField = "title", ?initScore * 1.5, ?initScore), ?initScore)) as ?exactMatchScore)
    BIND(IF(?snippetField = "title", ?exactMatchScore * 2, IF(?snippetField = "description", ?exactMatchScore * 1.2, ?exactMatchScore)) as ?score)
  }
  ORDER BY desc(?score)
  LIMIT 100
}
`.toString();

  return query;
};
