import React from "react";
import { ReactComponent as DefinitionIllustration } from "../../assets/definition.svg";
import { Box } from "@mui/material";
import DefinitionWrapper from "../detail_common/DefinitionWrapper";
import { TermInterface } from "../../api/data/terms";

interface DefinitionProps {
  term: TermInterface;
}

const TermDefinition: React.FC<DefinitionProps> = ({ term }) => {
  if (!term.definition && !term.source) return null;

  const illustration = (
    <Box style={{ position: "relative", height: "100%" }}>
      <Box left={-72} bottom={-102} style={{ position: "absolute" }}>
        <DefinitionIllustration style={{ maxHeight: 260 }} />
      </Box>
    </Box>
  );

  return (
    <DefinitionWrapper
      illustration={illustration}
      definition={term.definition}
      source={
        term.source ||
        term.altSource ||
        term.nonLegalSource ||
        term.altNonLegalSource
      }
    />
  );
};

export default TermDefinition;
