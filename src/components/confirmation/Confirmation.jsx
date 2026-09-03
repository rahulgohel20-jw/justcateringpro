import React, { useState } from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Fade from "@mui/material/Fade";

export function Confirmation({
  trigger,
  content = "Are you sure?",
  yesText = "Yes",
  noText = "No",
  onConfirm,
  onCancel,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const openPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closePopover = () => {
    setAnchorEl(null);
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closePopover();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closePopover();
  };

  const open = Boolean(anchorEl);
  const id = open ? "confirmation-popover" : undefined;

  return (
    <>
      <button
        className="btn btn-sm btn-icon btn-clear"
        title="Delete"
        aria-describedby={id}
        onClick={openPopover}
        style={{ cursor: "pointer" }}
      >
        {trigger}
      </button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          elevation: 6,
          sx: {
            p: 2,
            borderRadius: 1,
            minWidth: 250,
          },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight={500}>
            {content}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={handleCancel}
          >
            {noText}
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={handleConfirm}
          >
            {yesText}
          </Button>
        </Stack>
      </Popover>
    </>
  );
}
