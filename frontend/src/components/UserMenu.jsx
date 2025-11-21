import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  HStack,
  Text,
  useColorMode,
  MenuDivider
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState } from "react";

import { FiFileText, FiMessageCircle, FiSettings, FiLogOut } from "react-icons/fi";
import { ImStarEmpty } from "react-icons/im";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";

export default function UserMenu({ user, logoutUser }) {
  const [open, setOpen] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Menu isOpen={open} placement="bottom-end" isLazy>
      <Box
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <MenuButton>
          <HStack cursor="pointer">
            <Avatar src={user?.avatar} name={user?.username} size="sm" />
            <Text fontWeight="medium">{user.name || user.username}</Text>
          </HStack>
        </MenuButton>

        <MenuList>
          <MenuItem as={Link} to="/my-posts" icon={<FiFileText />}>
            Bài đăng của tôi
          </MenuItem>

          <MenuItem as={Link} to="/saved-posts" icon={<ImStarEmpty />}>
            Bài đăng đã lưu
          </MenuItem>

          <MenuItem as={Link} to="/chat" icon={<FiMessageCircle />}>
            Nhắn tin
          </MenuItem>

          <MenuItem 
            icon=
            {colorMode === "light" ? (
              <MdOutlineDarkMode/>
            ) : (
              <MdOutlineLightMode />
            )}
            onClick={toggleColorMode}
          >
            {colorMode === "light" ? "Chế độ tối" : "Chế độ sáng"}
          </MenuItem>
          <MenuDivider />

          <MenuItem
            icon={<FiLogOut />}
            onClick={async () => {
              await logoutUser();
            }}
          >
            Đăng xuất
          </MenuItem>
        </MenuList>
      </Box>
    </Menu>
  );
}
