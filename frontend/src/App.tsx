import { useState } from "react";
import "./App.css";
import {
  defaultQueryContext,
  parseQuery,
  QueryContext,
  useQueryContext,
} from "./queryContext";
import { Watch } from "./Watch";

// Use React Router for URL routing because its better but new version didnt work for some reason
function App() {
  return (
    <WithQueryContext>
      <Views />
    </WithQueryContext>
  );
}

function WithQueryContext(props: { children: any }) {
  const [query, setQuery] = useState(window.location.search);

  if (query !== window.location.search) {
    console.log("update query: ", query);
    setQuery(window.location.search);
  }

  const setUrlParams = (params: Map<string, string>) => {
    const search = new URLSearchParams(Object.fromEntries(params)).toString();
    setQuery(search);
    window.history.pushState({}, "", `?${search}`);
  };

  return (
    <QueryContext.Provider
      value={{
        ...defaultQueryContext,
        setUrlParam: (k, v) => {
          const params = parseQuery(window.location.search);
          if (v) {
            params.set(k, v);
          } else {
            params.delete(k);
          }
          setUrlParams(params);
        },
      }}
    >
      {props.children}
    </QueryContext.Provider>
  );
}

function Views() {
  const params = useQueryContext();

  const renderView = () => {
    const view = params.getUrlParam("view");
    console.log("view: ", view);
    switch (view) {
      case "watch":
        return <Watch />;
      case "stream":
        return <Stream />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <h1>EZ Stream</h1>

      <div>
        <button onClick={() => params.setUrlParam("view", "watch")}>
          Watch
        </button>
        <button onClick={() => params.setUrlParam("view", "stream")}>
          Stream
        </button>
      </div>
      {renderView()}
    </div>
  );
}

const Stream = () => {
  return <div>Stream</div>;
};

export default App;
