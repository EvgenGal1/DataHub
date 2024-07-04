"use client";

import React, { useState } from "react";

// Комп.MaterialUI
import Typography from "@mui/material/Typography";
import Switch from "@mui/joy/Switch";
import SwitchDecorators from "@/components/UI/SwitchDecorators";
import ExampleTrackChild from "@/components/UI/ExampleTrackChild";
import SelectFormSubmission from "@/components/UI/SelectFormSubmission";
import SelectMultipleAppearance from "@/components/UI/SelectMultipleAppearance";
import SelectMultipleFormSubmission from "@/components/UI/SelectMultipleFormSubmission";
import SelectCustomValueAppearance from "@/components/UI/SelectCustomValueAppearance";

export default function Examlpes() {
  // лог. > уч.Комп.MUI
  const [openIndex, setOpenIndex] = useState(null);
  const handleToggle = (index: any) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <>
      <hr className="hr" />
      <Typography paragraph>
        Lorem очень морковь, томатный бакалавриат, но Iusmod в то время для
        работы или болезненной боли.
      </Typography>
      <Typography paragraph>
        Следует крупнейший в настоящее время паспорт, но жизнь занимает. Эколог
        ический к Ullamcorper не нуждается в FARISISI, даже диаметр футбола.
      </Typography>
      <hr className="hr" />
      <div className="switch">
        <h1 className="text-center" onClick={() => handleToggle(0)}>
          Switch
        </h1>
        <br />
        <div
          className={`flex justify-around items-center ${
            openIndex === 0 ? "open" : ""
          }`}
        >
          <SwitchDecorators />
          <span> | </span>
          <ExampleTrackChild />
          <span> | </span>
          <Switch
            sx={{
              "--Switch-gap": "31px",
              "--Switch-trackRadius": "5px",
              "--Switch-trackWidth": "58px",
              "--Switch-trackHeight": "42px",
            }}
          />
        </div>
        <br />
        <a
          className="block text-center"
          href="https://mui.com/base-ui/react-switch/"
        >
          https://mui.com/base-ui/react-switch/
        </a>
      </div>
      <hr className="hr" />
      <div className="select-block">
        <h1 className="text-center" onClick={() => handleToggle(1)}>
          Select
        </h1>
        <br />
        <div className={`flex-col ${openIndex === 1 ? "open" : ""}`}>
          <div className="flex flex-row justify-around items-center">
            <SelectFormSubmission />
            <span> | </span>
            <SelectMultipleFormSubmission />
          </div>
          <br />
          <div>
            <SelectMultipleAppearance />
            <br />
            <SelectCustomValueAppearance />
          </div>
        </div>
        <br />
        <a
          className="block text-center"
          href="https://mui.com/base-ui/react-select/"
        >
          https://mui.com/base-ui/react-select/
        </a>
      </div>
      <hr className="hr" />
      <br />
      <a
        href="https://mui.com/joy-ui/react-slider/#track"
        target="_blank"
        rel="noopener noreferrer"
      >
        joy/react-slider/#trac
      </a>
      <br />
      <hr className="hr" />
      <br />
      <a
        href="https://mui.com/material-ui/react-slider/#track"
        target="_blank"
        rel="noopener noreferrer"
      >
        mui/react-slider/#trac
      </a>
      <br />
      <hr className="hr" />
      <br />
      <a
        href="https://mui.com/material-ui/react-slider/#removed-track"
        target="_blank"
        rel="noopener noreferrer"
      >
        mui/react-slider/#removed-trac
      </a>
      <br />
      <hr className="hr" />
      <br />
      <a
        href="https://mui.com/joy-ui/react-switch/#track-child"
        target="_blank"
        rel="noopener noreferrer"
      >
        joy/react-switch/#track-chil
      </a>
      <br />
      <hr className="hr" />
      <br />
      <a
        href="https://mui.com/x/react-tree-view/simple-tree-view/expansion/#track-item-expansion-change"
        target="_blank"
        rel="noopener noreferrer"
      >
        expansion/#track-item-expansion-chang
      </a>
      <br />
      <hr className="hr" />
      <br />
      <a
        href="https://mui.com/base-ui/react-modal/"
        target="_blank"
        rel="noopener noreferrer"
      >
        react-modal
      </a>
      <br />
      <hr className="hr" />
      <br />
      <a
        href="https://mui.com/base-ui/react-transitions/"
        target="_blank"
        rel="noopener noreferrer"
      >
        react-transitions
      </a>
      <hr className="hr" />
    </>
  );
}
