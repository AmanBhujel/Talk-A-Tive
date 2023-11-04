import React, { useEffect } from 'react'
import { Container, Box, Text, Tabs, TabList, Tab, TabPanel, TabPanels } from '@chakra-ui/react'
import Login from '../components/authentication/Login'
import Signup from '../components/authentication/Signup'
import { useNavigate } from 'react-router-dom'
const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || undefined;

      if (userInfo) {
        navigate('/chats');
      }
    } catch (error) {
      // Handle the error, such as logging or displaying a message
      console.error('Error parsing userInfo:', error);
    }
  }, [navigate]);
  return (
    <Container maxW='xl' centerContent>
      <Box
        d='flex'
        alignItems='center'
        justifyContent='center'
        p={3}
        bg={"white"}
        w='100%'
        m='40px 0 15px 0'
        borderRadius="lg"
        borderWidth='1px'
      >
        <Text fontSize='4xl' fontFamily='Work sans' color='black'>Talk-A-Tive</Text>
      </Box>
      <Box bg='white' w='100%' p={4} borderRadius='lg' borderWidth='1px' color='black'>
        <Tabs variant='soft-rounded' >
          <TabList>
            <Tab width='50%'>Login</Tab>
            <Tab width='50%'>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default HomePage;