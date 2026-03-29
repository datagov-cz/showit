import { createResource, SchemaInterface } from "ldkit";
import { ldkit, rdf, schema, skos, dcterms } from "ldkit/namespaces";

import { $ } from "ldkit/sparql";
import { context } from "./context";
import { owl, rdfs, slovniky, zSgovPojem } from "./namespaces";
import { n } from "./utils";
import { HIDDEN_VOCABULARY } from "./vocabularies";

const RelationItemSchema = {
  "@type": skos.Concept,
  label: skos.prefLabel,
  vocabulary: {
    "@id": skos.inScheme,
    "@context": {
      "@type": skos.ConceptScheme,
      label: {
        "@id": skos.prefLabel,
        "@optional": true,
      },
    },
  },
} as const;

export const TermBaseSchema = {
  "@type": skos.Concept,
  label: skos.prefLabel,
  vocabulary: {
    "@id": skos.inScheme,
    "@context": {
      "@type": skos.ConceptScheme,
      label: {
        "@id": skos.prefLabel,
        "@optional": true,
      },
    },
  },
  definition: {
    "@id": skos.definition,
    "@optional": true,
  },
  description: {
    "@id": dcterms.description,
    "@optional": true,
  }
} as const;

const TermSchema = {
  ...TermBaseSchema,
  altLabels: {
    "@id": skos.altLabel,
    "@optional": true,
    "@array": true,
  },
  parentTerms: {
    "@id": skos.broader,
    "@optional": true,
    "@array": true,
    "@context": TermBaseSchema,
  },
  subTerms: {
    "@id": skos.narrower,
    "@optional": true,
    "@array": true,
    "@context": TermBaseSchema,
  },
} as const;

const TermSourcesSchema = {
  "@type": skos.Concept,
  source: {
    "@id": slovniky["definující-ustanovení"],
    "@array": true,
    "@optional": true,
  },
  altSource: {
    "@id": slovniky["související-ustanovení"],
    "@array": true,
    "@optional": true,
  },
  nonLegalSource: {
    "@id": slovniky["definující-nelegislativní-zdroj"],
    "@array": true,
    "@optional": true,
  },
  altNonLegalSource: {
    "@id": slovniky["související-nelegislativní-zdroj"],
    "@array": true,
    "@optional": true,
  },
} as const;

const TermRelationsSchema = {
  "@type": skos.Concept,
  domain: {
    "@id": rdfs.domain,
    "@array": true,
    "@optional": true,
    "@context": RelationItemSchema,
  },
  range: {
    "@id": rdfs.range,
    "@array": true,
    "@optional": true,
    "@context": RelationItemSchema,
  },
} as const;

const TermTypesSchema = {
  "@type": skos.Concept,
  allTypes: {
    "@id": rdf.type,
    "@array": true,
    "@optional": true,
  },
} as const;

export type TermRelationsInterface = SchemaInterface<
  typeof TermRelationsSchema
>;

export type TermSourceInterface = SchemaInterface<typeof TermSourcesSchema>;

export type TermInterface = SchemaInterface<typeof TermSchema>;

export type TermBaseInterface = SchemaInterface<typeof TermBaseSchema>;

export const Terms = createResource(TermSchema, context);
export const TermsTypes = createResource(TermTypesSchema, context);

export const TermsRelationsResource = createResource(
  TermRelationsSchema,
  context,
);

export const TermsSourcesResource = createResource(TermSourcesSchema, context);

