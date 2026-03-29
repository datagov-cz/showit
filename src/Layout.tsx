import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Box, styled } from "@mui/material";
import { useLocation } from "react-router-dom";
import ScrollToTopButton from "./ScrollToTopButton";
import { SINGLE_VOCABULARY_MODE } from "./app/variables";

const FullSizedBox = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
});

const ContentBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
});

const nonSearchRoutes = ["/", "/hledat"];
const nonIllustrationRoutes = ["/"];

const Layout: React.FC = (props) => {
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [showIllustration, setShowIllustration] = useState(false);
  useEffect(() => {
    setShowSearch(!nonSearchRoutes.includes(location.pathname));
    setShowIllustration(!nonIllustrationRoutes.includes(location.pathname));
  }, [location]);

  return (
    <FullSizedBox>
      <Header showSearch={SINGLE_VOCABULARY_MODE ? false : showSearch} />
      <ContentBox>{props.children}</ContentBox>
      <Footer showImage={showIllustration} />
      <ScrollToTopButton />
    </FullSizedBox>
  );
};

export default Layout;
