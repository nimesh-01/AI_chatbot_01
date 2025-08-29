import React from "react";
import ReactMarkdown from "react-markdown";

const AIResponse = ({ response }) => {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{response}</ReactMarkdown>
    </div>
  );
};

export default AIResponse;
