import { Fragment, useContext } from "react";
import { RangeContext, SplittedByLineTextRange } from "../context/RangeContext";
import { CursorGhost } from "./components/CursorGhost";

const DndDragLayer = ({ parts }: { parts: SplittedByLineTextRange[] }) => {
  // TODO: 注意这一层只负责 Cursor 的拖动， 因此 所有文字是透明的并且不响应事件
  const { activatedObject } = useContext(RangeContext);

  return (
    <>
      {parts.map((part, index) => {
        return (
          <Fragment key={index}>
            {activatedObject?.activatedRange &&
              activatedObject.activatedRange.s === part.s && (
                <CursorGhost
                  pos={{
                    index: activatedObject.index,
                    type: "s",
                    pos: part.s,
                  }}
                />
              )}
            <span className="text-transparent">{part.text}</span>
            {activatedObject?.activatedRange &&
              activatedObject.activatedRange.e === part.e && (
                <CursorGhost
                  pos={{
                    index: activatedObject.index,
                    type: "e",
                    pos: part.e,
                  }}
                />
              )}
          </Fragment>
        );
      })}
    </>
  );
};

export default DndDragLayer;
