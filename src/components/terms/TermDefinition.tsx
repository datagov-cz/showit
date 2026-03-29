import React from "react";
import { ReactComponent as DefinitionIllustration } from "../../assets/definition.svg";
import { Box } from "@mui/material";
import DefinitionWrapper from "../detail_common/DefinitionWrapper";
import { TermInterface, TermSourceInterface } from "../../api/data/terms";

interface DefinitionProps {
  term: TermInterface;
  sources?: TermSourceInterface[];
}

const TermDefinition: React.FC<DefinitionProps> = ({ term, sources }) => {
  if (!term.definition && !term.description) return null;

  let source = undefined;
  if (sources) {
    source = sources[0];
  }

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
      definition={term.definition || term.description}
      source={
        source?.source.join("; ") ||
        source?.altSource.join("; ") ||
        source?.nonLegalSource.join("; ") ||
        source?.altNonLegalSource.join("; ")
      }
    />
  );
};

export default TermDefinition;
