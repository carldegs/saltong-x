import { Flex, Text } from '@chakra-ui/react';

import { CursorStatus } from '../types/Cursor';
import { Position } from '../types/Position';
import { isBlock } from '../utils/grid';

export interface GridCellProps {
  value: string;
  gridnum?: number;
  pos: Position;
  onClick(pos: Position): void;
  cursorStatus: CursorStatus;
}

const GridCell: React.FC<GridCellProps> = ({
  value,
  gridnum,
  pos,
  onClick,
  cursorStatus,
}) => {
  let bg = '';

  if (cursorStatus === CursorStatus.selectedLetter) {
    bg = 'orange.400';
  } else if (cursorStatus === CursorStatus.selectedWord) {
    bg = 'orange.200';
  }

  if (isBlock(value)) {
    bg = 'gray.900';
  }

  return (
    <Flex
      bg={bg}
      borderWidth={1}
      borderColor="gray.900"
      justifyContent="center"
      alignItems="center"
      pos="relative"
      onClick={(e) => {
        e.preventDefault();
        if (!isBlock(value)) {
          onClick(pos);
        }
      }}
      w="full"
      h="full"
      cursor="pointer"
    >
      {!isBlock(value) && (
        <>
          {!!gridnum && (
            <Text
              pos="absolute"
              top={[0, 0.25]}
              left={[0.5, 1.5]}
              fontSize={['xs', 'sm']}
              color="gray.900"
              mt={[-0.5, 0]}
              fontWeight="bold"
              onContextMenu={(e) => e.preventDefault()}
            >
              {gridnum}
            </Text>
          )}
          <Text fontSize={['3xl', '4xl']} fontWeight="bold">
            {value}
          </Text>
        </>
      )}
    </Flex>
  );
};

export default GridCell;
