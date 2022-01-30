import React from "react";
import { Box, Container, styled, Typography } from "@mui/material";
import RouteLink from "./RouteLink";

const Wrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  flexGrow: 1,
  justifyContent: "center",
  alignItems: "center",
  marginTop: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
}));

const SuggestedWords: React.FC = () => {
  //Only for development purposes, need to discuss how to fetch this personalized data
  const words = ["Agenda", "Budova", "Vozidlo", "Závada"];

  return (
    <Container>
      <Wrapper>
        <Typography variant="h5" sx={{ mr: 3 }} color="textSecondary">
          Navrhovaná slova:
        </Typography>

        {words.map((word) => (
          <RouteLink
            key={word}
            to={`/hledat?label=${word}`}
            sx={{ mr: 3 }}
            color="textSecondary"
            variant="h5"
          >
            {word}
          </RouteLink>
        ))}
      </Wrapper>
    </Container>
  );
};

export default SuggestedWords;
