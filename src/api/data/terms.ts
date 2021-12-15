import { createResource, SchemaInterface } from "@ldkit/core";
import {dcterms, ldkit, rdf, skos} from "@ldkit/namespaces";

import { context } from "./context";
import {owl, popisDat, rdfs, zSgovPojem} from "./namespaces";
import { $ } from "@ldkit/sparql";
import { namedNode as n } from "@ldkit/rdf";
//TODO: Relations issue: Maybe modify the vocabulary prop
const RelationItemSchema = {
  "@type": skos.Concept,
  label: skos.prefLabel,
  vocabulary: popisDat["je-pojmem-ze-slovníku"],
} as const;

export const TermBaseSchema = {
  "@type": skos.Concept,
  label: skos.prefLabel,
  vocabulary: {
    "@id": popisDat["je-pojmem-ze-slovníku"],
    "@context": {
      "@type": popisDat["slovník"],
      label: {
        "@id": dcterms.title,
        "@optional": true,
      },
    },
  },
  definition: {
    "@id": skos.definition,
    "@optional": true,
  },
} as const;

const TermSchema = {
  ...TermBaseSchema,
  altLabels: {
    "@id": skos.altLabel,
    "@optional": true,
    "@array": true,
  },
  source: {
    "@id": dcterms.source,
    "@optional": true,
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
  }
} as const;



const TermTypesSchema = {
  "@type": skos.Concept,
  allTypes:{
    "@id": rdf.type,
    "@array": true,
    "@optional": true,
  }
} as const;

export type TermRelationsInterface = SchemaInterface<typeof TermRelationsSchema>;

export type TermInterface = SchemaInterface<typeof TermSchema>;

export type TermBaseInterface = SchemaInterface<typeof TermBaseSchema>;

export const Terms = createResource(TermSchema, context);
export const TermsTypes = createResource(TermTypesSchema, context);

export const TermsRelationsResource = createResource(TermRelationsSchema, context);

export const getTermRelationsQuery = (termIri: string) => {
  const query = $`
CONSTRUCT{ 
  ?term a ${n(skos.Concept)} ; a ${n(ldkit.Resource)} .
  ?term ${n(rdfs.domain)} ?domain .
  ?domain ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary .
  ?domain a ${n(skos.Concept)}; ${n(skos.prefLabel)} ?label .
  ?term ${n(rdfs.range)} ?range .
  ?range ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary2 .
  ?range a ${n(skos.Concept)}; ${n(skos.prefLabel)} ?label2 .
}
WHERE {
  BIND(${n(termIri)} as ?term)
  {
    ?domain ${n(rdfs.subClassOf)} ?domainRestriction . 
    ?domainRestriction ${n(owl.someValuesFrom)} ?term ; ${n(owl.onProperty)} ${n(zSgovPojem["má-vztažený-prvek-1"])} .
    ?domain ${n(skos.prefLabel)} ?label .
    ?domain ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary .
  }
  UNION{
    ?domain ${n(rdfs.domain)} ?term .
    ?domain ${n(skos.prefLabel)} ?label .
    ?domain ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary .
  }
  UNION {
    ?range ${n(rdfs.range)} ?term .
    ?range ${n(skos.prefLabel)} ?label2 .
    ?range ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary2 .
  }
  UNION{
  ?domain ${n(zSgovPojem["má-vztažený-prvek-1"])} ?term .
  ?domain ${n(skos.prefLabel)} ?label .
  ?domain ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary .
  }
  UNION{
   ?range ${n(zSgovPojem["má-vztažený-prvek-2"])} ?term.
   ?range ${n(skos.prefLabel)} ?label2 .
   ?range ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary2 .
  }
  UNION {
    ?range ${n(rdfs.subClassOf)} ?rangeRestriction . 
    ?rangeRestriction ${n(owl.someValuesFrom)} ?term ; ${n(owl.onProperty)} ${n(zSgovPojem["má-vztažený-prvek-2"])} .
    ?range ${n(skos.prefLabel)} ?label2 .
    ?range ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary2 .
  }
  
}
  `.toString();

  return query;
};

export const getPropertyRelationsQuery = (propertyIri: string) => {
  const query = $`
CONSTRUCT{ 
  ?domain a ${n(skos.Concept)} ; a ${n(ldkit.Resource)} .
  ?domain ${n(rdfs.domain)} ?term .
  ?term a ${n(skos.Concept)}; ${n(skos.prefLabel)} ?label .
  ?term ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary .
  ?range ${n(rdfs.range)} ?term2 .
  ?term2 a ${n(skos.Concept)}; ${n(skos.prefLabel)} ?label2 .
  ?term2 ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary2 .
}
WHERE {
  BIND(${n(propertyIri)} as ?domain)
  BIND(${n(propertyIri)} as ?range)
  {
    ?domain ${n(rdfs.subClassOf)} ?domainRestriction . 
    ?domainRestriction ${n(owl.someValuesFrom)} ?term ; ${n(owl.onProperty)} ${n(zSgovPojem["má-vztažený-prvek-1"])} .
    ?term ${n(skos.prefLabel)} ?label .
    ?term ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary .
  }
  UNION{
    ?domain ${n(rdfs.domain)} ?term .
    ?term ${n(skos.prefLabel)} ?label .
    ?term ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary .
  }
  UNION {
    ?range ${n(rdfs.range)} ?term2 .
    ?term2 ${n(skos.prefLabel)} ?label2 .
    ?term2 ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary2 .
  }
  UNION {
    ?range ${n(rdfs.subClassOf)} ?rangeRestriction . 
    ?rangeRestriction ${n(owl.someValuesFrom)} ?term2 ; ${n(owl.onProperty)} ${n(zSgovPojem["má-vztažený-prvek-2"])} .
    ?term2 ${n(skos.prefLabel)} ?label2 .
    ?term2 ${n(popisDat["je-pojmem-ze-slovníku"])} ?vocabulary2 .
  }
}
  `.toString();

  return query;
}

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
}
