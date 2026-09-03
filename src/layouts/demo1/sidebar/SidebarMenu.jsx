import { useState, useEffect } from "react";
import clsx from "clsx";
import { KeenIcon } from "@/components/keenicons";
import {
  Menu,
  MenuArrow,
  MenuBadge,
  MenuBullet,
  MenuHeading,
  MenuIcon,
  MenuItem,
  MenuLabel,
  MenuLink,
  MenuSub,
  MenuTitle,
} from "@/components/menu";
import { useMenu } from "@/hooks/useMenu"; 

import { useAuthContext } from "../../../auth";
import EventLinkItem from "../../../partials/sidebar/EventLinkItem";

const SidebarMenu = () => {
  // styling constants
  const linkPl = "ps-[10px]";
  const linkPr = "pe-[10px]";
  const linkPy = "py-[6px]";
  const itemsGap = "gap-0.5";
  const subLinkPy = "py-[8px]";
  const rightOffset = "me-[-10px]";
  const iconWidth = "w-[20px]";
  const iconSize = "text-lg";
  const accordionLinkPl = "ps-[10px]";
  const accordionLinkGap = [
    "gap-[10px]",
    "gap-[14px]",
    "gap-[5px]",
    "gap-[5px]",
    "gap-[5px]",
    "gap-[5px]",
  ];
  const accordionPl = [
    "ps-[10px]",
    "ps-[22px]",
    "ps-[22px]",
    "ps-[22px]",
    "ps-[22px]",
    "ps-[22px]",
  ];
  const accordionBorderLeft = [
    "before:start-[20px]",
    "before:start-[32px]",
    "before:start-[32px]",
    "before:start-[32px]",
    "before:start-[32px]",
  ];

 
  const { menu, loading } = useMenu();
  const { currentUser } = useAuthContext(); 
const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
const isVisible = ["jcxpro", "justbanq"].includes(authStorage?.state?.user?.softType);  if (loading) return null;
  if (!menu.length) return null;

  // build menu helpers
  const buildMenu = (items) => {
    return items.map((item, index) => {
      if (item.heading) return buildMenuHeading(item, index);
      if (item.disabled) return buildMenuItemRootDisabled(item, index);
      return buildMenuItemRoot(item, index);
    });
  };

  const buildMenuItemRoot = (item, index) => {
    if (item.children) {
      return (
        <MenuItem key={index}>
          <MenuLink
            className={clsx(
              "flex items-center grow cursor-pointer border border-transparent",
              accordionLinkGap[0],
              linkPl,
              linkPr,
              linkPy,
            )}
          >
            <MenuIcon
              className={clsx(
                "items-start text-gray-500 dark:text-gray-400",
                iconWidth,
              )}
            >
              {item.icon && <KeenIcon icon={item.icon} className={iconSize} />}
            </MenuIcon>
            <MenuTitle className="mb-2 text-sm font-medium text-gray-800 menu-item-active:text-primary menu-link-hover:!text-primary">
              {item.title}
            </MenuTitle>
            {buildMenuArrow()}
          </MenuLink>

          <MenuSub
            className={clsx(
              "relative before:absolute before:top-0 before:bottom-0 before:border-s before:border-gray-200",
              itemsGap,
              accordionBorderLeft[0],
              accordionPl[0],
            )}
          >
            {buildMenuItemChildren(item.children, index, 1)}
          </MenuSub>
        </MenuItem>
      );
    }

    return (
      <MenuItem key={index}>
        <MenuLink
          path={item.path}
          className={clsx(
            "mb-2 border border-transparent menu-item-active:bg-secondary-active dark:menu-item-active:bg-coal-300 dark:menu-item-active:border-gray-100 hover:bg-secondary-active dark:hover:bg-coal-300 hover:rounded-lg menu-item-active:rounded-lg",
            accordionLinkGap[0],
            linkPy,
            linkPl,
            linkPr,
          )}
        >
          <MenuIcon
            className={clsx(
              "items-start text-gray-600 dark:text-gray-500",
              iconWidth,
            )}
          >
            {item.icon && <KeenIcon icon={item.icon} className={iconSize} />}
          </MenuIcon>
          <MenuTitle className="text-sm font-medium text-gray-800 menu-item-active:text-primary menu-link-hover:!text-primary">
            {item.title}
          </MenuTitle>
        </MenuLink>
      </MenuItem>
    );
  };

  const buildMenuItemRootDisabled = (item, index) => (
    <MenuItem key={index}>
      <MenuLabel
        className={clsx(
          "border border-transparent flex items-center",
          accordionLinkGap[0],
          linkPy,
          linkPl,
          linkPr,
        )}
      >
        <span
          style={{
            filter: "blur(2px)",
            opacity: 0.5,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <MenuIcon
            className={clsx(
              "items-start text-gray-500 dark:text-gray-400",
              iconWidth,
            )}
          >
            {item.icon && <KeenIcon icon={item.icon} className={iconSize} />}
          </MenuIcon>
          <MenuTitle className="text-sm font-medium text-gray-800">
            {item.title}
          </MenuTitle>
        </span>
        {buildMenuSoon()}
      </MenuLabel>
    </MenuItem>
  );

  const buildMenuItemChildren = (items, index, level = 0) =>
    items.map((item, idx) =>
      item.disabled
        ? buildMenuItemChildDisabled(item, idx, level)
        : buildMenuItemChild(item, idx, level),
    );

  const buildMenuItemChild = (item, index, level = 0) => {
    // Flat item that requires an event to be picked before navigating.
    // Renders like any other leaf menu item (no nested accordion) — on
    // click it opens the event picker, then redirects to
    // `${item.path}/${eventId}`.
    if (item.requiresEvent) {
      if (!isVisible) return null;
      return (
        <EventLinkItem
          key={index}
          item={item}
          className={clsx(
            "border border-transparent items-center grow cursor-pointer menu-item-active:bg-secondary-active hover:bg-secondary-active hover:rounded-lg",
            accordionLinkGap[level],
            accordionLinkPl,
            linkPr,
            subLinkPy,
          )}
        />
      );
    }

    if (item.children) {
      return (
        <MenuItem
          key={index}
          className={clsx(item.collapse && "flex-col-reverse")}
        >
          <MenuLink
            className={clsx(
              "border border-transparent grow cursor-pointer",
              accordionLinkGap[level],
              accordionLinkPl,
              linkPr,
              subLinkPy,
            )}
          >
            {buildMenuBullet()}
            <MenuTitle className="text-sm font-normal text-gray-800 menu-link-hover:!text-primary">
              {item.title}
            </MenuTitle>
            {buildMenuArrow()}
          </MenuLink>
          <MenuSub
            className={clsx(
              !item.collapse &&
                "relative before:absolute before:border-s before:border-gray-200",
              itemsGap,
              !item.collapse && accordionBorderLeft[level],
              !item.collapse && accordionPl[level],
            )}
          >
            {buildMenuItemChildren(
              item.children,
              index,
              item.collapse ? level : level + 1,
            )}
          </MenuSub>
        </MenuItem>
      );
    }

    return (
      <MenuItem key={index}>
        <MenuLink
          path={item.path}
          className={clsx(
            "border border-transparent items-center grow menu-item-active:bg-secondary-active hover:bg-secondary-active hover:rounded-lg",
            accordionLinkGap[level],
            accordionLinkPl,
            linkPr,
            subLinkPy,
          )}
        >
          {buildMenuBullet()}
          <MenuTitle className="text-2sm font-normal text-gray-800">
            {item.title}
          </MenuTitle>
        </MenuLink>
      </MenuItem>
    );
  };

  const buildMenuItemChildDisabled = (item, index, level = 0) => (
    <MenuItem key={index}>
      <MenuLabel
        className={clsx(
          "border border-transparent items-center grow flex",
          accordionLinkGap[level],
          accordionLinkPl,
          linkPr,
          subLinkPy,
        )}
      >
        <span
          style={{
            filter: "blur(2px)",
            opacity: 0.5,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {buildMenuBullet()}
          <MenuTitle className="text-sm font-medium inline-block">
            {item.title}
          </MenuTitle>
        </span>
        {buildMenuSoon()}
      </MenuLabel>
    </MenuItem>
  );

  const buildMenuHeading = (item, index) => (
    <MenuItem key={index} className="pt-2.25 pb-px">
      <MenuHeading
        className={clsx(
          "uppercase text-2sm font-medium text-gray-500",
          linkPl,
          linkPr,
        )}
      >
        {item.heading}
      </MenuHeading>
    </MenuItem>
  );

  const buildMenuArrow = () => (
    <MenuArrow
      className={clsx("text-gray-400 w-[20px] justify-end", rightOffset)}
    >
      <KeenIcon icon="plus" className="text-sm menu-item-show:hidden" />
      <KeenIcon
        icon="minus"
        className="text-sm hidden menu-item-show:inline-flex"
      />
    </MenuArrow>
  );

  const buildMenuBullet = () => (
    <MenuBullet className="flex w-[6px] relative before:absolute before:rounded-full before:size-[6px] menu-item-active:before:bg-primary menu-item-hover:before:bg-primary" />
  );

  const buildMenuSoon = () => (
    <MenuBadge className={rightOffset}>
      <span className="badge badge-xs">Locked</span>
    </MenuBadge>
  );

  return (
    <Menu
      highlight
      multipleExpand={false}
      className={clsx("flex flex-col grow", itemsGap)}
    >
      {buildMenu(menu)}
    </Menu>
  );
};

export { SidebarMenu };