export const getTermSourcesQuery = (termIri: string) => {
  const query = $`
  CONSTRUCT { 
    ?term a ${n(skos.Concept)} ; a ${n(ldkit.Resource)} .
    ?term ${n(slovniky["definující-ustanovení"])} ?source .
    ?term ${n(slovniky["související-ustanovení"])} ?altSource .
    ?term ${n(slovniky["definující-nelegislativní-zdroj"])} ?nonLegalSource .
    ?term ${n(
    slovniky["související-nelegislativní-zdroj"],
  )} ?altNonLegalSource .
  } WHERE {
    BIND(${n(termIri)} as ?term)
    OPTIONAL {?term ${n(slovniky["definující-ustanovení"])} ?source .}
    OPTIONAL {?term ${n(slovniky["související-ustanovení"])} ?altSource .}
    OPTIONAL {?term ${n(slovniky["definující-nelegislativní-zdroj"])} ?nlsBlank.
              ?nlsBlank ${n(schema.url)} ?nonLegalSource.
    }
    OPTIONAL {?term ${n(slovniky["související-nelegislativní-zdroj"])} ?anlsBlank.
              ?anlsBlank ${n(dcterms.title)} ?altNonLegalSource.
    }
  }
  `.toString();
  return query;
};

export const getTermRelationsQuery = (termIri: string) => {
  const query = $`
CONSTRUCT{ 
  ?term a ${n(skos.Concept)} ; a ${n(ldkit.Resource)} .
  ?term ${n(rdfs.domain)} ?domain .
  ?domain ${n(skos.inScheme)} ?vocabulary .
  ?domain a ${n(skos.Concept)}; ${n(skos.prefLabel)} ?label .
  ?term ${n(rdfs.range)} ?range .
  ?range ${n(skos.inScheme)} ?vocabulary2 .
  ?range a ${n(skos.Concept)}; ${n(skos.prefLabel)} ?label2 .
  ?vocabulary ${n(skos.prefLabel)} ?title .
  ?vocabulary2 ${n(skos.prefLabel)} ?title2 .
}
WHERE {
  BIND(${n(termIri)} as ?term)
  {
    ?domain ${n(rdfs.subClassOf)} ?domainRestriction . 
    ?domainRestriction ${n(owl.someValuesFrom)} ?term ; ${n(
    owl.onProperty,
  )} ${n(zSgovPojem["má-vztažený-prvek-1"])} .
    ?domain ${n(skos.prefLabel)} ?label .
    ?domain ${n(skos.inScheme)} ?vocabulary .
    ?vocabulary ${n(skos.prefLabel)} ?title .
  }
  UNION{
      ?domain ${n(rdfs.subClassOf)} ?domainRestriction . 
    ?domainRestriction ${n(owl.someValuesFrom)} ?term ; ${n(
    owl.onProperty,
  )} ${n(zSgovPojem["je-vlastností"])} .
    ?domain ${n(skos.prefLabel)} ?label .
    ?domain ${n(skos.inScheme)} ?vocabulary .
    ?vocabulary ${n(skos.prefLabel)} ?title .
  }
  UNION{
    ?domain ${n(rdfs.domain)} ?term .
    ?domain ${n(skos.prefLabel)} ?label .
    ?domain ${n(skos.inScheme)} ?vocabulary .
    ?vocabulary ${n(skos.prefLabel)} ?title .
  }
  UNION {
    ?range ${n(rdfs.range)} ?term .
    ?range ${n(skos.prefLabel)} ?label2 .
    ?range ${n(skos.inScheme)} ?vocabulary2 .
    ?vocabulary2 ${n(skos.prefLabel)} ?title2 .

  }
  UNION{
  ?domain ${n(zSgovPojem["má-vztažený-prvek-1"])} ?term .
  ?domain ${n(skos.prefLabel)} ?label .
  ?domain ${n(skos.inScheme)} ?vocabulary .
  ?vocabulary ${n(skos.prefLabel)} ?title .
  }
  UNION{
   ?range ${n(zSgovPojem["má-vztažený-prvek-2"])} ?term.
   ?range ${n(skos.prefLabel)} ?label2 .
   ?range ${n(skos.inScheme)} ?vocabulary2 .
   ?vocabulary2 ${n(skos.prefLabel)} ?title2 .

  }
  UNION {
    ?range ${n(rdfs.subClassOf)} ?rangeRestriction . 
    ?rangeRestriction ${n(owl.someValuesFrom)} ?term ; ${n(owl.onProperty)} ${n(
    zSgovPojem["má-vztažený-prvek-2"],
  )} .
    ?range ${n(skos.prefLabel)} ?label2 .
    ?range ${n(skos.inScheme)} ?vocabulary2 .
    ?vocabulary2 ${n(skos.prefLabel)} ?title2 .

  }
  FILTER (?vocabulary != ${n(HIDDEN_VOCABULARY)})
  FILTER (?vocabulary2 != ${n(HIDDEN_VOCABULARY)})
  
}
  `.toString();

  return query;
};

