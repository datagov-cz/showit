import React, { ReactElement } from "react";
import { Box, Container, Grid, Typography } from "@material-ui/core";
import IRI from "./IRI";

interface DetailPageHeaderProps {
  aboveLabel: ReactElement;
  label: string;
  belowLabel?: ReactElement;
  iri: string;
}

const DetailPageHeader: React.FC<DetailPageHeaderProps> = (props) => {
  return (
    <DetailHeaderWrapper>
      <Grid container>
        <Grid item md={11} sm={10} xs={9}>
          {props.aboveLabel}
          <Typography variant="h3" color="textSecondary">
            {props.label}
          </Typography>
          {props.belowLabel}
        </Grid>
        <Grid item md={1} sm={2} xs={3}>
          <IRI iri={props.iri} />
        </Grid>
      </Grid>
    </DetailHeaderWrapper>
  );
};

export const DetailHeaderWrapper: React.FC = (props) => {
  return (
    <Box bgcolor="primary.main" pb={1}>
      <Container>
        <Box px={5}>{props.children}</Box>
      </Container>
    </Box>
  );
};

export default DetailPageHeader;
