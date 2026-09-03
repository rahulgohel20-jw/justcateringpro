import { makeStyles } from "@mui/styles";
const useStyles = makeStyles({
  "@keyframes shake": {
    "0%": { transform: "translateX(0)" },
    "25%": { transform: "translateX(-5px)" },
    "50%": { transform: "translateX(5px)" },
    "75%": { transform: "translateX(-5px)" },
    "100%": { transform: "translateX(0)" },
  },
  customModal: {
    margin: "0",
  },
  shake: {
    animation: "$shake 0.3s",
  },
});
export default useStyles;
