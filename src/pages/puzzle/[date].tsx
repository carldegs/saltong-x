import {
  Flex,
  AspectRatio,
  Heading,
  Text,
  Stack,
  Container,
  HStack,
} from '@chakra-ui/layout';
import {
  Grid,
  Icon,
  IconButton,
  Tooltip,
  VisuallyHiddenInput,
  Center,
  Spinner,
} from '@chakra-ui/react';
import {
  ArrowLineDown,
  ArrowLineRight,
  SkipBack,
  SkipForward,
} from 'phosphor-react';
import { createRef, Fragment, useEffect, useRef, useState } from 'react';

import GridCell from '../../atoms/GridCell';
import usePuzzle from '../../hooks/usePuzzle';
import ActiveClueBox from '../../molecules/ActiveClueBox';
import { MovementDirection } from '../../types/MovementDirection';
import { WordDirection } from '../../types/WordDirection';

const PuzzlePage: React.FC = () => {
  const isEditMode = false;
  const {
    puzzle,
    getPos,
    setCursor,
    getCursorStatus,
    cursor,
    setAnswerLetter,
    setCellValue,
    moveToNextLetter,
    moveToNextWord,
    moveToPrevWord,
    moveToPrevLetter,
    toggleCursorDirection,
    moveToDirection,
    isFetchingPuzzle,
  } = usePuzzle();
  const inputRefs = useRef(
    puzzle.grid.map(() => createRef<HTMLInputElement>())
  );
  const [shiftPressed, setShiftPressed] = useState(false);

  useEffect(() => {
    if (!inputRefs.current?.length) {
      inputRefs.current = puzzle.grid.map(() => createRef<HTMLInputElement>());
    } else if (!isFetchingPuzzle) {
      inputRefs.current[cursor.idx]?.current?.focus();
    }
  }, [cursor, isFetchingPuzzle, puzzle.grid]);

  if (isFetchingPuzzle) {
    return (
      <Center w="full" h="100vh">
        <Spinner />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl">
      <Flex
        h="100vh"
        alignItems="center"
        justifyContent="space-evenly"
        direction={['column', 'row']}
      >
        <Stack
          flexGrow={1}
          w={['full', undefined]}
          alignItems="center"
          spacing={4}
        >
          <ActiveClueBox
            clue={puzzle.clues[cursor.dir][cursor.clueIdx]}
            dir={cursor.dir}
            display={['none', 'inherit']}
          />
          <Grid
            gridTemplateRows={`repeat(${puzzle.size.rows}), 1fr)`}
            gridTemplateColumns={`repeat(${puzzle.size.cols}, 1fr)`}
            w="full"
            maxW={[50, 70].map((size) => `${puzzle.size.rows * size}px`)}
            sx={{
              aspectRatio: '1',
            }}
            borderWidth={1}
            borderColor="gray.600"
          >
            {puzzle.grid.map((value, i) => {
              const pos = getPos(i);
              return (
                <AspectRatio ratio={1 / 1} key={`(${pos.x},${pos.y})`}>
                  <>
                    <VisuallyHiddenInput
                      name="hidden"
                      autoComplete="false"
                      ref={inputRefs.current[i]}
                      onChange={(e) => {
                        let val: string;

                        if (e.target.value === '') {
                          // backspace
                          val = ' ';
                        } else if (e.target.value.length > 1) {
                          val = e.target.value
                            .replace(' ', '')
                            .replace(value, '')
                            .toUpperCase();
                        }

                        if (isEditMode) {
                          setAnswerLetter(val === '' ? '-' : val);
                        }
                        setCellValue(val);

                        if (e.target.value !== '') {
                          moveToNextLetter({
                            allowOverwrite: puzzle.grid[i] !== ' ',
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          !e.key.match(/[a-zA-Z]/) &&
                          ![
                            'Backspace',
                            'Tab',
                            'ArrowUp',
                            'ArrowRight',
                            'ArrowLeft',
                            'ArrowDown',
                            'Shift',
                          ].includes(e.key)
                        ) {
                          e.preventDefault();
                          return;
                        }

                        if (e.key === 'Shift') {
                          setShiftPressed(true);
                          return;
                        }

                        if (e.key === 'Tab') {
                          if (shiftPressed) {
                            moveToPrevWord();
                          } else {
                            moveToNextWord();
                          }

                          return;
                        }

                        if (
                          [
                            'ArrowUp',
                            'ArrowRight',
                            'ArrowLeft',
                            'ArrowDown',
                          ].includes(e.key)
                        ) {
                          moveToDirection(e.key as MovementDirection);
                          return;
                        }

                        if (
                          e.key === 'Backspace' &&
                          (e.target as any).value === ' '
                        ) {
                          // Move to previous key
                          e.preventDefault();
                          const newCursor = moveToPrevLetter({
                            allowOverwrite: true,
                          });
                          setCellValue(' ', newCursor.idx);
                          return;
                        }
                      }}
                      onKeyUp={(e) => {
                        if (e.key === 'Shift') {
                          setShiftPressed(false);
                        }
                      }}
                      value={puzzle.grid[i]}
                    />
                    <GridCell
                      value={value}
                      cursorStatus={getCursorStatus(i)}
                      gridnum={puzzle.gridnums[i]}
                      pos={pos}
                      onClick={setCursor}
                    />
                  </>
                </AspectRatio>
              );
            })}
          </Grid>
          <ActiveClueBox
            clue={puzzle.clues[cursor.dir][cursor.clueIdx]}
            dir={cursor.dir}
            display={['inherit', 'none']}
          />
          <HStack spacing={4}>
            <Tooltip label="Toggle Direction" openDelay={300}>
              <IconButton
                colorScheme="gray"
                variant="solid"
                icon={
                  <Icon
                    as={
                      cursor.dir === WordDirection.across
                        ? ArrowLineRight
                        : ArrowLineDown
                    }
                    weight="bold"
                  />
                }
                onClick={toggleCursorDirection}
                aria-label="rotate"
              />
            </Tooltip>
            <Tooltip label="Previous Word" openDelay={300}>
              <IconButton
                colorScheme="gray"
                variant="solid"
                icon={<Icon as={SkipBack} weight="bold" />}
                onClick={() => {
                  moveToPrevWord();
                }}
                aria-label="prev-word"
              />
            </Tooltip>
            <Tooltip label="Next Word" openDelay={300}>
              <IconButton
                colorScheme="gray"
                variant="solid"
                icon={<Icon as={SkipForward} weight="bold" />}
                onClick={() => {
                  moveToNextWord();
                }}
                aria-label="next-word"
              />
            </Tooltip>
          </HStack>
        </Stack>
        <Stack
          spacing={8}
          display={['none', 'none', 'inherit']}
          w="full"
          maxW="400px"
        >
          {[WordDirection.across, WordDirection.down].map((dir) => (
            <Stack key={`stack-${dir}`}>
              <Heading fontSize="md">{dir.toUpperCase()}</Heading>
              {puzzle.clues[dir].map(({ num, clue }, i) => (
                <Fragment key={`${num}${dir}`}>
                  <Text
                    fontWeight={
                      dir === cursor.dir && i === cursor.clueIdx
                        ? 'bold'
                        : 'regular'
                    }
                  >
                    <b>{num}.</b> {clue}{' '}
                    {isEditMode && puzzle.answers[dir][i].answer}
                  </Text>
                </Fragment>
              ))}
            </Stack>
          ))}
        </Stack>
      </Flex>
    </Container>
  );
};

export default PuzzlePage;
