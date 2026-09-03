import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MenuItem, MenuLink, MenuBullet, MenuTitle } from "@/components/menu";
import AllCustomerToogle from "@/components/modal/AllCustomerToggle";


const EventLinkItem = ({ item, className }) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);

  const handleEventSelect = (eventId) => {
    setModalOpen(false);
    navigate(`${item.path}/${eventId}`);
  };

  return (
    <>
      <MenuItem>
        <MenuLink className={className}>
          <div
            onClick={handleOpenModal}
            className="flex items-center gap-2.5 w-full cursor-pointer"
          >
            <MenuBullet className="flex w-[6px] relative before:absolute before:rounded-full before:size-[6px] menu-item-hover:before:bg-primary" />
            <MenuTitle className="text-2sm font-normal text-gray-800">
              {item.title}
            </MenuTitle>
          </div>
        </MenuLink>
      </MenuItem>

      <AllCustomerToogle
        isModalOpen={modalOpen}
        setIsModalOpen={setModalOpen}
        onEventSelect={handleEventSelect}
      />
    </>
  );
};

export default EventLinkItem;