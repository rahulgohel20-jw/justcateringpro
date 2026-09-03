import { useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import useStyle from "./style";

const CustomModal = ({ open, onClose, children, footer, title, ...rest }) => {
  const classes = useStyle();
  const [shake, setShake] = useState(false);
  const modalRef = useRef(null);

  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }
    onClose();
  };

  // Body scroll lock — overflow-only, does NOT touch position/top,
  // so window.scrollY stays truthful for any nested popup
  // (antd Select, DatePicker, custom dropdowns, etc.) that positions
  // itself using getBoundingClientRect() + scrollY.
  useEffect(() => {
    if (open) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;

      const isAntdPopup = [
        ...document.querySelectorAll("[class^='ant-']"),
      ].some((el) => el.contains(target));

      if (isAntdPopup) return;

      if (open && modalRef.current && !modalRef.current.contains(e.target)) {
        setShake(true);
        setTimeout(() => setShake(false), 300);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      closable={false}
      getContainer={document.body}
      centered
      title={
        title ? (
          <>
            <div className="flex justify-between items-center pb-2">
              <span className="text-base font-medium">{title}</span>
              <button
                type="text"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="ki-filled ki-cross text-xl"></i>
              </button>
            </div>
            <hr className="border-0 h-[1px] bg-[#BABABAB2]" />
          </>
        ) : null
      }
      open={open}
      onCancel={handleClose}
      modalRender={(modal) => (
        <div ref={modalRef} className={shake ? classes.shake : ""}>
          {modal}
        </div>
      )}
      footer={footer ? <div className="pt-3">{footer}</div> : null}
      {...rest}
    >
      {children}
    </Modal>
  );
};

export { CustomModal };