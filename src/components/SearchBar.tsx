import React, {
  BaseSyntheticEvent,
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import { CircularProgress, InputAdornment } from "@material-ui/core";
import { useSearch, SearchResult } from "../api/WordsAPI";
import { useHistory } from "react-router-dom";
import { debounce } from "lodash";
import { generateTermRoute } from "../utils/Utils";

const OPTIONS_LIMIT = 7;

const filterOptions = (options: SearchResult[], state: any) => {
  return options.slice(0, OPTIONS_LIMIT) as SearchResult[];
};

const useStyles = makeStyles((theme) => ({
  inputRoot: (props: SearchBarProps) => ({
    border: "1px solid #e2e2e1",
    color: theme.palette.text.primary,
    borderRadius: props.size === "large" ? 26 : 16,
    fontSize: props.size === "large" ? 26 : 16,
    height: props.size === "large" ? 63 : 38,
    backgroundColor: "#fcfcfb",
    paddingLeft: props.size === "large" ? theme.spacing(6) : theme.spacing(1),
    paddingRight:
      props.size === "large"
        ? `${theme.spacing(6)}px !important`
        : `${theme.spacing(1)}px !important`,
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    "&:hover": {
      backgroundColor: "#fff",
    },
  }),
  paper: {
    color: theme.palette.text.primary,
  },
  option: {
    "& em": {
      fontStyle: "normal",
      fontWeight: 700,
    },
  },
}));
const useOtherStyles = makeStyles(() => ({
  icon: {
    color: "gray",
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

interface SearchBarProps {
  size: "small" | "large";
}

const SearchBar: React.FC<SearchBarProps> = (props) => {
  const searchInput = useRef<HTMLInputElement>(null);
  const classes = useStyles(props);
  const otherClasses = useOtherStyles();
  const [inputValue, setInputValue] = useState<string | undefined>();
  const { data = [], isLoading } = useSearch(inputValue);
  const history = useHistory();

  const searchResultLabelMap = useMemo(() => {
    return data.reduce((map, item) => {
      map.set(item.label.toLocaleLowerCase(), item);
      return map;
    }, new Map<string, SearchResult>());
  }, [data]);

  const onChangeHandler = (option: SearchResult | string | null) => {
    if (!option) {
      return;
    }
    const label = (() => {
      if (searchInput.current?.hasAttribute("aria-activedescendant")) {
        return typeof option === "string" ? option : option.label;
      } else {
        return searchInput.current?.value ?? "";
      }
    })();
    const matchedOption = searchResultLabelMap.get(label.toLocaleLowerCase());
    if (!matchedOption) {
      // user typed a query that does not match any suggested label
      history.push(`/search?label=${label}`);
    } else {
      // option selected
      if (matchedOption.isWord) {
        history.push(`/disambiguation?label=${matchedOption.label}`);
      } else {
        const prop = matchedOption.items[0];
        history.push(generateTermRoute(prop));
      }
    }
  };

  const onMouseLeave = (item: BaseSyntheticEvent) => {
    //When user leaves the suggestions, no items should be highlighted and considered active
    searchInput.current?.removeAttribute("aria-activedescendant");
    try {
      item.target.attributes.removeNamedItem("data-focus");
    } catch {
      //The try-catch might look strange but it is needed for the best performance
      item.currentTarget.children[0].setAttribute("data-focus", "false");
      item.currentTarget.children[
        item.currentTarget.children.length - 1
      ].setAttribute("data-focus", "false");
    }
  };

  const onMouseOver = (item: BaseSyntheticEvent) => {
    //When user is only hovering over suggestions, pressing enter should not search for currently highlighted item
    searchInput.current?.removeAttribute("aria-activedescendant");
  };

  const onMouseUp = (item: BaseSyntheticEvent) => {
    //When user clicks on the item, it should search for it
    searchInput.current?.setAttribute("aria-activedescendant", item.target.id);
  };

  const handleChange = useMemo(
    () => (event: ChangeEvent<{}>, newInputValue: string) => {
      setInputValue(newInputValue);
    },
    [setInputValue]
  );

  const debouncedChangeHandler = useMemo(
    () => debounce(handleChange, 300),
    [handleChange]
  );

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel();
    };
  }, [debouncedChangeHandler]);

  const endAdornment = (
    <InputAdornment position="end">
      {isLoading ? (
        <CircularProgress color="inherit" size={20} />
      ) : (
        <SearchIcon
          fontSize={props.size === "small" ? "medium" : "large"}
          className={otherClasses.icon}
          onClick={() => {
            if (!(inputValue === undefined || inputValue === "")) {
              onChangeHandler(inputValue);
            }
          }}
        />
      )}
    </InputAdornment>
  );

  return (
    <Autocomplete
      classes={classes}
      onChange={(event: any, newValue: any) => {
        if (newValue !== null) {
          onChangeHandler(newValue);
        }
      }}
      filterOptions={filterOptions}
      noOptionsText="Nebyly nalezeny žádné výsledky"
      fullWidth
      freeSolo
      options={data}
      getOptionLabel={(option: SearchResult | string) =>
        typeof option === "string" ? option : option.label
      }
      renderOption={(option: SearchResult) => (
        <div dangerouslySetInnerHTML={{ __html: option.displayText }}></div>
      )}
      ListboxProps={{
        /**
         * Material UI autocomplete is not behaving as a normal search
         * It was necessary to add these event listeners
         * Unfortunately there is currently no other way how to solve it
         * **/
        onMouseLeave: onMouseLeave,
        onMouseOver: onMouseOver,
        onMouseUp: onMouseUp,
      }}
      onInputChange={debouncedChangeHandler}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Zadejte hledané slovo"
          inputRef={searchInput}
          InputProps={{
            ...params.InputProps,
            endAdornment: endAdornment,
            disableUnderline: true,
          }}
        />
      )}
    />
  );
};

export default SearchBar;
