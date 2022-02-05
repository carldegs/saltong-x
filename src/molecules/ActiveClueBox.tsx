import { Box, Flex, FlexProps, Text } from '@chakra-ui/react';

import { Clue } from '../types/Clue';
import { WordDirection } from '../types/WordDirection';

interface ActiveClueBoxProps extends FlexProps {
  clue: Clue;
  dir: WordDirection;
}

const ActiveClueBox: React.FC<ActiveClueBoxProps> = ({
  clue,
  dir,
  ...flexProps
}) => (
  <Flex
    alignItems="center"
    mx={4}
    h="92px"
    w="full"
    justifyContent="center"
    {...flexProps}
  >
    {clue?.num && (
      <Box
        maxW={['350px', '600px']}
        px={4}
        py={4}
        w="full"
        borderRadius={12}
        bg="orange.200"
      >
        <Text fontSize="lg">
          <b>
            {clue.num}
            {dir[0]}.
          </b>{' '}
          {clue.clue}
        </Text>
      </Box>
    )}
  </Flex>
);

export default ActiveClueBox;
