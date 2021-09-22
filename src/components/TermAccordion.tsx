import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  Paper,
  Typography,
  withStyles,
} from "@material-ui/core";

import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import RouteLink from "./RouteLink";

import { ReactComponent as TallConnector } from "../assets/connector_taller.svg";

import { TermInfo } from "./Hierarchy";
import { useTerm } from "../api/TermAPI";
import { emptyTerm } from "./TermPage";



const Accordion = withStyles({
  root: {
    border: "1px solid rgba(0, 0, 0, .125)",
    boxShadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    borderBottom: "1px solid rgba(0, 0, 0, .125)",
    marginBottom: -1,
    minHeight: 56,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    "&$expanded": {
      margin: "12px 0",
    },
  },
  expanded: {},
}))(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails);

const ExpandIcon = withStyles((theme) => ({
  root: {
    color: theme.palette.text.secondary,
  },
}))(ExpandMoreIcon);

const CurrentTermBox = withStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.secondary.main,
    marginBottom: -1,
    minHeight: 56,
    display: "flex",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(7),
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12,
  },
}))(Paper);

interface HierarchyItemProps {
  level: number;
}

const HierarchyItem: React.FC<HierarchyItemProps> = (props) => {
  return (
    <Box display="flex" ml={props.level * 5} mt={2}>
      <Box style={{ position: "relative", minWidth: "28px"}}>
        <TallConnector
          style={{
            visibility: props.level !== 0 ? "visible" : "hidden",
            position: "absolute",
            top: "-45px",
            zIndex:-1,
          }}
        />
      </Box>
      <Box style={{ flex: 1 }}>{props.children}</Box>
    </Box>
  );
};

export interface TermAccordionProps {
  level: number;
  term: TermInfo;
}

export const TermAccordion: React.FC<TermAccordionProps> = (props) => {
  const [expanded, setExpanded] = useState(false);
  const [description, setDescription] = useState("Pojem nemá definici");
  const { data = [], isLoading, isSuccess } = useTerm(props.term ?? emptyTerm);
  useEffect(() => {
    if (isSuccess) {
      if (data.definition?.cs) {
        setDescription(data.definition.cs);
      }
    }
  }, [data]);
  return (
    <HierarchyItem level={props.level}>
      <Accordion
        square
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
      >
        <AccordionSummary
          aria-controls="panel1d-content"
          id="panel1d-header"
          expandIcon={<ExpandIcon />}
        >
          <FormControl
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.stopPropagation()}
          >
            <RouteLink to={"/"} variant="h5" color="textSecondary">
              {props.term.label.cs}
            </RouteLink>
          </FormControl>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{description}</Typography>
        </AccordionDetails>
      </Accordion>
    </HierarchyItem>
  );
};

export const CurrentTerm: React.FC<TermAccordionProps> = (props) => {
  return (
    <HierarchyItem level={props.level}>
      <Box
        style={{
          border: "1px solid rgba(0, 0, 0, .125)",
          boxShadow: "none",
        }}
      >
        <CurrentTermBox square elevation={0}>
          <Typography variant="h5" color="textSecondary">
            {props.term.label.cs}
          </Typography>
        </CurrentTermBox>
      </Box>
    </HierarchyItem>
  );
};
