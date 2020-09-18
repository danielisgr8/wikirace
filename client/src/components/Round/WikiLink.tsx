import React from "react";

type WikiLinkProps = {
  labelTitle: string,
  title: string,
  path: string,
  error: boolean
}

const WikiLink = ({ labelTitle, title, path, error }: WikiLinkProps) => {
  return (
    <>
      {labelTitle}: {
      error
        ? <p className="error">Error getting title for: {path}</p> 
        : (
          title === ""
            ? "None"
            : <a href={`https://en.wikipedia.org/wiki/${path}`}>{title}</a>
          )
      }
    </>
  );
};

export default WikiLink;