export const getPropertyRelationsQuery = (propertyIri: string) => {
  const query = $`
CONSTRUCT{ 
  ?term a ${n(skos.Concept)} ; a ${n(ldkit.Resource)} .
  ?term ${n(rdfs.domain)} ?domain .
  ?domain ${n(skos.inScheme)} ?vocabulary .
  ?domain a ${n(skos.Concept)}; ${n(skos.prefLabel)} ?label .
  ?term ${n(rdfs.range)} ?range .
  ?range ${n(skos.inScheme)} ?vocabulary2 .
  ?range a ${n(skos.Concept)}; ${n(skos.prefLabel)} ?label2 .
  ?vocabulary ${n(skos.prefLabel)} ?title .
  ?vocabulary2 ${n(skos.prefLabel)} ?title2 .
}
WHERE {
  BIND(${n(propertyIri)} as ?term)
  {
    ?term ${n(rdfs.subClassOf)} ?domainRestriction . 
    ?domainRestriction ${n(owl.someValuesFrom)} ?domain ; ${n(
    owl.onProperty,
  )} ${n(zSgovPojem["má-vztažený-prvek-1"])} .
    ?domain ${n(skos.prefLabel)} ?label .
    ?domain ${n(skos.inScheme)} ?vocabulary .
    ?vocabulary ${n(skos.prefLabel)} ?title .

  }
  UNION {
    ?term ${n(rdfs.subClassOf)} ?domainRestriction . 
    ?domainRestriction ${n(owl.allValuesFrom)} ?domain ; ${n(
    owl.onProperty,
  )} ${n(zSgovPojem["je-vlastností"])} .
    ?domain ${n(skos.prefLabel)} ?label .
    ?domain ${n(skos.inScheme)} ?vocabulary .
    ?vocabulary ${n(skos.prefLabel)} ?title .
  }
  UNION{
    ?term ${n(rdfs.domain)} ?domain .
    ?domain ${n(skos.prefLabel)} ?label .
    ?domain ${n(skos.inScheme)} ?vocabulary .
    ?vocabulary ${n(skos.prefLabel)} ?title .

  }
  UNION {
    ?term ${n(rdfs.range)} ?range .
    ?range ${n(skos.prefLabel)} ?label2 .
    ?range ${n(skos.inScheme)} ?vocabulary2 .
    ?vocabulary2 ${n(skos.prefLabel)} ?title2 .

  }
  UNION {
    ?term ${n(rdfs.subClassOf)} ?rangeRestriction . 
    ?rangeRestriction ${n(owl.someValuesFrom)} ?range ; ${n(
    owl.onProperty,
  )} ${n(zSgovPojem["má-vztažený-prvek-2"])} .
    ?range ${n(skos.prefLabel)} ?label2 .
    ?range ${n(skos.inScheme)} ?vocabulary2 .
    ?vocabulary2 ${n(skos.prefLabel)} ?title2 .

  }
  FILTER (?vocabulary != ${n(HIDDEN_VOCABULARY)})
  FILTER (?vocabulary2 != ${n(HIDDEN_VOCABULARY)})
}
  `.toString();

  return query;
};

export const getTermTypeQuery = (termIri: string) => {
  const query = $`
CONSTRUCT{ 
  ?term a ${n(skos.Concept)} ; a ${n(ldkit.Resource)} .
  ?term a ?allTypes .
}
WHERE {
   BIND(${n(termIri)} as ?term)
   ?term ${n(rdf.type)} ?allTypes .
   FILTER(!isBlank(?allTypes))
}
  `.toString();

  return query;
};
