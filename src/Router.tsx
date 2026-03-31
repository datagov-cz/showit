import React from "react";
import {
  BrowserRouter,
  Route,
  Switch,
  useLocation,
  useHistory,
} from "react-router-dom";
import Layout from "./Layout";
import HeroSection from "./components/HeroSection";
import SearchPage from "./components/search/SearchPage";
import ScrollToTop from "./ScrollToTop";
import ErrorPage from "./components/ErrorPage";
import DisambiguationPage from "./components/search/DisambiguationPage";
import TermPage from "./components/terms/TermPage";
import VocabularyPage from "./components/vocabularies/VocabularyPage";
import { PUBLIC_PATH } from "./app/variables";
import VocabulariesPage from "./components/vocabularies/VocabulariesPage";

const InitialLocationFix: React.FC = () => {
  // This is a workaround for a bug in React Router that does not work well
  // with a basename on initial load
  // See https://github.com/remix-run/react-router/issues/6536
  const location = useLocation();
  const history = useHistory();
  // The replace should happen only once since we strip it only if it contains something more than /
  if (PUBLIC_PATH.length > 1 && location.pathname.startsWith(PUBLIC_PATH)) {
    history.replace({
      pathname: location.pathname.substring(PUBLIC_PATH.length),
      search: location.search,
    });
  }
  return null;
};

const Router: React.FC = () => {
  return (
    <BrowserRouter basename={PUBLIC_PATH}>
      <InitialLocationFix />
      <ScrollToTop />
      <Layout>
        <Switch>
          <Route exact path="/pojem">
            <TermPage />
          </Route>
          <Route exact path="/slovnik">
            <VocabularyPage />
          </Route>
          <Route exact path="/slovniky">
            <VocabulariesPage />
          </Route>
          <Route exact path="/rozcestnik">
            <DisambiguationPage />
          </Route>
          <Route exact path="/hledat">
            <SearchPage />
          </Route>
          <Route exact path="/">
            <HeroSection />
          </Route>
          <Route>
            <ErrorPage />
          </Route>
        </Switch>
      </Layout>
    </BrowserRouter>
  );
};

export default Router;
