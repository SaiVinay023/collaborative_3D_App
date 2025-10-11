import React from "react";

export default function AnnotationMarker({ text }) {
  return (
    <div className="px-2 py-1 bg-yellow-300 rounded text-sm shadow">
      {text}
    </div>
  );
}
