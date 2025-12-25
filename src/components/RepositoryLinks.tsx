import React from "react";
import { LinkWithHover } from "./LinkWithHover";

export const RepositoryLinks = () => {
  return (
    <div className="flex flex-col gap-2 [&>*]:m-0 [&>*]:leading-tight">
      <LinkWithHover
        url="https://git.leowen.me/liyaowhen/Leado123.github.io"
        title="sharesyllabus.me's frontend repository"
        description="Click to open repository"
        height="50px"
      />
      <LinkWithHover
        url="https://git.leowen.me/liyaowhen/sharesyllabus-server"
        title="sharesyllabus.me's backend repository"
        description="Click to open repository"
        height="25px"
      />
    </div>
  );
};

