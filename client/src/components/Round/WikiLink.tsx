import React from "react";

type WikiLinkProps = {
  labelTitle: string,
  title: string,
  path: string,
  error: boolean,
  oldPath?: string,
  oldTitle?: string
}

const WikiLink = ({ labelTitle, title, path, error, oldPath, oldTitle }: WikiLinkProps) => {
  return (
    <>
      {labelTitle}: {
      error
        ? <p className="error">Error getting title for: {oldPath || path}</p> 
        : (
          ((oldPath !== undefined && oldPath === "") || (oldPath === undefined && title === ""))
            ? "None"
            : <a href={`https://en.wikipedia.org/wiki/${oldPath || path}`} target="_blank" rel="noopener noreferrer">{oldTitle || title}</a>
          )
      }
    </>
  );
};

export default WikiLink;
