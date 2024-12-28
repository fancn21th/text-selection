import { createContext, ReactNode, useEffect, useState } from "react";
import {
  fillGaps,
  splitRangesByLine,
  toOverLappedTextRanges,
} from "./NewUtils";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createPortal } from "react-dom";

export const LineCharCount = 50;

// Types for context value
export type NewTRSContextType = {
  fullText: string;
  charCount: number;
  byLine: SplittedByLineTextRange[];
  textRanges: IndexedOriginTextRange[];
  isDragging: boolean;
  cursorPositions: CursorPosition[];
  activatedObject: ActivatedObject;
  setCharCount: (count: number) => void;
  setFullText: (text: string) => void;
  setTextRanges: (ranges: OriginTextRange[]) => void;
  setNewLineRange: (s: number, e: number) => void;
  setIsDragging: (isDragging: boolean) => void;
  setActivatedRange: (
    rangeIndex: number[],
    isGap: boolean,
    overlapped: boolean
  ) => void;
};

export type OriginTextRange = {
  s: number;
  e: number;
};

export type IndexedOriginTextRange = OriginTextRange & {
  index: number;
};

export type OverlappedTextRange = IndexedOriginTextRange & {
  overlapped: number[];
  isOverlapped: boolean;
  hoverIndex: number[];
};

export type GapFilledTextRange = OverlappedTextRange & {
  isGap: boolean;
};

export type SplittedByLineTextRange = GapFilledTextRange & {
  lineNumber: number;
};

export type LineRange = {
  s: number;
  e: number;
} | null;

export type CursorPosition = {
  pos: number; // 坐标
  type: "s" | "e"; // 起点或者是终点
  index: number; // 索引
};

export type ActivatedObject = {
  status: "idle" | "activated";
  isGap: boolean;
  rangeIndex: number[];
  overlapped: boolean;
};

// 创建 Context
// TODO: context warning
export const NewTRSContext = createContext<NewTRSContextType>(
  {} as NewTRSContextType
);

// 提供 Context 的 Provider
export const NewTRSProvider = ({ children }: { children: ReactNode }) => {
  const [charCount, setCharCount] = useState(0);
  const [fullText, _setFullText] = useState("");
  const [textRanges, _setTextRanges] = useState<IndexedOriginTextRange[]>([]);
  const [cursorPositions, setCursorPositions] = useState<CursorPosition[]>([]);
  const [gapFilled, setGapFilled] = useState<GapFilledTextRange[]>([]);
  const [lineRange, _setLineRange] = useState<LineRange>(null);
  const [byLine, setByLine] = useState<SplittedByLineTextRange[]>([]);
  const [isDragging, _setIsDragging] = useState(false);
  const [activatedObject, setActivatedObject] = useState<ActivatedObject>({
    isGap: false,
    rangeIndex: [],
    overlapped: false,
    status: "idle",
  });

  // wrapper for setFullText
  const setFullText = (text: string) => {
    _setFullText(text);
    setCharCount(text.length);
  };

  const setTextRanges = (ranges: OriginTextRange[]) => {
    // sorted by start position
    const sorted = ranges.slice().sort((a, b) => a.s - b.s);

    setCursorPositions(
      sorted.slice().flatMap<CursorPosition>((range, index) => {
        return [
          {
            pos: range.s,
            type: "s",
            index,
          },
          {
            pos: range.e,
            type: "e",
            index,
          },
        ];
      })
    );

    _setTextRanges(
      sorted.map((range, index) => {
        return {
          ...range,
          index,
        };
      })
    );
  };

  const setNewLineRange = (s: number, e: number) => {
    _setLineRange({
      s,
      e,
    });
  };

  const setIsDragging = (isDragging: boolean) => {
    _setIsDragging(isDragging);
  };

  const setActivatedRange = (
    rangeIndex: number[],
    isGap: boolean,
    overlapped: boolean
  ) => {
    setActivatedObject({
      ...activatedObject,
      rangeIndex,
      isGap,
      overlapped,
      status: "activated",
    });
  };

  // 整个文本的切分计算
  useEffect(() => {
    // 第一步：将区间按重叠切割
    const overLapped = toOverLappedTextRanges(Array.from(textRanges));
    // console.log({ overLapped });
    // 第二步：填充
    const _gapFilled = fillGaps(overLapped, charCount);
    // console.log({ _gapFilled });
    setGapFilled(_gapFilled);
  }, [textRanges, charCount]);

  // 窗口的切分计算
  useEffect(() => {
    if (!lineRange || gapFilled.length === 0) return;

    console.log({ lineRange, gapFilled });

    // 窗口过滤

    const _byLine = splitRangesByLine(
      gapFilled,
      LineCharCount,
      lineRange.s,
      lineRange.e
    );

    console.log({ _byLine });

    setByLine(_byLine);
  }, [gapFilled, lineRange]);

  return (
    <NewTRSContext.Provider
      value={{
        charCount,
        fullText,
        byLine,
        textRanges,
        cursorPositions,
        isDragging,
        activatedObject,
        setCharCount,
        setFullText,
        setTextRanges,
        setNewLineRange,
        setIsDragging,
        setActivatedRange,
      }}
    >
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      {/* debugger */}
      {createPortal(
        <div className="absolute top-0 right-0 bg-gray-100 p-2 text-sm">
          字符长度: <p>{charCount}</p>
          激活范围: <pre>{JSON.stringify(activatedObject, null, 2)}</pre>
          {/* Range分段: <pre>{JSON.stringify(textRanges, null, 2)}</pre> */}
          {/* Cursors: <pre>{JSON.stringify(cursorPositions, null, 2)}</pre> */}
          正在拖动: <p>{isDragging ? "是" : "否"}</p>
        </div>,
        document.body
      )}
    </NewTRSContext.Provider>
  );
};