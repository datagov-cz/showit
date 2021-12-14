import React, { useState } from "react";
import { ReactComponent as Copy } from "../../assets/copy_small.svg";
import { Box, Button, Tooltip, Typography } from "@mui/material";

export interface IriItem {
  iri: string;
}

const Content = React.forwardRef((props: any, ref: any) => {
  return (
    <Button {...props} ref={ref} fullWidth variant="text" color="secondary">
      <Box display="flex">
        <Copy style={{ maxHeight: 33, marginRight: 16 }} />
        <Typography variant="h5" color="textSecondary">
          IRI
        </Typography>
      </Box>
    </Button>
  );
});

const IRI: React.FC<IriItem> = (props) => {
  const [title, setTitle] = useState("Zkopírovat IRI");
  const click = () => {
    navigator.clipboard
      .writeText(props.iri)
      .then(() => setTitle("Zkopírováno!"));
  };
  return (
    <Tooltip title={title} arrow>
      <Content onClick={click} />
    </Tooltip>
  );
};

export default IRI;