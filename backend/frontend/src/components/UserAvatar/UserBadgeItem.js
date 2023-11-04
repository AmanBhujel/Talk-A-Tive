import { Box } from '@chakra-ui/react'
import React from 'react'
import { AiOutlineCloseCircle } from "react-icons/ai";

//After Selecting User to add in group these is the badge which contains name of user in purple background
const UserBadgeItem = ({user,handleFunction}) => {
  return (
    <Box
    display={'flex'}
    alignItems={'center'}
    px={2}
    py={1}
    borderRadius={'lg'}
    m={1}
    mb={2}
    fontSize={12}
    backgroundColor={'purple'}
    color={'white'}
    cursor={'pointer'}
    onClick={handleFunction}>
        {user.name}
        <AiOutlineCloseCircle/>
    </Box>
  )
}

export default UserBadgeItem