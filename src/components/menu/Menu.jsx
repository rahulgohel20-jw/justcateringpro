import clsx from "clsx";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  memo,
  useContext,
  useState,
} from "react";
import { MenuItem } from "./";
const initalProps = {
  disabled: false,
  highlight: false,
  multipleExpand: false,
  dropdownTimeout: 0,
  setOpenAccordion: (parentId, id) => {},
  isOpenAccordion: (parentId, id) => {
    return false;
  },
};

const MenuContext = createContext(initalProps);

const useMenu = () => useContext(MenuContext);
const MenuComponent = ({
  className,
  children,
  disabled = false,
  highlight = false,
  dropdownTimeout = 150,
  multipleExpand = false,
}) => {
  const [openAccordions, setOpenAccordions] = useState({});

  const setOpenAccordion = (parentId, id) => {
    setOpenAccordions((prevState) => ({
      ...prevState,
      [parentId]: prevState[parentId] === id ? null : id,
    }));
  };
  const isOpenAccordion = (parentId, id) => {
    return openAccordions[parentId] === id;
  };
  const modifiedChildren = Children.map(children, (child, index) => {
    if (isValidElement(child)) {
      if (child.type === MenuItem) {
        const modifiedProps = {
          parentId: "root",
          id: `root-${index}`,
        };
        return cloneElement(child, modifiedProps);
      } else {
        return cloneElement(child);
      }
    }
    return child;
  });
  return (
    <MenuContext.Provider
      value={{
        disabled,
        highlight,
        dropdownTimeout,
        multipleExpand,
        setOpenAccordion,
        isOpenAccordion,
      }}
    >
      <div className={clsx("menu", className && className)}>
        {modifiedChildren}
      </div>
    </MenuContext.Provider>
  );
};
const Menu = memo(MenuComponent);
export { Menu, useMenu };
